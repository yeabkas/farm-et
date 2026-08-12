<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\TransactionController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\OnboardingController;
use App\Http\Controllers\Api\AnimalController;
use App\Http\Controllers\Api\CropController;
use App\Http\Controllers\Api\MarketController;

// ─── Public Routes ────────────────────────────────────────────────────────────
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login',    [AuthController::class, 'login']);

// Market listings are public — no login required to browse
Route::get('/market/listings', [MarketController::class, 'listings']);

// ─── Protected Routes (require Sanctum token) ─────────────────────────────────
Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::get('/me',      [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // Onboarding / Farm Profile
    Route::post('/onboarding', [OnboardingController::class, 'store']);
    Route::put('/onboarding',  [OnboardingController::class, 'update']);
    Route::get('/onboarding',  [OnboardingController::class, 'show']);

    // Transactions
    Route::apiResource('transactions', TransactionController::class);

    // Livestock
    Route::apiResource('animals', AnimalController::class);

    // Plantings
    Route::apiResource('crops', CropController::class);

    // Financial Reports
    Route::get('/reports/summary',    [ReportController::class, 'summary']);
    Route::get('/reports/cash-flow',  [ReportController::class, 'cashFlow']);
});
