<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Models\User;

Route::post('register', [AuthController::class, 'register']);
Route::post('login', [AuthController::class, 'login']);

// Public subscription plans endpoint
Route::get('subscription/plans', [App\Http\Controllers\SubscriptionController::class, 'plans']);

// Admin endpoints (no auth required for admin panel)
Route::get('hydration/stats', [App\Http\Controllers\HydrationController::class, 'stats']);
Route::get('medications/stats', [App\Http\Controllers\MedicationController::class, 'getAdminStats']);
Route::get('notifications/stats', [App\Http\Controllers\NotificationController::class, 'getAdminStats']);
Route::get('admin/dashboard-stats', [App\Http\Controllers\AdminController::class, 'getDashboardStats']);

// simple token guard middleware inline: expects header 'Authorization: Bearer {token}'
Route::middleware([\App\Http\Middleware\TokenAuth::class])->group(function () {
    Route::post('logout', [AuthController::class, 'logout']);
    Route::get('me', [AuthController::class, 'me']);
    
    // Onboarding endpoints
    Route::get('onboarding/status', [App\Http\Controllers\OnboardingController::class, 'status']);
    Route::put('onboarding/update', [App\Http\Controllers\OnboardingController::class, 'update']);
    Route::post('onboarding/complete', [App\Http\Controllers\OnboardingController::class, 'complete']);
    // Medication endpoints
    Route::get('medications', [App\Http\Controllers\MedicationController::class, 'index']);
    Route::post('medications', [App\Http\Controllers\MedicationController::class, 'store']);
    Route::get('medications/upcoming', [App\Http\Controllers\MedicationController::class, 'getUpcoming']);
    Route::get('medications/stats', [App\Http\Controllers\MedicationController::class, 'getStats']);
    Route::get('medications/{medication}', [App\Http\Controllers\MedicationController::class, 'show']);
    Route::put('medications/{medication}', [App\Http\Controllers\MedicationController::class, 'update']);
    Route::delete('medications/{medication}', [App\Http\Controllers\MedicationController::class, 'destroy']);
    Route::post('medications/{medication}/history', [App\Http\Controllers\MedicationController::class, 'addHistory']);
    Route::get('medications/{medication}/history', [App\Http\Controllers\MedicationController::class, 'history']);
    Route::get('medications/export/csv', [App\Http\Controllers\MedicationController::class, 'exportCsv']);
    Route::get('medications/export/pdf', [App\Http\Controllers\MedicationController::class, 'exportPdf']);

    // Smart Insights endpoints (Premium)
    Route::get('insights/weekly-report', [App\Http\Controllers\InsightController::class, 'weeklyReportCard']);
    Route::get('insights/patterns', [App\Http\Controllers\InsightController::class, 'patternDetection']);
    Route::get('insights/snooze-analysis', [App\Http\Controllers\InsightController::class, 'snoozeAnalysis']);

        // Hydration endpoints
        Route::get('hydration', [App\Http\Controllers\HydrationController::class, 'index']);
        Route::post('hydration', [App\Http\Controllers\HydrationController::class, 'add']);
        Route::post('hydration/goal', [App\Http\Controllers\HydrationController::class, 'setGoal']);
        Route::get('hydration/history', [App\Http\Controllers\HydrationController::class, 'history']);
        Route::post('hydration/missed', [App\Http\Controllers\HydrationController::class, 'missed']);

        // Notification endpoints
        Route::get('notifications', [App\Http\Controllers\NotificationController::class, 'index']);
        Route::get('notifications/today-timeline', [App\Http\Controllers\NotificationController::class, 'getTodayTimeline']);
        Route::post('notifications', [App\Http\Controllers\NotificationController::class, 'store']);
        Route::put('notifications/{notification}', [App\Http\Controllers\NotificationController::class, 'update']);
        Route::delete('notifications/{notification}', [App\Http\Controllers\NotificationController::class, 'destroy']);
        Route::post('notifications/schedule/hydration', [App\Http\Controllers\NotificationController::class, 'scheduleHydration']);
        Route::post('notifications/schedule/medication', [App\Http\Controllers\NotificationController::class, 'scheduleMedication']);
        Route::post('notifications/{notification}/snooze', [App\Http\Controllers\NotificationController::class, 'snooze']);
        Route::post('notifications/{notification}/complete', [App\Http\Controllers\NotificationController::class, 'complete']);
    Route::post('notifications/mark-missed', [App\Http\Controllers\NotificationController::class, 'markMissedNotifications']);
    
    // Subscription endpoints
    Route::get('subscription/current', [App\Http\Controllers\SubscriptionController::class, 'current']);
    Route::post('subscription/subscribe', [App\Http\Controllers\SubscriptionController::class, 'subscribe']);
    Route::post('subscription/cancel', [App\Http\Controllers\SubscriptionController::class, 'cancel']);
    Route::get('subscription/history', [App\Http\Controllers\SubscriptionController::class, 'history']);
    Route::get('subscription/check-feature/{feature}', [App\Http\Controllers\SubscriptionController::class, 'checkFeature']);
});

// If the app doesn't have the middleware registered, add a fallback route to demonstrate
Route::get('ping', function () {
    return response()->json(['pong' => true]);
});
