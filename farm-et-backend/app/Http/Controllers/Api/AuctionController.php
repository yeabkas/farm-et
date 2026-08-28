<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Animal;
use App\Models\Auction;
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

    /**
     * List all auctions created by the authenticated user.
     */
    public function myAuctions(Request $request): JsonResponse
    {
        $auctions = Auction::where('user_id', $request->user()->id)
            ->with(['auctionable.user.farmProfile', 'highestBid.user', 'bids.user.farmProfile'])
            ->latest()
            ->get()
            ->map(function ($auction) {
                // Sort bids highest to lowest
                $sortedBids = $auction->bids->sortByDesc('amount')->values()->map(function ($bid) {
                    return [
                        'id' => $bid->id,
                        'amount' => $bid->amount,
                        'created_at' => $bid->created_at,
                        'user' => [
                            'id' => $bid->user->id,
                            'name' => $bid->user->name,
                            'email' => $bid->user->email,
                            'phone' => $bid->user->farmProfile ? $bid->user->farmProfile->phone_number : null,
                        ],
                    ];
                });

                return [
                    'id' => $auction->id,
                    'auctionable_type' => class_basename($auction->auctionable_type),
                    'auctionable' => $auction->auctionable,
                    'starting_price' => $auction->starting_price,
                    'current_bid' => $auction->highestBid ? $auction->highestBid->amount : $auction->starting_price,
                    'bid_count' => $auction->bids->count(),
                    'end_time' => $auction->end_time,
                    'status' => $auction->status,
                    'bids' => $sortedBids,
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

        try {
            $qstashToken = env('QSTASH_TOKEN');
            if ($qstashToken) {
                // Schedule the webhook in QStash to fire exactly when the auction expires
                $delay = $duration . 'h';
                // Note: env('APP_URL') should be the publicly accessible URL of the backend (e.g. your Vercel URL)
                $webhookUrl = env('APP_URL') . '/api/qstash/webhook';
                
                \Illuminate\Support\Facades\Http::withToken($qstashToken)
                    ->withHeaders([
                        'Upstash-Delay' => $delay,
                        'Content-Type' => 'application/json'
                    ])
                    ->post('https://qstash.upstash.io/v2/publish/' . $webhookUrl, [
                        'job_type' => 'close_auction',
                        'auction_id' => $auction->id
                    ]);
                    
                \Illuminate\Support\Facades\Log::info("Scheduled auction $auction->id to close in $delay via QStash");
            }
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error("Failed to schedule QStash job for auction $auction->id: " . $e->getMessage());
        }

        \Illuminate\Support\Facades\Cache::forget('market.listings');

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
