<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class OnboardingController extends Controller
{
    /**
     * Get onboarding data for the authenticated user
     */
    public function show(Request $request)
    {
        try {
            $user = $request->user();

            $data = [
                'name' => $user->name,
                'nickname' => $user->nickname,
                'email' => $user->email,
                'age' => $user->age,
                'first_medication_time' => $user->first_medication_time,
                'end_of_day_time' => $user->end_of_day_time,
                'wake_up_time' => $user->wake_up_time,
                'breakfast_time' => $user->breakfast_time,
                'lunch_time' => $user->lunch_time,
                'dinner_time' => $user->dinner_time,
                'climate' => $user->climate,
                'exercise_frequency' => $user->exercise_frequency,
                'weight' => $user->weight,
                'weight_unit' => $user->weight_unit,
                'reminder_tone' => $user->reminder_tone,
                'notification_permissions_accepted' => $user->notification_permissions_accepted,
                'battery_optimization_set' => $user->battery_optimization_set,
                'emergency_contact' => $user->emergency_contact,
                'emergency_contact_name' => $user->emergency_contact_name,
                'emergency_contact_phone' => $user->emergency_contact_phone,
                'emergencyContact' => [
                    'name' => $user->emergency_contact_name,
                    'phone' => $user->emergency_contact_phone,
                ],
            ];

            return response()->json(['data' => $data], 200);
        } catch (\Throwable $e) {
            return response()->json([
                'message' => 'Failed to load onboarding data',
                'error' => app()->environment('production') ? null : $e->getMessage(),
            ], 500);
        }
    }

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
            'emergency_contact' => 'nullable|string|max:255',
            'emergency_contact_name' => 'nullable|string|max:255',
            'emergency_contact_phone' => 'nullable|string|max:50',
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
