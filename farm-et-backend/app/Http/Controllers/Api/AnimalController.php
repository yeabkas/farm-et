<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\AnimalResource;
use App\Models\Animal;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AnimalController extends Controller
{
    /**
     * List all animals for the authenticated user, newest first.
     */
    public function index(Request $request)
    {
        return AnimalResource::collection(
            $request->user()->animals()->latest()->get()
        );
    }

    /**
     * Store a new animal. Accepts camelCase keys.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'animalType' => 'required|string|max:100',
            'breed' => 'nullable|string|max:100',
            'sex' => 'required|in:Male,Female',
            'age' => 'nullable|numeric|min:0',
            'status' => 'required|in:Active,Auction,For Sale,Lactating,Lost,Off Farm,Quarantined,Sold,Weaning',
            'neutered' => 'required|in:Neutered,Intact',
            'coloring' => 'nullable|string|max:100',
            'description' => 'nullable|string',
            'methodAcquired' => 'nullable|in:Raised on Farm,Purchased,Gifted/Donation',
            'veterinarian' => 'nullable|string|max:255',
            'matureWeight' => 'nullable|numeric|min:0',
            'estimatedValue' => 'nullable|numeric|min:0',
            'auctionStartingPrice' => 'nullable|numeric|min:0',
            'auctionDurationHours' => 'nullable|integer|min:1',
        ]);

        $snake = collect($validated)->mapWithKeys(
            fn ($value, $key) => [Str::snake($key) => $value]
        )->toArray();

        $animal = $request->user()->animals()->create($snake);

        if ($animal->status === 'Auction') {
            \App\Models\Auction::create([
                'user_id' => $animal->user_id,
                'auctionable_type' => \App\Models\Animal::class,
                'auctionable_id' => $animal->id,
                'starting_price' => $request->input('auctionStartingPrice', $animal->estimated_value ?? 0),
                'status' => 'active',
                'end_time' => now()->addHours($request->input('auctionDurationHours', 24)),
            ]);
        }

        return new AnimalResource($animal);
    }

    /**
     * Show a single animal (user-scoped).
     */
    public function show(Request $request, Animal $animal)
    {
        if ($animal->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return new AnimalResource($animal);
    }

    /**
     * Update an existing animal. Accepts camelCase keys.
     */
    public function update(Request $request, Animal $animal)
    {
        if ($animal->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'animalType' => 'sometimes|string|max:100',
            'breed' => 'nullable|string|max:100',
            'sex' => 'sometimes|in:Male,Female',
            'age' => 'nullable|numeric|min:0',
            'status' => 'sometimes|in:Active,Auction,For Sale,Lactating,Lost,Off Farm,Quarantined,Sold,Weaning',
            'neutered' => 'sometimes|in:Neutered,Intact',
            'coloring' => 'nullable|string|max:100',
            'description' => 'nullable|string',
            'methodAcquired' => 'nullable|in:Raised on Farm,Purchased,Gifted/Donation',
            'veterinarian' => 'nullable|string|max:255',
            'matureWeight' => 'nullable|numeric|min:0',
            'estimatedValue' => 'nullable|numeric|min:0',
            'auctionStartingPrice' => 'nullable|numeric|min:0',
            'auctionDurationHours' => 'nullable|integer|min:1',
        ]);

        $snake = collect($validated)->mapWithKeys(
            fn ($value, $key) => [Str::snake($key) => $value]
        )->toArray();

        $animal->update($snake);

        if ($animal->status === 'Auction') {
            $existing = \App\Models\Auction::where('auctionable_type', \App\Models\Animal::class)
                ->where('auctionable_id', $animal->id)
                ->where('status', 'active')
                ->first();
            if (!$existing) {
                \App\Models\Auction::create([
                    'user_id' => $animal->user_id,
                    'auctionable_type' => \App\Models\Animal::class,
                    'auctionable_id' => $animal->id,
                    'starting_price' => $request->input('auctionStartingPrice', $animal->estimated_value ?? 0),
                    'status' => 'active',
                    'end_time' => now()->addHours($request->input('auctionDurationHours', 24)),
                ]);
            }
        }

        return new AnimalResource($animal);
    }

    /**
     * Delete an animal (hard delete — row removed permanently).
     * Note: Use status = "Sold" to mark a sale without deleting.
     */
    public function destroy(Request $request, Animal $animal)
    {
        if ($animal->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $animal->delete();

        return response()->json(['message' => 'Animal deleted successfully']);
    }
}
