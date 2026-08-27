<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\CropResource;
use App\Models\Auction;
use App\Models\Crop;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CropController extends Controller
{
    /**
     * List all crops for the authenticated user, newest first.
     */
    public function index(Request $request)
    {
        return CropResource::collection(
            $request->user()->crops()->with('auction')->latest()->get()
        );
    }

    /**
     * Store a new crop. Accepts camelCase keys.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'cropType' => 'required|string|max:100',
            'status' => 'nullable|string|in:Active,Auction,For Sale,Sold,Archived',
            'varietyStrain' => 'nullable|string|max:100',
            'botanicalName' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'internalId' => 'nullable|string|max:50',
            'daysToMaturity' => 'nullable|integer|min:0',
            'isPerennial' => 'boolean',
            'harvestUnits' => 'required|string|max:50',
            'saleWindow' => 'nullable|integer|min:0',
            'estimatedValue' => 'nullable|numeric|min:0',
            'auctionStartingPrice' => 'nullable|numeric|min:0',
            'auctionDurationHours' => 'nullable|integer|min:1',
            'images' => 'nullable|array',
            'images.*' => 'nullable|string|url',
        ]);

        // Set default status if not provided
        if (! isset($validated['status'])) {
            $validated['status'] = 'Active';
        }

        $snake = collect($validated)->except('images')->mapWithKeys(
            fn ($value, $key) => [Str::snake($key) => $value]
        )->toArray();

        // Images are uploaded client-side to Cloudinary; we just store the URLs
        if (! empty($validated['images'])) {
            $snake['images'] = $validated['images'];
        }

        $crop = $request->user()->crops()->create($snake);

        if ($crop->status === 'Auction') {
            Auction::create([
                'user_id' => $crop->user_id,
                'auctionable_type' => Crop::class,
                'auctionable_id' => $crop->id,
                'starting_price' => $request->input('auctionStartingPrice', $crop->estimated_value ?? 0),
                'status' => 'active',
                'end_time' => now()->addHours((int) $request->input('auctionDurationHours', 24)),
            ]);
        }

        return new CropResource($crop);
    }

    /**
     * Show a single crop (user-scoped).
     */
    public function show(Request $request, Crop $crop)
    {
        if ($crop->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $crop->load('auction');

        return new CropResource($crop);
    }

    /**
     * Update an existing crop. Accepts camelCase keys.
     */
    public function update(Request $request, Crop $crop)
    {
        if ($crop->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'cropType' => 'sometimes|string|max:100',
            'status' => 'nullable|string|in:Active,Auction,For Sale,Sold,Archived',
            'varietyStrain' => 'nullable|string|max:100',
            'botanicalName' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'internalId' => 'nullable|string|max:50',
            'daysToMaturity' => 'nullable|integer|min:0',
            'isPerennial' => 'boolean',
            'harvestUnits' => 'sometimes|string|max:50',
            'saleWindow' => 'nullable|integer|min:0',
            'estimatedValue' => 'nullable|numeric|min:0',
            'auctionStartingPrice' => 'nullable|numeric|min:0',
            'auctionDurationHours' => 'nullable|integer|min:1',
            'images' => 'nullable|array',
            'images.*' => 'nullable|string|url',
        ]);

        $snake = collect($validated)->except('images')->mapWithKeys(
            fn ($value, $key) => [Str::snake($key) => $value]
        )->toArray();

        // Images are uploaded client-side to Cloudinary; we just store the URLs
        if (isset($validated['images'])) {
            $snake['images'] = $validated['images'];
        }

        $crop->update($snake);

        if ($crop->status === 'Auction') {
            $existing = Auction::where('auctionable_type', Crop::class)
                ->where('auctionable_id', $crop->id)
                ->where('status', 'active')
                ->first();
            if ($existing) {
                $updateData = [];
                if ($request->has('auctionStartingPrice')) {
                    $updateData['starting_price'] = $request->input('auctionStartingPrice');
                }
                if ($request->has('auctionDurationHours') && $request->input('auctionDurationHours') !== null) {
                    $updateData['end_time'] = now()->addHours((int) $request->input('auctionDurationHours'));
                }
                if (! empty($updateData)) {
                    $existing->update($updateData);
                }
            } else {
                Auction::create([
                    'user_id' => $crop->user_id,
                    'auctionable_type' => Crop::class,
                    'auctionable_id' => $crop->id,
                    'starting_price' => $request->input('auctionStartingPrice', $crop->estimated_value ?? 0),
                    'status' => 'active',
                    'end_time' => now()->addHours((int) $request->input('auctionDurationHours', 24)),
                ]);
            }
        } else {
            Auction::where('auctionable_type', Crop::class)
                ->where('auctionable_id', $crop->id)
                ->where('status', 'active')
                ->update(['status' => 'cancelled']);
        }

        return new CropResource($crop);
    }

    /**
     * Delete a crop.
     */
    public function destroy(Request $request, Crop $crop)
    {
        if ($crop->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $crop->delete();

        return response()->json(['message' => 'Crop deleted successfully']);
    }
}
