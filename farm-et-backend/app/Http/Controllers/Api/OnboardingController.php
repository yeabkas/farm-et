<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\FarmProfileResource;
use App\Models\FarmProfile;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class OnboardingController extends Controller
{
    /**
     * Get the authenticated user''s farm profile.
     */
    public function show(Request $request)
    {
        $profile = $request->user()->farmProfile;

        if (!$profile) {
            return response()->json(['message' => 'Farm profile not found'], 404);
        }

        return new FarmProfileResource($profile);
    }

    /**
     * Create the farm profile during onboarding (one per user).
     * Accepts camelCase keys from the frontend.
     */
    public function store(Request $request)
    {
        // Prevent duplicate profiles
        if ($request->user()->farmProfile) {
            return response()->json(
                ['message' => 'Farm profile already exists. Use PUT /api/onboarding to update.'],
                409
            );
        }

        $validated = $request->validate([
            'firstName'  => 'required|string|max:100',
            'lastName'   => 'required|string|max:100',
            'farmName'   => 'required|string|max:255',
            'latitude'   => 'nullable|numeric|min:-90|max:90',
            'longitude'  => 'nullable|numeric|min:-180|max:180',
            'unitSystem' => 'required|in:metric,imperial,us_customary,ethiopian_traditional,mixed',
            'timezone'   => 'required|string|max:100',
            'currency'   => 'required|string|size:3',
        ]);

        // Convert camelCase keys to snake_case for Eloquent
        $snake = collect($validated)->mapWithKeys(
            fn ($value, $key) => [Str::snake($key) => $value]
        )->toArray();

        $profile = $request->user()->farmProfile()->create($snake);

        return new FarmProfileResource($profile);
    }

    /**
     * Update the existing farm profile.
     * Accepts camelCase keys from the frontend.
     */
    public function update(Request $request)
    {
        $profile = $request->user()->farmProfile;

        if (!$profile) {
            return response()->json(
                ['message' => 'No farm profile found. Use POST /api/onboarding to create one first.'],
                404
            );
        }

        $validated = $request->validate([
            'firstName'  => 'sometimes|string|max:100',
            'lastName'   => 'sometimes|string|max:100',
            'farmName'   => 'sometimes|string|max:255',
            'latitude'   => 'nullable|numeric|min:-90|max:90',
            'longitude'  => 'nullable|numeric|min:-180|max:180',
            'unitSystem' => 'sometimes|in:metric,imperial,us_customary,ethiopian_traditional,mixed',
            'timezone'   => 'sometimes|string|max:100',
            'currency'   => 'sometimes|string|size:3',
        ]);

        $snake = collect($validated)->mapWithKeys(
            fn ($value, $key) => [Str::snake($key) => $value]
        )->toArray();

        $profile->update($snake);

        return new FarmProfileResource($profile);
    }
}
