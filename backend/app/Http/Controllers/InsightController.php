<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Medication;
use App\Models\MedicationHistory;
use App\Models\HydrationEntry;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class InsightController extends Controller
{
    /**
     * Get weekly report card
     */
    public function weeklyReportCard(Request $request)
    {
        $user = $request->user();
        
        // Check if user has smart_insights feature
        if (!$user->canAccessFeature('smart_insights')) {
            return response()->json([
                'message' => 'Smart insights are only available for Premium subscribers.',
                'requires_premium' => true,
            ], 403);
        }

        $startOfWeek = Carbon::now()->startOfWeek();
        $endOfWeek = Carbon::now()->endOfWeek();

        // Hydration analysis
        $hydrationEntries = HydrationEntry::where('user_id', $user->id)
            ->whereBetween('created_at', [$startOfWeek, $endOfWeek])
            ->get();

        $hydrationGoal = $user->hydration_goal ?? 2000;
        $totalHydration = $hydrationEntries->sum('amount_ml');
        $expectedHydration = $hydrationGoal * 7; // 7 days
        $hydrationPercentage = $expectedHydration > 0 
            ? round(($totalHydration / $expectedHydration) * 100) 
            : 0;

        $hydrationMessage = $hydrationPercentage >= 90 
            ? 'Excellent! You\'re staying well hydrated.'
            : ($hydrationPercentage >= 70 
                ? 'Good progress! Keep it up.'
                : 'Try to drink more water throughout the day.');

        // Medication adherence
        $medications = Medication::where('user_id', $user->id)->get();
        $totalScheduled = 0;
        $totalCompleted = 0;

        foreach ($medications as $medication) {
            $timesPerDay = count($medication->times ?? []);
            $daysInWeek = 7;
            $totalScheduled += $timesPerDay * $daysInWeek;

            $completed = MedicationHistory::where('medication_id', $medication->id)
                ->where('status', 'completed')
                ->whereBetween('time', [$startOfWeek, $endOfWeek])
                ->count();
            
            $totalCompleted += $completed;
        }

        $adherenceRate = $totalScheduled > 0 
            ? round(($totalCompleted / $totalScheduled) * 100) 
            : 0;

        $medicationMessage = $adherenceRate >= 90 
            ? 'Outstanding adherence! You\'re on track.'
            : ($adherenceRate >= 70 
                ? 'Good job! A few improvements could help.'
                : 'Consider setting more reminders to stay consistent.');

        // Overall score (average of hydration and medication)
        $overallScore = round(($hydrationPercentage + $adherenceRate) / 2);

        return response()->json([
            'hydration' => [
                'percentage' => $hydrationPercentage,
                'total_ml' => $totalHydration,
                'goal_ml' => $expectedHydration,
                'message' => $hydrationMessage,
            ],
            'medications' => [
                'adherence_rate' => $adherenceRate,
                'completed' => $totalCompleted,
                'scheduled' => $totalScheduled,
                'message' => $medicationMessage,
            ],
            'overall_score' => $overallScore,
            'week_start' => $startOfWeek->toDateString(),
            'week_end' => $endOfWeek->toDateString(),
        ]);
    }

    /**
     * Pattern detection - identify weak spots
     */
    public function patternDetection(Request $request)
    {
        $user = $request->user();
        
        // Check if user has smart_insights feature
        if (!$user->canAccessFeature('smart_insights')) {
            return response()->json([
                'message' => 'Smart insights are only available for Premium subscribers.',
                'requires_premium' => true,
            ], 403);
        }

        $patterns = [];
        $thirtyDaysAgo = Carbon::now()->subDays(30);

        // Analyze medication patterns
        $medications = Medication::where('user_id', $user->id)->get();
        
        foreach ($medications as $medication) {
            $history = MedicationHistory::where('medication_id', $medication->id)
                ->where('created_at', '>=', $thirtyDaysAgo)
                ->get();

            // Check for day-of-week patterns
            $missedByDay = [];
            $completedByDay = [];

            foreach ($history as $entry) {
                $dayOfWeek = Carbon::parse($entry->time)->dayOfWeek;
                
                if ($entry->status === 'missed' || $entry->status === 'skipped') {
                    $missedByDay[$dayOfWeek] = ($missedByDay[$dayOfWeek] ?? 0) + 1;
                } elseif ($entry->status === 'completed') {
                    $completedByDay[$dayOfWeek] = ($completedByDay[$dayOfWeek] ?? 0) + 1;
                }
            }

            // Find weak days
            $dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            foreach ($missedByDay as $day => $missedCount) {
                $completedCount = $completedByDay[$day] ?? 0;
                $totalCount = $missedCount + $completedCount;
                
                if ($totalCount > 0 && ($missedCount / $totalCount) > 0.3) {
                    $patterns[] = [
                        'type' => 'day_pattern',
                        'medication' => $medication->name,
                        'pattern' => "You usually miss {$medication->name} on {$dayNames[$day]}s.",
                        'day' => $dayNames[$day],
                        'missed_rate' => round(($missedCount / $totalCount) * 100),
                    ];
                }
            }

            // Check for time-of-day patterns
            $missedByHour = [];
            $completedByHour = [];

            foreach ($history as $entry) {
                $hour = Carbon::parse($entry->time)->hour;
                
                if ($entry->status === 'missed' || $entry->status === 'skipped') {
                    $missedByHour[$hour] = ($missedByHour[$hour] ?? 0) + 1;
                } elseif ($entry->status === 'completed') {
                    $completedByHour[$hour] = ($completedByHour[$hour] ?? 0) + 1;
                }
            }

            // Find weak time slots
            foreach ($missedByHour as $hour => $missedCount) {
                $completedCount = $completedByHour[$hour] ?? 0;
                $totalCount = $missedCount + $completedCount;
                
                if ($totalCount > 3 && ($missedCount / $totalCount) > 0.4) {
                    $timeStr = $hour < 12 ? "{$hour}:00 AM" : ($hour === 12 ? "12:00 PM" : ($hour - 12) . ":00 PM");
                    $patterns[] = [
                        'type' => 'time_pattern',
                        'medication' => $medication->name,
                        'pattern' => "You often miss {$medication->name} around {$timeStr}.",
                        'hour' => $hour,
                        'missed_rate' => round(($missedCount / $totalCount) * 100),
                    ];
                }
            }
        }

        return response()->json([
            'patterns' => $patterns,
            'analysis_period' => '30 days',
        ]);
    }

    /**
     * Snooze analyzer - track repeated snoozes and suggest reschedule
     */
    public function snoozeAnalysis(Request $request)
    {
        $user = $request->user();
        
        // Check if user has smart_insights feature
        if (!$user->canAccessFeature('smart_insights')) {
            return response()->json([
                'message' => 'Smart insights are only available for Premium subscribers.',
                'requires_premium' => true,
            ], 403);
        }

        $suggestions = [];
        $sevenDaysAgo = Carbon::now()->subDays(7);

        // Get all notifications that were snoozed
        $snoozedNotifications = DB::table('notifications')
            ->where('user_id', $user->id)
            ->where('status', 'scheduled')
            ->where('created_at', '>=', $sevenDaysAgo)
            ->get();

        // Group by medication and time
        $snoozePatterns = [];

        foreach ($snoozedNotifications as $notification) {
            $data = json_decode($notification->data ?? '{}', true);
            $medicationId = $data['medication_id'] ?? null;
            $scheduledTime = Carbon::parse($notification->scheduled_time);
            $hour = $scheduledTime->hour;
            $minute = $scheduledTime->minute;

            if ($medicationId) {
                $key = "{$medicationId}_{$hour}_{$minute}";
                if (!isset($snoozePatterns[$key])) {
                    $snoozePatterns[$key] = [
                        'medication_id' => $medicationId,
                        'hour' => $hour,
                        'minute' => $minute,
                        'count' => 0,
                        'dates' => [],
                    ];
                }
                $snoozePatterns[$key]['count']++;
                $snoozePatterns[$key]['dates'][] = $scheduledTime->toDateString();
            }
        }

        // Find patterns where same reminder was snoozed 3+ days in a row
        foreach ($snoozePatterns as $pattern) {
            if ($pattern['count'] >= 3) {
                $uniqueDates = array_unique($pattern['dates']);
                sort($uniqueDates);
                
                // Check for consecutive days
                $consecutive = 1;
                $maxConsecutive = 1;
                for ($i = 1; $i < count($uniqueDates); $i++) {
                    $prev = Carbon::parse($uniqueDates[$i - 1]);
                    $curr = Carbon::parse($uniqueDates[$i]);
                    if ($curr->diffInDays($prev) === 1) {
                        $consecutive++;
                        $maxConsecutive = max($maxConsecutive, $consecutive);
                    } else {
                        $consecutive = 1;
                    }
                }

                if ($maxConsecutive >= 3) {
                    $medication = Medication::find($pattern['medication_id']);
                    if ($medication) {
                        $currentTime = sprintf('%02d:%02d', $pattern['hour'], $pattern['minute']);
                        $suggestedMinute = $pattern['minute'] + 30;
                        $suggestedHour = $pattern['hour'];
                        if ($suggestedMinute >= 60) {
                            $suggestedMinute -= 60;
                            $suggestedHour = ($suggestedHour + 1) % 24;
                        }
                        $suggestedTime = sprintf('%02d:%02d', $suggestedHour, $suggestedMinute);
                        
                        $suggestions[] = [
                            'medication_id' => $pattern['medication_id'],
                            'medication_name' => $medication->name,
                            'current_time' => $currentTime,
                            'suggested_time' => $suggestedTime,
                            'message' => "You often snooze {$medication->name} at {$currentTime}. Move this reminder to {$suggestedTime}?",
                            'snooze_count' => $pattern['count'],
                            'consecutive_days' => $maxConsecutive,
                        ];
                    }
                }
            }
        }

        return response()->json([
            'suggestions' => $suggestions,
            'analysis_period' => '7 days',
        ]);
    }
}

