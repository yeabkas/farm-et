<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Animal;
use App\Models\Crop;
use Illuminate\Http\JsonResponse;

class MarketController extends Controller
{
    /**
     * Public endpoint — returns all animals and crops listed "For Sale"
     * across ALL users, with seller info from their FarmProfile.
     *
     * GET /api/market/listings
     */
    public function listings(): JsonResponse
    {
        // ─── Animals listed For Sale ──────────────────────────────────────
        $animals = Animal::where('status', 'For Sale')
            ->with('user.farmProfile')
            ->get()
            ->map(function ($animal) {
                $profile = $animal->user?->farmProfile;

                return [
                    'id' => $animal->id,
                    'listingType' => 'animal',
                    'name' => $animal->name,
                    'category' => $animal->animal_type,
                    'breed' => $animal->breed,
                    'sex' => $animal->sex,
                    'age' => $animal->age,
                    'description' => $animal->description,
                    'estimatedValue' => $animal->estimated_value,
                    'harvestUnits' => null,
                    'matureWeight' => $animal->mature_weight,
                    'sellerName' => $profile
                        ? trim(($profile->first_name ?? '').' '.($profile->last_name ?? ''))
                        : ($animal->user?->name ?? 'Unknown'),
                    'farmName' => $profile?->farm_name ?? 'Unknown Farm',
                    'createdAt' => $animal->created_at?->toDateString(),
                ];
            });

        // ─── Crops listed For Sale ────────────────────────────────────────
        $crops = Crop::where('status', 'For Sale')
            ->with('user.farmProfile')
            ->get()
            ->map(function ($crop) {
                $profile = $crop->user?->farmProfile;

                return [
                    'id' => $crop->id,
                    'listingType' => 'crop',
                    'name' => $crop->crop_type,
                    'category' => $crop->variety_strain ?? $crop->crop_type,
                    'breed' => null,
                    'sex' => null,
                    'age' => null,
                    'description' => $crop->description,
                    'estimatedValue' => $crop->estimated_value,
                    'harvestUnits' => $crop->harvest_units,
                    'matureWeight' => null,
                    'sellerName' => $profile
                        ? trim(($profile->first_name ?? '').' '.($profile->last_name ?? ''))
                        : ($crop->user?->name ?? 'Unknown'),
                    'farmName' => $profile?->farm_name ?? 'Unknown Farm',
                    'createdAt' => $crop->created_at?->toDateString(),
                ];
            });

        // ─── Merge and sort by newest first ──────────────────────────────
        $listings = $animals->concat($crops)
            ->sortByDesc('createdAt')
            ->values();

        return response()->json([
            'data' => $listings,
            'total' => $listings->count(),
        ]);
    }
}
