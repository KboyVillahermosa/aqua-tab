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
});


Route::get('ping', function () {
    return response()->json(['pong' => true]);
});
