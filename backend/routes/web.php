<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AdminController;

// Simple API status route for web access
Route::get('/', function () {
    return response()->json([
        'message' => 'Aqua API Backend',
        'status' => 'active',
        'version' => '1.0.0'
    ]);
});

// Provide a global `login` route so auth middleware can redirect unauthenticated users.
// We redirect to the admin login form by default.
Route::get('login', function () {
    return redirect()->route('admin.login');
})->name('login');

// Admin routes (for web-based admin panel)
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
        Route::get('users', [AdminController::class, 'index'])->name('users.index');
        Route::get('users/create', [AdminController::class, 'createUser'])->name('users.create');
        Route::post('users', [AdminController::class, 'storeUser'])->name('users.store');
        Route::get('users/{user}', [AdminController::class, 'showUser'])->name('users.show');
        Route::get('users/{user}/edit', [AdminController::class, 'editUser'])->name('users.edit');
        Route::put('users/{user}', [AdminController::class, 'updateUser'])->name('users.update');
        Route::delete('users/{user}', [AdminController::class, 'deleteUser'])->name('users.destroy');
        
        // Health module management
        Route::get('hydration', [AdminController::class, 'hydration'])->name('hydration.index');
        Route::get('medication', [AdminController::class, 'medication'])->name('medication.index');
        Route::get('notifications', [AdminController::class, 'notifications'])->name('notifications.index');
    });
});
