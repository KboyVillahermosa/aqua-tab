<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Medication;
use App\Models\MedicationHistory;
use Illuminate\Support\Facades\Log;

class MedicationController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $meds = Medication::where('user_id', $user->id)->get();
        return response()->json($meds);
    }

    public function store(Request $request)
    {
        $user = $request->user();
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'dosage' => 'nullable|string|max:100',
            'times' => 'nullable|array',
            'times.*' => 'date',
            'reminder' => 'boolean',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after:start_date',
            'frequency' => 'nullable|string|in:daily,weekly,monthly,custom',
            'days_of_week' => 'nullable|array',
            'days_of_week.*' => 'integer|between:0,6',
            'notes' => 'nullable|string|max:500',
            'color' => 'nullable|string|max:7',
        ]);
        
        // Check subscription limits
        $plan = $user->currentSubscriptionPlan;
        if ($plan && $plan->max_medications !== null) {
            $currentCount = Medication::where('user_id', $user->id)->count();
            if ($currentCount >= $plan->max_medications) {
                return response()->json([
                    'message' => "You've reached the medication limit for your plan ({$plan->max_medications} medications). Upgrade to Premium for unlimited medications.",
                    'limit_reached' => true,
                    'current_limit' => $plan->max_medications,
                    'plan_name' => $plan->name,
                ], 403);
            }
        }
        
        $data['user_id'] = $user->id;
        
        // Set default values
        $data['reminder'] = $data['reminder'] ?? true;
        $data['frequency'] = $data['frequency'] ?? 'daily';
        $data['start_date'] = $data['start_date'] ?? now()->toDateString();
        $data['color'] = $data['color'] ?? '#1E3A8A';
        
        $med = Medication::create($data);
        Log::debug('Medication created', ['medication_id' => $med->id, 'user_id' => $user->id]);
        
        return response()->json($med, 201);
    }

    public function show(Request $request, Medication $medication)
    {
        return response()->json($medication);
    }

    public function update(Request $request, Medication $medication)
    {
        $this->authorizeForUser($request->user(), 'update', $medication);
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'dosage' => 'nullable|string|max:100',
            'times' => 'nullable|array',
            'times.*' => 'date',
            'reminder' => 'boolean',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after:start_date',
            'frequency' => 'nullable|string|in:daily,weekly,monthly,custom',
            'days_of_week' => 'nullable|array',
            'days_of_week.*' => 'integer|between:0,6',
            'notes' => 'nullable|string|max:500',
            'color' => 'nullable|string|max:7',
        ]);
        $medication->update($data);
        Log::debug('Medication updated', ['medication_id' => $medication->id]);
        return response()->json($medication);
    }

    public function destroy(Request $request, Medication $medication)
    {
        $user = $request->user();
        Log::debug('MedicationController::destroy called', [
            'request_user' => $user ? $user->id : null,
            'medication_id' => $medication->id,
            'medication_owner' => $medication->user_id ?? null,
        ]);

        $this->authorizeForUser($user, 'delete', $medication);
        $medication->delete();
        Log::debug('MedicationController::destroy success', ['medication_id' => $medication->id]);
        return response()->json(null, 204);
    }

    public function addHistory(Request $request, Medication $medication)
    {
        $this->authorizeForUser($request->user(), 'view', $medication);
        $data = $request->validate([
            'status' => 'required|string',
            'time' => 'required|date',
        ]);
        
        // Check for duplicate entries within a 2-hour window of the scheduled time
        // Prevent duplicates for the same scheduled time, regardless of status
        $scheduledTime = \Carbon\Carbon::parse($data['time']);
        $twoHoursBefore = $scheduledTime->copy()->subHours(2);
        $twoHoursAfter = $scheduledTime->copy()->addHours(2);
        
        // Check for any existing entry (completed or skipped) for this time window
        $existingEntry = MedicationHistory::where('medication_id', $medication->id)
            ->whereBetween('time', [$twoHoursBefore, $twoHoursAfter])
            ->whereIn('status', ['completed', 'skipped'])
            ->first();
        
        if ($existingEntry) {
            // If trying to mark as completed but already marked as skipped, allow update
            if ($data['status'] === 'completed' && $existingEntry->status === 'skipped') {
                $existingEntry->update(['status' => 'completed', 'time' => $data['time']]);
                return response()->json($existingEntry->fresh(), 200);
            }
            // If trying to mark as skipped but already marked as completed, don't allow
            if ($data['status'] === 'skipped' && $existingEntry->status === 'completed') {
                return response()->json([
                    'message' => 'This medication has already been marked as completed for this scheduled time',
                    'existing_entry' => $existingEntry
                ], 409);
            }
            // Same status - duplicate
            return response()->json([
                'message' => 'An entry already exists for this scheduled time',
                'existing_entry' => $existingEntry
            ], 409); // Conflict status
        }
        
        $hist = MedicationHistory::create([
            'medication_id' => $medication->id,
            'status' => $data['status'],
            'time' => $data['time'],
        ]);
        return response()->json($hist, 201);
    }

    public function history(Request $request, Medication $medication)
    {
        $this->authorizeForUser($request->user(), 'view', $medication);
        return response()->json($medication->history()->orderBy('time', 'desc')->get());
    }

    public function getUpcoming(Request $request)
    {
        $user = $request->user();
        $medications = Medication::where('user_id', $user->id)
            ->where('reminder', true)
            ->get();

        $upcoming = [];
        foreach ($medications as $med) {
            $times = $med->times ?? [];
            foreach ($times as $time) {
                $nextTime = $this->calculateNextReminderTime($time, $med);
                if ($nextTime) {
                    $upcoming[] = [
                        'medication' => $med,
                        'next_reminder' => $nextTime,
                        'time_string' => $time,
                    ];
                }
            }
        }

        // Sort by next reminder time
        usort($upcoming, function($a, $b) {
            return strtotime($a['next_reminder']) - strtotime($b['next_reminder']);
        });

        return response()->json($upcoming);
    }

    private function calculateNextReminderTime($timeString, $medication)
    {
        $today = now();
        $time = \Carbon\Carbon::parse($timeString);
        
        // Set today's date with the medication time
        $nextReminder = $today->copy()->setTime($time->hour, $time->minute, $time->second);
        
        // If the time has already passed today, move to tomorrow
        if ($nextReminder->isPast()) {
            $nextReminder->addDay();
        }

        // Check if medication has end date
        if ($medication->end_date && $nextReminder->gt($medication->end_date)) {
            return null;
        }

        return $nextReminder->toISOString();
    }

    public function getStats(Request $request)
    {
        $user = $request->user();
        $medications = Medication::where('user_id', $user->id)->get();
        
        $stats = [
            'total_medications' => $medications->count(),
            'active_medications' => $medications->where('reminder', true)->count(),
            'total_reminders_today' => 0,
            'completed_today' => 0,
            'missed_today' => 0,
        ];

        $today = now()->toDateString();
        $now = now();
        
        foreach ($medications as $med) {
            if (!$med->reminder) continue;
            
            $times = $med->times ?? [];
            $stats['total_reminders_today'] += count($times);
            
            // Count completed and missed for today
            $history = $med->history()
                ->whereDate('time', $today)
                ->get();
                
            $stats['completed_today'] += $history->where('status', 'completed')->count();
            $stats['missed_today'] += $history->where('status', 'skipped')->count();
            
            // Auto-mark missed medications that have passed their scheduled time
            foreach ($times as $timeStr) {
                $scheduledTime = \Carbon\Carbon::parse($timeStr);
                $todayScheduledTime = $now->copy()->setTime($scheduledTime->hour, $scheduledTime->minute, $scheduledTime->second);
                
                // If scheduled time has passed (more than 30 minutes ago) and it's still today
                $thirtyMinutesAgo = $now->copy()->subMinutes(30);
                if ($todayScheduledTime->isBefore($thirtyMinutesAgo) && $todayScheduledTime->isToday()) {
                    // Check if already marked
                    $twoHoursBefore = $todayScheduledTime->copy()->subHours(2);
                    $twoHoursAfter = $todayScheduledTime->copy()->addHours(2);
                    
                    $existingEntry = MedicationHistory::where('medication_id', $med->id)
                        ->whereBetween('time', [$twoHoursBefore, $twoHoursAfter])
                        ->whereIn('status', ['completed', 'skipped'])
                        ->first();
                    
                    if (!$existingEntry) {
                        // Auto-mark as missed
                        MedicationHistory::create([
                            'medication_id' => $med->id,
                            'status' => 'skipped',
                            'time' => $todayScheduledTime,
                        ]);
                        $stats['missed_today']++;
                    }
                }
            }
        }

        return response()->json($stats);
    }

    /**
     * Get admin statistics for medication management
     */
    public function getAdminStats(Request $request)
    {
        $days = (int) $request->query('days', 30);
        if (!in_array($days, [7, 30, 90])) {
            $days = 30;
        }

        try {
            $startDate = now()->subDays($days);
            
            // Get all medications
            $totalMedications = Medication::count();
            $activeMedications = Medication::where('reminder', true)->count();
            
            // Calculate adherence rate
            $totalHistory = MedicationHistory::where('created_at', '>=', $startDate)->count();
            $takenHistory = MedicationHistory::where('created_at', '>=', $startDate)
                ->where('status', 'completed')
                ->count();
            $adherenceRate = $totalHistory > 0 ? round(($takenHistory / $totalHistory) * 100, 1) : 0;
            
            // Count upcoming doses (medications scheduled for today)
            $upcomingDoses = 0;
            $medications = Medication::where('reminder', true)->get();
            foreach ($medications as $med) {
                $times = $med->times ?? [];
                $upcomingDoses += count($times);
            }
            
            // Count missed doses
            $missedDoses = MedicationHistory::where('created_at', '>=', $startDate)
                ->where('status', 'skipped')
                ->count();
            
            // Medication types distribution
            $medicationTypes = Medication::selectRaw('name, COUNT(*) as count')
                ->groupBy('name')
                ->orderBy('count', 'desc')
                ->limit(10)
                ->get()
                ->map(function ($item) {
                    return [
                        'type' => $item->name,
                        'count' => $item->count
                    ];
                });
            
            // Weekly adherence trend
            $weeklyTrend = [];
            $weeks = ceil($days / 7);
            for ($w = $weeks - 1; $w >= 0; $w--) {
                $weekStart = now()->subWeeks($w)->startOfWeek();
                $weekEnd = now()->subWeeks($w)->endOfWeek();
                
                $weekTotal = MedicationHistory::whereBetween('created_at', [$weekStart, $weekEnd])->count();
                $weekTaken = MedicationHistory::whereBetween('created_at', [$weekStart, $weekEnd])
                    ->where('status', 'completed')
                    ->count();
                
                $weekAdherence = $weekTotal > 0 ? round(($weekTaken / $weekTotal) * 100, 1) : 0;
                
                $weeklyTrend[] = [
                    'week' => $weekStart->format('M j'),
                    'adherence_rate' => $weekAdherence
                ];
            }
            
            // Recent medication history
            $recentHistory = MedicationHistory::with(['medication.user'])
                ->orderBy('created_at', 'desc')
                ->limit(10)
                ->get()
                ->map(function ($entry) {
                    return [
                        'user_name' => $entry->medication->user->name ?? 'Unknown User',
                        'medication_name' => $entry->medication->name ?? 'Unknown Medication',
                        'dosage' => $entry->medication->dosage ?? '',
                        'status' => $entry->status,
                        'scheduled_time' => $entry->created_at->toISOString(),
                        'taken_time' => $entry->status === 'completed' ? $entry->created_at->toISOString() : null
                    ];
                });

            return response()->json([
                'active_medications' => $activeMedications,
                'adherence_rate' => $adherenceRate,
                'upcoming_doses' => $upcomingDoses,
                'missed_doses' => $missedDoses,
                'taken_count' => $takenHistory,
                'missed_count' => $missedDoses,
                'snoozed_count' => 0, // Not implemented yet
                'medication_types' => $medicationTypes,
                'weekly_adherence' => $weeklyTrend,
                'recent_history' => $recentHistory
            ]);

        } catch (\Exception $e) {
            Log::error('Medication admin stats error', ['error' => $e->getMessage()]);
            return response()->json([
                'active_medications' => 0,
                'adherence_rate' => 0,
                'upcoming_doses' => 0,
                'missed_doses' => 0,
                'taken_count' => 0,
                'missed_count' => 0,
                'snoozed_count' => 0,
                'medication_types' => [],
                'weekly_adherence' => [],
                'recent_history' => []
            ], 500);
        }
    }

    /**
     * Export medication history as CSV
     */
    public function exportCsv(Request $request)
    {
        $user = $request->user();
        
        // Check if user has data_export feature
        if (!$user->canAccessFeature('data_export')) {
            return response()->json([
                'message' => 'Data export is only available for Premium subscribers. Please upgrade to export your medication history.',
                'requires_premium' => true,
            ], 403);
        }

        $medications = Medication::where('user_id', $user->id)->with('history')->get();
        
        $csvData = [];
        $csvData[] = ['Medication Name', 'Dosage', 'Scheduled Time', 'Status', 'Date'];
        
        foreach ($medications as $medication) {
            foreach ($medication->history as $history) {
                $csvData[] = [
                    $medication->name,
                    $medication->dosage ?? '',
                    $history->time,
                    $history->status,
                    $history->created_at->format('Y-m-d H:i:s'),
                ];
            }
        }
        
        $filename = 'medication_history_' . date('Y-m-d') . '.csv';
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ];
        
        $output = fopen('php://output', 'w');
        foreach ($csvData as $row) {
            fputcsv($output, $row);
        }
        fclose($output);
        
        return response()->stream(function() use ($csvData) {
            $output = fopen('php://output', 'w');
            foreach ($csvData as $row) {
                fputcsv($output, $row);
            }
            fclose($output);
        }, 200, $headers);
    }

    /**
     * Export medication history as PDF
     */
    public function exportPdf(Request $request)
    {
        $user = $request->user();
        
        // Check if user has data_export feature
        if (!$user->canAccessFeature('data_export')) {
            return response()->json([
                'message' => 'Data export is only available for Premium subscribers. Please upgrade to export your medication history.',
                'requires_premium' => true,
            ], 403);
        }

        $medications = Medication::where('user_id', $user->id)->with('history')->get();
        
        // Generate simple HTML for PDF (can be enhanced with a PDF library like dompdf)
        $html = '<html><head><title>Medication History</title></head><body>';
        $html .= '<h1>Medication History Report</h1>';
        $html .= '<p>Generated on: ' . date('Y-m-d H:i:s') . '</p>';
        $html .= '<p>User: ' . htmlspecialchars($user->name) . '</p>';
        $html .= '<table border="1" cellpadding="5" cellspacing="0" style="width:100%; border-collapse:collapse;">';
        $html .= '<tr><th>Medication Name</th><th>Dosage</th><th>Scheduled Time</th><th>Status</th><th>Date</th></tr>';
        
        foreach ($medications as $medication) {
            foreach ($medication->history as $history) {
                $html .= '<tr>';
                $html .= '<td>' . htmlspecialchars($medication->name) . '</td>';
                $html .= '<td>' . htmlspecialchars($medication->dosage ?? '') . '</td>';
                $html .= '<td>' . htmlspecialchars($history->time) . '</td>';
                $html .= '<td>' . htmlspecialchars($history->status) . '</td>';
                $html .= '<td>' . htmlspecialchars($history->created_at->format('Y-m-d H:i:s')) . '</td>';
                $html .= '</tr>';
            }
        }
        
        $html .= '</table></body></html>';
        
        $filename = 'medication_history_' . date('Y-m-d') . '.html';
        
        // For now, return HTML. In production, use a PDF library like dompdf or tcpdf
        return response($html, 200)
            ->header('Content-Type', 'text/html')
            ->header('Content-Disposition', 'attachment; filename="' . $filename . '"');
    }
}
