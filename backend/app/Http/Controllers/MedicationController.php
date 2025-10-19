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
        
        foreach ($medications as $med) {
            $times = $med->times ?? [];
            $stats['total_reminders_today'] += count($times);
            
            // Count completed and missed for today
            $history = $med->history()
                ->whereDate('time', $today)
                ->get();
                
            $stats['completed_today'] += $history->where('status', 'completed')->count();
            $stats['missed_today'] += $history->where('status', 'skipped')->count();
        }

        return response()->json($stats);
    }
}
