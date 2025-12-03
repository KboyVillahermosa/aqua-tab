<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Insight;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class InsightController extends Controller
{
    public function index(Request $request)
    {
        $userId = Auth::id();
        $type = $request->query('type');

        $insights = Insight::where('user_id', $userId)
            ->when($type, fn($q) => $q->where('type', $type))
            ->orderByDesc('generated_at')
            ->limit(50)
            ->get();

        return response()->json(['data' => $insights]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'type' => 'required|string',
            'payload' => 'required|array',
            'title' => 'required|string',
            'description' => 'nullable|string',
            'generated_at' => 'required|date',
        ]);

        $validated['user_id'] = Auth::id();

        $insight = Insight::create($validated);

        return response()->json(['data' => $insight], 201);
    }
}
