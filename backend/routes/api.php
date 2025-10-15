<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Models\User;

Route::post('register', [AuthController::class, 'register']);
Route::post('login', [AuthController::class, 'login']);

// simple token guard middleware inline: expects header 'Authorization: Bearer {token}'
Route::middleware([\App\Http\Middleware\TokenAuth::class])->group(function () {
    Route::post('logout', [AuthController::class, 'logout']);
    Route::get('me', [AuthController::class, 'me']);
    // Medication endpoints
    Route::get('medications', [App\Http\Controllers\MedicationController::class, 'index']);
    Route::post('medications', [App\Http\Controllers\MedicationController::class, 'store']);
    Route::get('medications/{medication}', [App\Http\Controllers\MedicationController::class, 'show']);
    Route::put('medications/{medication}', [App\Http\Controllers\MedicationController::class, 'update']);
    Route::delete('medications/{medication}', [App\Http\Controllers\MedicationController::class, 'destroy']);
    Route::post('medications/{medication}/history', [App\Http\Controllers\MedicationController::class, 'addHistory']);
    Route::get('medications/{medication}/history', [App\Http\Controllers\MedicationController::class, 'history']);

        // Hydration endpoints
        Route::get('hydration', [App\Http\Controllers\HydrationController::class, 'index']);
        Route::post('hydration', [App\Http\Controllers\HydrationController::class, 'add']);
        Route::post('hydration/goal', [App\Http\Controllers\HydrationController::class, 'setGoal']);
        Route::get('hydration/history', [App\Http\Controllers\HydrationController::class, 'history']);
        Route::post('hydration/missed', [App\Http\Controllers\HydrationController::class, 'missed']);
});

// If the app doesn't have the middleware registered, add a fallback route to demonstrate
Route::get('ping', function () {
    return response()->json(['pong' => true]);
});
