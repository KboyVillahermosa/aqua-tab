<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AdminController;

Route::get('/', function () {
    return view('welcome');
});

// Admin routes
Route::prefix('admin')->name('admin.')->group(function () {
    // Guest admin routes (login form)
    Route::middleware('guest')->group(function () {
        Route::get('login', [AdminController::class, 'showLoginForm'])->name('login');
        Route::post('login', [AdminController::class, 'login']);
    });

    // Authenticated admin routes
    Route::middleware(['auth', \App\Http\Middleware\AdminMiddleware::class])->group(function () {
        Route::get('dashboard', [AdminController::class, 'dashboard'])->name('dashboard');
        Route::post('logout', [AdminController::class, 'logout'])->name('logout');
        
        // User management
        Route::get('users/create', [AdminController::class, 'createUser'])->name('users.create');
        Route::post('users', [AdminController::class, 'storeUser'])->name('users.store');
        Route::get('users/{user}/edit', [AdminController::class, 'editUser'])->name('users.edit');
        Route::put('users/{user}', [AdminController::class, 'updateUser'])->name('users.update');
        Route::delete('users/{user}', [AdminController::class, 'deleteUser'])->name('users.destroy');
    });
});
