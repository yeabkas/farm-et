<?php

use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\AnimalController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CropController;
use App\Http\Controllers\Api\MarketController;
use App\Http\Controllers\Api\OnboardingController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\TransactionController;
use Illuminate\Support\Facades\Route;

// ─── Public Routes ────────────────────────────────────────────────────────────
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Market listings are public — no login required to browse
Route::get('/market/listings', [MarketController::class, 'listings']);

// ─── Protected Routes (require Sanctum token) ─────────────────────────────────
Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/email/verify', [AuthController::class, 'verifyEmail']);
    Route::post('/email/resend', [AuthController::class, 'resendOtp']);

    // Onboarding / Farm Profile
    Route::post('/onboarding', [OnboardingController::class, 'store']);
    Route::put('/onboarding', [OnboardingController::class, 'update']);
    Route::get('/onboarding', [OnboardingController::class, 'show']);

    // Transactions
    Route::apiResource('transactions', TransactionController::class);

    // Livestock
    Route::apiResource('animals', AnimalController::class);

    // Plantings
    Route::apiResource('crops', CropController::class);

    // Financial Reports
    Route::get('/reports/summary', [ReportController::class, 'summary']);
    Route::get('/reports/cash-flow', [ReportController::class, 'cashFlow']);

    // Admin routes (Restricted to platform administrator)
    Route::get('/admin/users', [AdminController::class, 'users']);
    Route::post('/admin/users', [AdminController::class, 'createAdmin']);
    Route::get('/admin/users/{id}', [AdminController::class, 'showUser']);
    Route::put('/admin/users/{id}/revoke', [AdminController::class, 'revokeAdmin']);
    Route::put('/admin/users/{id}/promote', [AdminController::class, 'promoteAdmin']);
    Route::put('/admin/users/{id}/reset-password', [AdminController::class, 'resetPassword']);
});
