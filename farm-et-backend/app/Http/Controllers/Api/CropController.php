<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\CropResource;
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
            $request->user()->crops()->latest()->get()
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
        ]);

        // Set default status if not provided
        if (! isset($validated['status'])) {
            $validated['status'] = 'Active';
        }

        $snake = collect($validated)->mapWithKeys(
            fn ($value, $key) => [Str::snake($key) => $value]
        )->toArray();

        $crop = $request->user()->crops()->create($snake);

        if ($crop->status === 'Auction') {
            \App\Models\Auction::create([
                'user_id' => $crop->user_id,
                'auctionable_type' => \App\Models\Crop::class,
                'auctionable_id' => $crop->id,
                'starting_price' => $crop->estimated_value ?? 0,
                'status' => 'active',
                'end_time' => now()->addHours(24),
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
        ]);

        $snake = collect($validated)->mapWithKeys(
            fn ($value, $key) => [Str::snake($key) => $value]
        )->toArray();

        $crop->update($snake);

        if ($crop->status === 'Auction') {
            $existing = \App\Models\Auction::where('auctionable_type', \App\Models\Crop::class)
                ->where('auctionable_id', $crop->id)
                ->where('status', 'active')
                ->first();
            if (!$existing) {
                \App\Models\Auction::create([
                    'user_id' => $crop->user_id,
                    'auctionable_type' => \App\Models\Crop::class,
                    'auctionable_id' => $crop->id,
                    'starting_price' => $crop->estimated_value ?? 0,
                    'status' => 'active',
                    'end_time' => now()->addHours(24),
                ]);
            }
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
