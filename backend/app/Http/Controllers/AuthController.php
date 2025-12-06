<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\DB;
use Illuminate\Auth\Events\PasswordReset;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6|confirmed',
            'phone' => 'nullable|string|max:20',
            'date_of_birth' => 'nullable|date|before:today',
            'gender' => 'nullable|in:male,female,other',
            'address' => 'nullable|string|max:500',
        ]);

        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => $data['password'], // hashed via cast in model
            'phone' => $data['phone'] ?? null,
            'date_of_birth' => $data['date_of_birth'] ?? null,
            'gender' => $data['gender'] ?? null,
            'address' => $data['address'] ?? null,
        ]);

        // simple token
        $token = Str::random(60);
        $user->forceFill(['api_token' => hash('sha256', $token)])->save();

        return response()->json([
            'token' => $token,
            'user' => $user,
            'onboarding_completed' => $user->onboarding_completed,
        ], 201);
    }

    public function login(Request $request)
    {
        $data = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $data['email'])->first();

        if (!$user || !Hash::check($data['password'], $user->password)) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        $token = Str::random(60);
        $user->forceFill(['api_token' => hash('sha256', $token)])->save();

        return response()->json([
            'token' => $token,
            'user' => $user,
            'onboarding_completed' => $user->onboarding_completed,
        ]);
    }

    public function logout(Request $request)
    {
        $user = $request->user();
        if ($user) {
            $user->forceFill(['api_token' => null])->save();
        }
        return response()->json(['message' => 'Logged out']);
    }

    public function me(Request $request)
    {
        return response()->json($request->user());
    }

    public function update(Request $request)
    {
        $user = $request->user();

        $data = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'email' => 'sometimes|required|email|unique:users,email,' . $user->id,
            'phone' => 'sometimes|nullable|string|max:20',
            'date_of_birth' => 'sometimes|nullable|date',
            'gender' => 'sometimes|nullable|in:male,female,other',
            'address' => 'sometimes|nullable|string|max:500',
            'emergency_contact' => 'sometimes|nullable|string|max:255',
            'emergency_contact_name' => 'sometimes|nullable|string|max:255',
            'emergency_contact_phone' => 'sometimes|nullable|string|max:30',
            'nickname' => 'sometimes|nullable|string|max:255',
            'first_medication_time' => 'sometimes|nullable|string|max:20',
            'end_of_day_time' => 'sometimes|nullable|string|max:20',
            'wake_up_time' => 'sometimes|nullable|string|max:20',
            'breakfast_time' => 'sometimes|nullable|string|max:20',
            'lunch_time' => 'sometimes|nullable|string|max:20',
            'dinner_time' => 'sometimes|nullable|string|max:20',
            'climate' => 'sometimes|nullable|in:hot,temperate,cold',
            'exercise_frequency' => 'sometimes|nullable|in:rarely,sometimes,regularly,often',
            'weight' => 'sometimes|nullable|numeric|min:0|max:1000',
            'weight_unit' => 'sometimes|nullable|in:kg,lbs',
            'age' => 'sometimes|nullable|integer|min:0|max:150',
            'reminder_tone' => 'sometimes|nullable|string|max:100',
            'notification_permissions_accepted' => 'sometimes|nullable|boolean',
            'battery_optimization_set' => 'sometimes|nullable|boolean',
        ]);

        $user->fill($data);
        $user->save();

        return response()->json(['user' => $user]);
    }

    public function forgotPassword(Request $request)
    {
        $request->validate(['email' => 'required|email']);

        // Check if user exists
        $user = User::where('email', $request->email)->first();
        if (!$user) {
            return response()->json([
                'message' => 'If an account exists with this email, you will receive a reset code.'
            ]);
        }

        // Generate a 6-digit OTP code
        $code = rand(100000, 999999);

        // Save the code to database (hashed for security)
        DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $request->email],
            [
                'token' => Hash::make($code),
                'created_at' => now()
            ]
        );

        // In production, you would send this via email
        // Mail::to($user->email)->send(new ResetPasswordMail($code));

        return response()->json([
            'message' => 'Verification code sent to your email.',
            'status' => 'success',
            // ⚠️ DEV MODE: Remove this line in production!
            'debug_otp' => $code
        ]);
    }

    public function resetPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'code' => 'required|string',
            'password' => 'required|min:6|confirmed',
        ]);

        // Find the reset token entry
        $resetEntry = DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->first();

        if (!$resetEntry) {
            return response()->json([
                'message' => 'Invalid or expired reset code.'
            ], 400);
        }

        // Verify the code
        if (!Hash::check($request->code, $resetEntry->token)) {
            return response()->json([
                'message' => 'Invalid reset code.'
            ], 400);
        }

        // Check if the token is expired (15 minutes)
        if (now()->diffInMinutes($resetEntry->created_at) > 15) {
            return response()->json([
                'message' => 'Reset code has expired. Please request a new one.'
            ], 400);
        }

        // Update user password
        $user = User::where('email', $request->email)->first();
        if (!$user) {
            return response()->json([
                'message' => 'User not found.'
            ], 404);
        }

        $user->forceFill([
            'password' => $request->password,
        ])->save();

        // Delete the reset token
        DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->delete();

        event(new PasswordReset($user));

        return response()->json([
            'message' => 'Password has been reset successfully.'
        ]);
    }
}
