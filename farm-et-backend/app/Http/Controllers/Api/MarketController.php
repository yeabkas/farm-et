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
        $listings = \Illuminate\Support\Facades\Cache::remember('market.listings', 300, function () {
            // ─── Animals listed For Sale or Auction ───────────────────────────
            $animals = Animal::whereIn('status', ['For Sale', 'Auction'])
                ->with(['user.farmProfile', 'auction.highestBid', 'auction.bids'])
                ->get()
                ->map(function ($animal) {
                    $profile = $animal->user?->farmProfile;
                    $auction = $animal->auction;
                    $highestBid = $auction?->highestBid;

                    return [
                        'id' => $animal->id,
                        'listingType' => 'animal',
                        'saleType' => $animal->status === 'Auction' ? 'auction' : 'sale',
                        'auctionId' => $auction?->id,
                        'currentBid' => $highestBid ? $highestBid->amount : ($auction ? $auction->starting_price : null),
                        'bidCount' => $auction ? $auction->bids->count() : 0,
                        'auctionEndTime' => $auction?->end_time,
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
                        'sellerEmail' => $animal->user?->email,
                        'sellerPhone' => $profile?->phone_number,
                        'farmName' => $profile?->farm_name ?? 'Unknown Farm',
                        'createdAt' => $animal->created_at?->toDateString(),
                        'images' => $animal->images,
                    ];
                });

            // ─── Crops listed For Sale or Auction ─────────────────────────────
            $crops = Crop::whereIn('status', ['For Sale', 'Auction'])
                ->with(['user.farmProfile', 'auction.highestBid', 'auction.bids'])
                ->get()
                ->map(function ($crop) {
                    $profile = $crop->user?->farmProfile;
                    $auction = $crop->auction;
                    $highestBid = $auction?->highestBid;

                    return [
                        'id' => $crop->id,
                        'listingType' => 'crop',
                        'saleType' => $crop->status === 'Auction' ? 'auction' : 'sale',
                        'auctionId' => $auction?->id,
                        'currentBid' => $highestBid ? $highestBid->amount : ($auction ? $auction->starting_price : null),
                        'bidCount' => $auction ? $auction->bids->count() : 0,
                        'auctionEndTime' => $auction?->end_time,
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
                        'sellerEmail' => $crop->user?->email,
                        'sellerPhone' => $profile?->phone_number,
                        'farmName' => $profile?->farm_name ?? 'Unknown Farm',
                        'createdAt' => $crop->created_at?->toDateString(),
                        'images' => $crop->images,
                    ];
                });

            // ─── Merge and sort by newest first ──────────────────────────────
            return $animals->concat($crops)
                ->sortByDesc('createdAt')
                ->values();
        });

        return response()->json([
            'data' => $listings,
            'total' => $listings->count(),
        ]);
    }
}
