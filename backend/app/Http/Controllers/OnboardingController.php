<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class OnboardingController extends Controller
{
    /**
     * Update onboarding data
     */
    public function update(Request $request)
    {
        $user = $request->user();
        
        $data = $request->validate([
            'nickname' => 'nullable|string|max:100',
            'first_medication_time' => 'nullable|date_format:H:i',
            'end_of_day_time' => 'nullable|date_format:H:i',
            'wake_up_time' => 'nullable|date_format:H:i',
            'breakfast_time' => 'nullable|date_format:H:i',
            'lunch_time' => 'nullable|date_format:H:i',
            'dinner_time' => 'nullable|date_format:H:i',
            'climate' => 'nullable|in:hot,temperate,cold',
            'exercise_frequency' => 'nullable|in:rarely,sometimes,regularly,often',
            'weight' => 'nullable|numeric|min:0|max:500',
            'weight_unit' => 'nullable|in:kg,lbs',
            'age' => 'nullable|integer|min:1|max:150',
            'reminder_tone' => 'nullable|string|max:100',
            'notification_permissions_accepted' => 'nullable|boolean',
            'battery_optimization_set' => 'nullable|boolean',
        ]);

        $user->update($data);

        return response()->json([
            'message' => 'Onboarding data updated successfully',
            'user' => $user->fresh(),
        ]);
    }

    /**
     * Complete onboarding
     */
    public function complete(Request $request)
    {
        $user = $request->user();
        
        $user->update([
            'onboarding_completed' => true,
        ]);

        return response()->json([
            'message' => 'Onboarding completed successfully',
            'user' => $user->fresh(),
        ]);
    }

    /**
     * Get onboarding status
     */
    public function status(Request $request)
    {
        $user = $request->user();
        
        return response()->json([
            'onboarding_completed' => $user->onboarding_completed,
            'user' => $user,
        ]);
    }
}
