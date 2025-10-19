<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Reminder;
use Illuminate\Support\Facades\Log;

class RemindersController extends Controller
{
    // list reminders for current user
    public function index(Request $request)
    {
        $user = $request->get('auth_user');
        if (!$user) return response()->json(['error'=>'unauthorized'], 401);
        $items = Reminder::where('user_id', $user->id)->orderBy('scheduled_at', 'asc')->get();
        return response()->json($items);
    }

    // create a reminder
    public function store(Request $request)
    {
        $user = $request->get('auth_user');
        if (!$user) return response()->json(['error'=>'unauthorized'], 401);
        $data = $request->only(['type','title','note','scheduled_at','interval_minutes','enabled','metadata']);
        // validate scheduled_at if provided
        if (!empty($data['scheduled_at'])) {
            try {
                // normalize/parse via Carbon
                $dt = \Carbon\Carbon::parse($data['scheduled_at']);
                $data['scheduled_at'] = $dt->toIso8601String();
            } catch (\Exception $ex) {
                return response()->json(['error' => 'invalid_scheduled_at', 'message' => 'Could not parse scheduled_at; use ISO or YYYY-MM-DD HH:MM'], 422);
            }
        }
        $data['user_id'] = $user->id;
        $rem = Reminder::create($data);
        return response()->json($rem, 201);
    }

    // update a reminder
    public function update(Request $request, $id)
    {
        $user = $request->get('auth_user');
        if (!$user) return response()->json(['error'=>'unauthorized'], 401);
        $rem = Reminder::where('id', $id)->where('user_id', $user->id)->firstOrFail();
        $rem->fill($request->only(['title','note','scheduled_at','interval_minutes','enabled','metadata']));
        $rem->save();
        return response()->json($rem);
    }

    // delete
    public function destroy(Request $request, $id)
    {
        $user = $request->get('auth_user');
        if (!$user) return response()->json(['error'=>'unauthorized'], 401);
        $rem = Reminder::where('id', $id)->where('user_id', $user->id)->firstOrFail();
        $rem->delete();
        return response()->json(['deleted' => true]);
    }

    // snooze a reminder by minutes
    public function snooze(Request $request, $id)
    {
        $user = $request->get('auth_user');
        if (!$user) return response()->json(['error'=>'unauthorized'], 401);
        $minutes = intval($request->input('minutes', 15));
        $rem = Reminder::where('id', $id)->where('user_id', $user->id)->firstOrFail();
        $rem->snooze_until = time() + ($minutes * 60);
        $rem->save();
        return response()->json($rem);
    }

    // mark a reminder as missed (increment counter)
    public function missed(Request $request, $id)
    {
        $user = $request->get('auth_user');
        if (!$user) return response()->json(['error'=>'unauthorized'], 401);
        $rem = Reminder::where('id', $id)->where('user_id', $user->id)->firstOrFail();
        $rem->missed_count = ($rem->missed_count ?? 0) + 1;
        $rem->save();
        return response()->json($rem);
    }

    // simple stats for smart reminders
    public function stats(Request $request)
    {
        $user = $request->get('auth_user');
        if (!$user) return response()->json(['error'=>'unauthorized'], 401);
        $total = Reminder::where('user_id', $user->id)->count();
        $missed = Reminder::where('user_id', $user->id)->sum('missed_count');
        return response()->json(['total' => $total, 'missed' => $missed]);
    }
}
