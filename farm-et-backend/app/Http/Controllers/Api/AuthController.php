<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Illuminate\Support\Facades\Mail;
use App\Mail\OtpVerificationMail;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Register a new user and return an auth token.
     */
    public function register(Request $request)
    {
        $fields = $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|string|email|max:255|unique:users,email',
            'password' => [
                'required',
                'string',
                'confirmed',
                Password::min(8)->letters()->mixedCase()->numbers()->symbols(),
            ],
        ]);

        $otpCode = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        $user = User::create([
            'name'     => $fields['name'],
            'email'    => $fields['email'],
            'password' => Hash::make($fields['password']),
            'otp_code' => $otpCode,
            'otp_expires_at' => now()->addMinutes(30),
        ]);

        Mail::to($user->email)->send(new OtpVerificationMail($otpCode));

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message'      => 'User registered successfully',
            'user'         => new UserResource($user),
            'access_token' => $token,
            'token_type'   => 'Bearer',
        ], 201);
    }

    /**
     * Log in an existing user and return a new auth token.
     */
    public function login(Request $request)
    {
        $fields = $request->validate([
            'email'    => 'required|string|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $fields['email'])->first();

        if (!$user || !Hash::check($fields['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials do not match our records.'],
            ]);
        }

        // Revoke existing tokens if you want single-device login (optional)
        // $user->tokens()->delete();

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message'      => 'Login successful',
            'user'         => new UserResource($user),
            'access_token' => $token,
            'token_type'   => 'Bearer',
        ]);
    }

    /**
     * Log out the authenticated user (revoke current token).
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logged out successfully'
        ]);
    }

    /**
     * Get the authenticated user details.
     */
    public function me(Request $request)
    {
        return new UserResource($request->user());
    }

    /**
     * Verify the user's email address using OTP.
     */
    public function verifyEmail(Request $request)
    {
        $request->validate([
            'otp' => 'required|string',
        ]);

        $user = $request->user();

        if ($user->email_verified_at) {
            return response()->json(['message' => 'Email already verified.'], 400);
        }

        if ($user->otp_code !== $request->otp) {
            return response()->json(['message' => 'Invalid verification code.'], 400);
        }

        if (now()->greaterThan($user->otp_expires_at)) {
            return response()->json(['message' => 'Verification code has expired.'], 400);
        }

        $user->update([
            'email_verified_at' => now(),
            'otp_code' => null,
            'otp_expires_at' => null,
        ]);

        return response()->json(['message' => 'Email verified successfully.']);
    }

    /**
     * Resend the OTP verification email.
     */
    public function resendOtp(Request $request)
    {
        $user = $request->user();

        if ($user->email_verified_at) {
            return response()->json(['message' => 'Email already verified.'], 400);
        }

        $otpCode = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        $user->update([
            'otp_code' => $otpCode,
            'otp_expires_at' => now()->addMinutes(30),
        ]);

        Mail::to($user->email)->send(new OtpVerificationMail($otpCode));

        return response()->json(['message' => 'Verification code resent successfully.']);
    }
}