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
            'name' => 'required|string',
            'dosage' => 'nullable|string',
            'times' => 'nullable|array',
            'reminder' => 'boolean',
        ]);
        $data['user_id'] = $user->id;
        $med = Medication::create($data);
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
            'name' => 'required|string',
            'dosage' => 'nullable|string',
            'times' => 'nullable|array',
            'reminder' => 'boolean',
        ]);
        $medication->update($data);
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
}
