<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use DateTime;
use DateInterval;
// optional DB model
use App\Models\HydrationEntry;
use App\Models\User;

class HydrationController
{
    protected function storagePath($userId)
    {
        return "hydration/{$userId}.json";
    }

    protected function readData($userId)
    {
        $path = $this->storagePath($userId);
        if (!Storage::exists($path)) {
            return [
                'goal' => 2000,
                'entries' => [], // array of { amount_ml, timestamp, source }
                'missed' => [], // array of timestamps when user missed or ignored a reminder
            ];
        }
        $raw = Storage::get($path);
        $data = json_decode($raw, true);
        if (!is_array($data)) return ['goal' => 2000, 'entries' => [], 'missed' => []];
        return $data;
    }

    protected function writeData($userId, $data)
    {
        $path = $this->storagePath($userId);
        Storage::put($path, json_encode($data, JSON_PRETTY_PRINT));
    }

    /**
     * Calculate ideal hydration goal based on user profile
     * Formula: Base (weight-based) + Age adjustment + Climate adjustment + Exercise adjustment
     */
    protected function calculateIdealGoal($user)
    {
        $baseGoal = 2000; // Default base goal in ml
        
        // Weight-based calculation (30-35ml per kg)
        if ($user->weight) {
            $weightKg = $user->weight;
            if ($user->weight_unit === 'lbs') {
                $weightKg = $user->weight * 0.453592; // Convert lbs to kg
            }
            $baseGoal = $weightKg * 33; // 33ml per kg is a good average
        }
        
        // Age adjustment (older adults need slightly more, but not too much)
        if ($user->age) {
            if ($user->age >= 65) {
                $baseGoal += 200; // Older adults may need slightly more
            } elseif ($user->age < 18) {
                $baseGoal *= 0.85; // Children need less
            }
        }
        
        // Climate adjustment
        if ($user->climate) {
            switch ($user->climate) {
                case 'hot':
                    $baseGoal += 500; // Hot climate needs more hydration
                    break;
                case 'cold':
                    $baseGoal += 100; // Cold climate needs slightly more
                    break;
                case 'temperate':
                default:
                    // No adjustment for temperate
                    break;
            }
        }
        
        // Exercise frequency adjustment
        if ($user->exercise_frequency) {
            switch ($user->exercise_frequency) {
                case 'often':
                    $baseGoal += 600; // Very active people need significantly more
                    break;
                case 'regularly':
                    $baseGoal += 400; // Regular exercisers need more
                    break;
                case 'sometimes':
                    $baseGoal += 200; // Occasional exercisers need a bit more
                    break;
                case 'rarely':
                default:
                    // No adjustment for sedentary lifestyle
                    break;
            }
        }
        
        // Round to nearest 50ml for cleaner numbers
        return round($baseGoal / 50) * 50;
    }

    // GET /api/hydration
    public function index(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }
        
        // Refresh user data to get latest profile info
        $user->refresh();
        
        // Calculate ideal goal based on user profile
        $idealGoal = $this->calculateIdealGoal($user);
        
        // Get current goal from database, fallback to file, then ideal goal
        $goal = $user->hydration_goal ?? null;
        if (!$goal) {
            $file = $this->readData($user->id);
            $goal = $file['goal'] ?? $idealGoal;
            // If no goal set, use ideal and save it
            if (!isset($file['goal']) || $file['goal'] == 2000) {
                $user->hydration_goal = $idealGoal;
                $user->save();
                $goal = $idealGoal;
            }
        }
        
        // If DB model exists, prefer DB for current day's entries
        if (class_exists(HydrationEntry::class)) {
            $today = date('Y-m-d');
            $entries = HydrationEntry::where('user_id', $user->id)
                ->whereDate('created_at', $today)
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($e) { 
                    return [
                        'amount_ml' => (int)$e->amount_ml, 
                        'timestamp' => $e->created_at, 
                        'source' => $e->source ?? 'manual'
                    ]; 
                })
                ->toArray();
            $file = $this->readData($user->id);
            
            // Calculate today's total
            $todayTotal = array_sum(array_column($entries, 'amount_ml'));
            $percentage = $goal > 0 ? round(($todayTotal / $goal) * 100, 1) : 0;
            
            return response()->json([
                'goal' => $goal,
                'ideal_goal' => $idealGoal,
                'entries' => $entries, 
                'missed' => $file['missed'] ?? [],
                'today_total' => $todayTotal,
                'percentage' => $percentage,
                'remaining' => max(0, $goal - $todayTotal)
            ]);
        }
        
        $data = $this->readData($user->id);
        $today = date('Y-m-d');
        $todayEntries = array_filter($data['entries'] ?? [], function($entry) use ($today) {
            return strpos($entry['timestamp'] ?? '', $today) === 0;
        });
        $todayTotal = array_sum(array_column($todayEntries, 'amount_ml'));
        $percentage = $goal > 0 ? round(($todayTotal / $goal) * 100, 1) : 0;
        
        $data['goal'] = $goal;
        $data['ideal_goal'] = $idealGoal;
        $data['today_total'] = $todayTotal;
        $data['percentage'] = $percentage;
        $data['remaining'] = max(0, $goal - $todayTotal);
        
        return response()->json($data);
    }

    // POST /api/hydration
    // body: { amount_ml: number, source?: string }
    public function add(Request $request)
    {
        $user = $request->user();
        if (!$user) return response()->json(['message' => 'Unauthorized'], 401);
        
        $amount = (int) $request->input('amount_ml', 0);
        if ($amount <= 0) {
            return response()->json(['message' => 'Amount must be greater than 0'], 422);
        }
        if ($amount > 5000) {
            return response()->json(['message' => 'Amount cannot exceed 5000ml'], 422);
        }
        
        $source = $request->input('source', 'manual');
        $validSources = ['manual', 'quick', 'custom', 'reminder'];
        if (!in_array($source, $validSources)) {
            $source = 'manual';
        }
        if (class_exists(HydrationEntry::class)) {
            $e = HydrationEntry::create(['user_id' => $user->id, 'amount_ml' => $amount, 'source' => $source, 'created_at' => now()]);
            Log::debug('Hydration add (db)', ['user' => $user->id, 'entry_id' => $e->id]);
            return response()->json(['amount_ml' => (int)$e->amount_ml, 'timestamp' => $e->created_at, 'source' => $e->source], 201);
        }
        $data = $this->readData($user->id);
        $entry = [
            'amount_ml' => $amount,
            'timestamp' => now()->toDateTimeString(),
            'source' => $source,
        ];
        $data['entries'][] = $entry;
        $this->writeData($user->id, $data);
        Log::debug('Hydration add', ['user' => $user->id, 'entry' => $entry]);
        return response()->json($entry, 201);
    }

    // POST /api/hydration/goal
    // body: { goal_ml: number }
    public function setGoal(Request $request)
    {
        $user = $request->user();
        if (!$user) return response()->json(['message' => 'Unauthorized'], 401);
        
        $goal = (int) $request->input('goal_ml', 2000);
        if ($goal <= 0) {
            return response()->json(['message' => 'Goal must be greater than 0'], 422);
        }
        if ($goal < 1000) {
            return response()->json(['message' => 'Goal should be at least 1000ml'], 422);
        }
        if ($goal > 5000) {
            return response()->json(['message' => 'Goal cannot exceed 5000ml'], 422);
        }
        
        // Save to database
        $user->hydration_goal = $goal;
        $user->save();
        
        // Also update file for backward compatibility
        $data = $this->readData($user->id);
        $data['goal'] = $goal;
        $this->writeData($user->id, $data);
        
        Log::debug('Hydration setGoal', ['user' => $user->id, 'goal' => $goal]);
        return response()->json(['goal' => $goal, 'message' => 'Goal updated successfully']);
    }

    // GET /api/hydration/history?range=daily|weekly|monthly&start=YYYY-MM-DD&end=YYYY-MM-DD
    public function history(Request $request)
    {
        $user = $request->user();
        if (!$user) return response()->json(['message' => 'Unauthorized'], 401);
        
        $range = $request->query('range', 'daily');
        if (!in_array($range, ['daily', 'weekly', 'monthly'])) {
            $range = 'daily';
        }
        
        $startDate = $request->query('start');
        $endDate = $request->query('end');
        
        // try DB first
        $entries = [];
        $file = $this->readData($user->id);
        if (class_exists(HydrationEntry::class)) {
            $dbEntries = HydrationEntry::where('user_id', $user->id)
                ->orderBy('created_at', 'desc')
                ->get();
            foreach ($dbEntries as $e) {
                $entries[] = [
                    'amount_ml' => (int)$e->amount_ml, 
                    'timestamp' => $e->created_at, 
                    'source' => $e->source ?? 'manual'
                ];
            }
        } else {
            $entries = $file['entries'] ?? [];
        }
        
        // Group entries by date
        $buckets = [];
        foreach ($entries as $e) {
            $d = date('Y-m-d', strtotime($e['timestamp']));
            if (!isset($buckets[$d])) $buckets[$d] = 0;
            $buckets[$d] += (int)$e['amount_ml'];
        }
        ksort($buckets);
        // build arrays depending on range
        if ($range === 'daily') {
            if ($startDate && $endDate) {
                // Custom date range for calendar
                $out = [];
                $current = new DateTime($startDate);
                $end = new DateTime($endDate);
                
                while ($current <= $end) {
                    $day = $current->format('Y-m-d');
                    $amount = $buckets[$day] ?? 0;
                    $out[] = [
                        'date' => $day, 
                        'amount_ml' => $amount,
                        'is_today' => $day === date('Y-m-d'),
                        'day_name' => $current->format('D')
                    ];
                    $current->add(new DateInterval('P1D'));
                }
                return response()->json($out);
            } else {
                // last 7 days with proper formatting
                $out = [];
                for ($i = 6; $i >= 0; $i--) {
                    $day = date('Y-m-d', strtotime("-{$i} days"));
                    $amount = $buckets[$day] ?? 0;
                    $out[] = [
                        'date' => $day, 
                        'amount_ml' => $amount,
                        'is_today' => $i === 0,
                        'day_name' => date('D', strtotime($day))
                    ];
                }
                return response()->json($out);
            }
        }
        if ($range === 'weekly') {
            // last 8 weeks: sum per week (Mon-Sun)
            $out = [];
            for ($w = 7; $w >= 0; $w--) {
                $start = date('Y-m-d', strtotime("-{$w} weeks Monday"));
                $end = date('Y-m-d', strtotime("-{$w} weeks Sunday"));
                $sum = 0;
                $d = $start;
                while ($d <= $end) {
                    $sum += $buckets[$d] ?? 0;
                    $d = date('Y-m-d', strtotime($d . ' +1 day'));
                }
                $out[] = [
                    'week_start' => $start, 
                    'amount_ml' => $sum,
                    'week_label' => date('M j', strtotime($start))
                ];
            }
            return response()->json($out);
        }
        
        // monthly - last 12 months
        $out = [];
        for ($m = 11; $m >= 0; $m--) {
            $month = date('Y-m', strtotime("-{$m} months"));
            $sum = 0;
            foreach ($buckets as $day => $amt) {
                if (strpos($day, $month) === 0) $sum += $amt;
            }
            $out[] = [
                'month' => $month, 
                'amount_ml' => $sum,
                'month_label' => date('M Y', strtotime($month . '-01'))
            ];
        }
        return response()->json($out);
    }

    // POST /api/hydration/missed
    // body: { timestamp?: string }
    public function missed(Request $request)
    {
        $user = $request->user();
        if (!$user) return response()->json(['message' => 'Unauthorized'], 401);
        $ts = $request->input('timestamp', now()->toDateTimeString());
        $data = $this->readData($user->id);
        $data['missed'][] = $ts;
        $this->writeData($user->id, $data);
        Log::debug('Hydration missed', ['user' => $user->id, 'timestamp' => $ts]);
        return response()->json(['timestamp' => $ts], 201);
    }

    // GET /api/hydration/stats?days=7|30|90
    public function stats(Request $request)
    {
        $days = (int) $request->query('days', 30);
        if (!in_array($days, [7, 30, 90])) {
            $days = 30;
        }

        try {
            // Get total users count
            $totalUsers = \App\Models\User::count();

            // Get hydration data from database
            $startDate = now()->subDays($days);
            
            // Calculate average daily intake per user
            $avgDailyIntake = HydrationEntry::where('created_at', '>=', $startDate)
                ->selectRaw('user_id, DATE(created_at) as date, SUM(amount_ml) as daily_total')
                ->groupBy('user_id', 'date')
                ->get()
                ->avg('daily_total') ?? 0;

            // Calculate goal achievement rate
            $goalAchievementRate = 0;
            if (class_exists(HydrationEntry::class)) {
                $userGoals = [];
                $userAchievements = [];
                
                // Get all users and their goals/achievements
                $users = \App\Models\User::all();
                foreach ($users as $user) {
                    $file = $this->readData($user->id);
                    $goal = $file['goal'] ?? 2000;
                    
                    $dailyTotals = HydrationEntry::where('user_id', $user->id)
                        ->where('created_at', '>=', $startDate)
                        ->selectRaw('DATE(created_at) as date, SUM(amount_ml) as daily_total')
                        ->groupBy('date')
                        ->get();
                    
                    foreach ($dailyTotals as $day) {
                        $achieved = $day->daily_total >= $goal ? 1 : 0;
                        $userAchievements[] = $achieved;
                    }
                }
                
                if (count($userAchievements) > 0) {
                    $goalAchievementRate = round((array_sum($userAchievements) / count($userAchievements)) * 100, 1);
                }
            }

            // Count missed reminders
            $missedReminders = 0;
            $users = \App\Models\User::all();
            foreach ($users as $user) {
                $file = $this->readData($user->id);
                $missedReminders += count($file['missed'] ?? []);
            }

            // Daily intake data for chart
            $dailyIntake = [];
            for ($i = $days - 1; $i >= 0; $i--) {
                $date = now()->subDays($i)->format('Y-m-d');
                $totalAmount = HydrationEntry::whereDate('created_at', $date)
                    ->sum('amount_ml') ?? 0;
                
                $dailyIntake[] = [
                    'date' => $date,
                    'total_amount' => $totalAmount
                ];
            }

            // Weekly trend data
            $weeklyTrend = [];
            $weeks = ceil($days / 7);
            for ($w = $weeks - 1; $w >= 0; $w--) {
                $weekStart = now()->subWeeks($w)->startOfWeek();
                $weekEnd = now()->subWeeks($w)->endOfWeek();
                
                $weekTotal = HydrationEntry::whereBetween('created_at', [$weekStart, $weekEnd])
                    ->sum('amount_ml') ?? 0;
                
                $avgIntake = $weekTotal / 7; // Average per day
                
                $weeklyTrend[] = [
                    'week' => $weekStart->format('M j'),
                    'avg_intake' => round($avgIntake)
                ];
            }

            // Recent entries
            $recentEntries = HydrationEntry::with('user')
                ->orderBy('created_at', 'desc')
                ->limit(10)
                ->get()
                ->map(function ($entry) {
                    $file = $this->readData($entry->user_id);
                    $goal = $file['goal'] ?? 2000;
                    
                    // Handle both Carbon instances and string dates
                    $date = is_string($entry->created_at) ? $entry->created_at : $entry->created_at->format('Y-m-d');
                    
                    return [
                        'user_name' => $entry->user->name ?? 'Unknown User',
                        'total_amount' => $entry->amount_ml,
                        'goal' => $goal,
                        'date' => $date
                    ];
                });

            return response()->json([
                'total_users' => $totalUsers,
                'avg_daily_intake' => round($avgDailyIntake),
                'goal_achievement_rate' => $goalAchievementRate,
                'missed_reminders' => $missedReminders,
                'daily_intake' => $dailyIntake,
                'weekly_trend' => $weeklyTrend,
                'recent_entries' => $recentEntries
            ]);

        } catch (\Exception $e) {
            Log::error('Hydration stats error', ['error' => $e->getMessage()]);
            return response()->json([
                'total_users' => 0,
                'avg_daily_intake' => 0,
                'goal_achievement_rate' => 0,
                'missed_reminders' => 0,
                'daily_intake' => [],
                'weekly_trend' => [],
                'recent_entries' => []
            ], 500);
        }
    }
}
