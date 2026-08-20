<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Auction;
use App\Models\Animal;
use App\Models\Crop;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuctionController extends Controller
{
    /**
     * List all active auctions with their items and bid info.
     */
    public function index(): JsonResponse
    {
        $auctions = Auction::where('status', 'active')
            ->with(['auctionable.user.farmProfile', 'highestBid.user', 'bids'])
            ->latest()
            ->get()
            ->map(function ($auction) {
                return [
                    'id' => $auction->id,
                    'auctionable_type' => class_basename($auction->auctionable_type),
                    'auctionable' => $auction->auctionable,
                    'starting_price' => $auction->starting_price,
                    'current_bid' => $auction->highestBid ? $auction->highestBid->amount : $auction->starting_price,
                    'bid_count' => $auction->bids->count(),
                    'end_time' => $auction->end_time,
                    'status' => $auction->status,
                ];
            });

        return response()->json(['data' => $auctions, 'total' => $auctions->count()]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'auctionable_type' => 'required|in:animal,crop',
            'auctionable_id' => 'required|integer',
            'starting_price' => 'required|numeric|min:0',
            'duration_hours' => 'nullable|integer|min:1',
        ]);

        $modelClass = $validated['auctionable_type'] === 'animal' ? Animal::class : Crop::class;
        $item = $modelClass::where('id', $validated['auctionable_id'])
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        // Ensure item isn't already in an active auction
        $existing = Auction::where('auctionable_type', $modelClass)
            ->where('auctionable_id', $item->id)
            ->where('status', 'active')
            ->first();

        if ($existing) {
            return response()->json(['message' => 'Item is already in an active auction.'], 400);
        }

        // Change item status
        $item->update(['status' => 'Auction']);

        $duration = $validated['duration_hours'] ?? 24;

        $auction = Auction::create([
            'user_id' => $request->user()->id,
            'auctionable_type' => $modelClass,
            'auctionable_id' => $item->id,
            'starting_price' => $validated['starting_price'],
            'status' => 'active',
            'end_time' => now()->addHours($duration),
        ]);

        return response()->json(['message' => 'Auction created successfully', 'auction' => $auction], 201);
    }

    public function show($id): JsonResponse
    {
        $auction = Auction::with(['auctionable.user.farmProfile', 'bids.user', 'highestBid.user'])->findOrFail($id);

        return response()->json([
            'data' => $auction,
            'bid_count' => $auction->bids->count(),
        ]);
    }
}
