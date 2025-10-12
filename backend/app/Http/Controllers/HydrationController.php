<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
// optional DB model
use App\Models\HydrationEntry;

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

    // GET /api/hydration
    public function index(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }
        // If DB model exists, prefer DB for current day's entries and goal stored in file
        if (class_exists(HydrationEntry::class)) {
            $today = date('Y-m-d');
            $entries = HydrationEntry::where('user_id', $user->id)
                ->whereDate('created_at', $today)
                ->get()
                ->map(function ($e) { return ['amount_ml' => (int)$e->amount_ml, 'timestamp' => $e->created_at, 'source' => $e->source]; })
                ->toArray();
            $file = $this->readData($user->id);
            return response()->json(['goal' => $file['goal'] ?? 2000, 'entries' => $entries, 'missed' => $file['missed'] ?? []]);
        }
        $data = $this->readData($user->id);
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
            return response()->json(['message' => 'Invalid amount'], 422);
        }
        $source = $request->input('source', 'manual');
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
        if ($goal <= 0) return response()->json(['message' => 'Invalid goal'], 422);
        $data = $this->readData($user->id);
        $data['goal'] = $goal;
        $this->writeData($user->id, $data);
        Log::debug('Hydration setGoal', ['user' => $user->id, 'goal' => $goal]);
        return response()->json(['goal' => $goal]);
    }

    // GET /api/hydration/history?range=daily|weekly|monthly
    public function history(Request $request)
    {
        $user = $request->user();
        if (!$user) return response()->json(['message' => 'Unauthorized'], 401);
        $range = $request->query('range', 'daily');
        // try DB first
        $entries = [];
        $file = $this->readData($user->id);
        if (class_exists(HydrationEntry::class)) {
            $dbEntries = HydrationEntry::where('user_id', $user->id)->get();
            foreach ($dbEntries as $e) {
                $entries[] = ['amount_ml' => (int)$e->amount_ml, 'timestamp' => $e->created_at, 'source' => $e->source];
            }
        } else {
            $entries = $file['entries'];
        }
        $buckets = [];
        foreach ($entries as $e) {
            $d = date('Y-m-d', strtotime($e['timestamp']));
            if (!isset($buckets[$d])) $buckets[$d] = 0;
            $buckets[$d] += (int)$e['amount_ml'];
        }
        ksort($buckets);
        // build arrays depending on range
        if ($range === 'daily') {
            // last 7 days
            $out = [];
            for ($i = 6; $i >= 0; $i--) {
                $day = date('Y-m-d', strtotime("-{$i} days"));
                $out[] = ['date' => $day, 'amount_ml' => $buckets[$day] ?? 0];
            }
            return response()->json($out);
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
                $out[] = ['week_start' => $start, 'amount_ml' => $sum];
            }
            return response()->json($out);
        }
        // monthly
        $out = [];
        for ($m = 11; $m >= 0; $m--) {
            $month = date('Y-m', strtotime("-{$m} months"));
            $sum = 0;
            foreach ($buckets as $day => $amt) {
                if (strpos($day, $month) === 0) $sum += $amt;
            }
            $out[] = ['month' => $month, 'amount_ml' => $sum];
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
}
