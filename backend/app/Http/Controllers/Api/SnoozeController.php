<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SnoozeLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class SnoozeController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'reminder_type' => 'required|string',
            'reminder_key' => 'nullable|string',
            'scheduled_time' => 'nullable|date_format:H:i',
            'snoozed_at' => 'required|date',
            'snooze_minutes' => 'required|integer|min:1|max:120',
        ]);

        $validated['user_id'] = Auth::id();

        $log = SnoozeLog::create($validated);

        return response()->json(['data' => $log], 201);
    }

    public function stats(Request $request)
    {
        $userId = Auth::id();
        $days = (int) $request->query('days', 7);

        $query = SnoozeLog::where('user_id', $userId)
            ->where('snoozed_at', '>=', now()->subDays($days));

        $total = $query->count();
        $byType = $query->selectRaw('reminder_type, COUNT(*) as count')
            ->groupBy('reminder_type')
            ->get();

        return response()->json([
            'total' => $total,
            'byType' => $byType,
        ]);
    }
}
