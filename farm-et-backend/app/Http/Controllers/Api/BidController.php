<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\NewBidNotificationMail;
use App\Mail\OutbidNotificationMail;
use App\Models\Auction;
use App\Models\Bid;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class BidController extends Controller
{
    public function store(Request $request, $auctionId): JsonResponse
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:0',
        ]);

        $auction = Auction::findOrFail($auctionId);

        if ($auction->status !== 'active' || $auction->end_time < now()) {
            // Auto close if time passed
            if ($auction->status === 'active') {
                $auction->update(['status' => 'ended']);
            }

            return response()->json(['message' => 'This auction has ended.'], 400);
        }

        if ($auction->user_id === $request->user()->id) {
            return response()->json(['message' => 'You cannot bid on your own auction.'], 400);
        }

        $highestBid = $auction->highestBid;
        $minBid = $highestBid ? $highestBid->amount : $auction->starting_price;

        if ($validated['amount'] <= $minBid) {
            return response()->json([
                'message' => 'Your bid must be higher than the current highest bid/starting price of ETB '.$minBid,
            ], 400);
        }

        $bid = Bid::create([
            'auction_id' => $auction->id,
            'user_id' => $request->user()->id,
            'amount' => $validated['amount'],
        ]);

        $mailErrors = [];

        // Send outbid notification if someone was outbid (best-effort, don't fail the bid)
        if ($highestBid && $highestBid->user_id !== $request->user()->id) {
            try {
                Mail::to($highestBid->user->email)->send(new OutbidNotificationMail($auction, $validated['amount']));
            } catch (\Exception $e) {
                $mailErrors[] = 'Outbid notification failed: '.$e->getMessage();
                Log::warning('Outbid notification failed: '.$e->getMessage());
            }
        }

        // Send new bid notification to the auctioneer
        try {
            Mail::to($auction->user->email)->send(new NewBidNotificationMail($auction, $validated['amount']));
        } catch (\Exception $e) {
            $mailErrors[] = 'New bid notification failed: '.$e->getMessage();
            Log::warning('New bid notification to auctioneer failed: '.$e->getMessage());
        }

        return response()->json([
            'message' => 'Bid placed successfully',
            'bid' => $bid,
            'mail_errors' => $mailErrors,
        ], 201);
    }
}
