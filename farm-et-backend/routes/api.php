<?php

use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\AnimalController;
use App\Http\Controllers\Api\AuctionController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BidController;
use App\Http\Controllers\Api\CropController;
use App\Http\Controllers\Api\MarketController;
use App\Http\Controllers\Api\OnboardingController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\TransactionController;
use App\Models\User;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
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

    // Routes that require both authentication AND email verification
    Route::middleware('verified')->group(function () {
        // Onboarding / Farm Profile
        Route::post('/onboarding', [OnboardingController::class, 'store']);
        Route::put('/onboarding', [OnboardingController::class, 'update']);
        Route::get('/onboarding', [OnboardingController::class, 'show']);
    });

    // Auctions
    Route::get('/auctions', [AuctionController::class, 'index']);
    Route::get('/auctions/me', [AuctionController::class, 'myAuctions']);
    Route::post('/auctions', [AuctionController::class, 'store']);
    Route::get('/auctions/{id}', [AuctionController::class, 'show']);
    Route::post('/auctions/{id}/bids', [BidController::class, 'store']);

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

Route::get('/dev/otp', function () {
    $user = User::orderBy('id', 'desc')->first();

    return response()->json([
        'email' => $user ? $user->email : null,
        'otp' => $user ? $user->otp_code : null,
    ]);
});

Route::get('/dev/env', function () {
    return response()->json([
        'default' => config('database.default'),
        'connections' => config('database.connections'),
        'env_db_connection' => env('DB_CONNECTION'),
    ]);
});

Route::get('/dev/testdb', function () {
    try {
        $conn = DB::connection();

        return response()->json([
            'connection_name' => $conn->getName(),
            'driver_name' => $conn->getDriverName(),
            'pdo_driver' => $conn->getPdo()->getAttribute(PDO::ATTR_DRIVER_NAME),
            'schema_grammar' => get_class($conn->getSchemaGrammar()),
            'tables' => $conn->getSchemaBuilder()->getTables(),
        ]);
    } catch (Exception $e) {
        return response()->json([
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString(),
        ], 500);
    }
});

Route::get('/dev/migrate', function () {
    Artisan::call('migrate', ['--force' => true]);

    return response()->json(['output' => Artisan::output()]);
});

Route::get('/cron/resolve-auctions', function () {
    Artisan::call('auctions:resolve');

    return response()->json(['status' => 'success', 'output' => Artisan::output()]);
});
