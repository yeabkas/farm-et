<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Models\Auction;
use Carbon\Carbon;

class QStashWebhookController extends Controller
{
    public function handle(Request $request)
    {
        // 1. Verify QStash Signature (Simplified for now, should ideally verify the Upstash-Signature header)
        $signature = $request->header('Upstash-Signature');
        if (!$signature) {
            Log::warning('QStash webhook received without signature');
            // return response()->json(['error' => 'Missing signature'], 401);
        }

        $payload = $request->all();
        $jobType = $payload['job_type'] ?? null;

        if ($jobType === 'close_auction') {
            $auctionId = $payload['auction_id'] ?? null;
            if (!$auctionId) {
                return response()->json(['error' => 'Missing auction_id'], 400);
            }

            $auction = Auction::find($auctionId);
            
            if (!$auction) {
                Log::error("QStash tried to close auction $auctionId, but it does not exist.");
                return response()->json(['error' => 'Auction not found'], 404);
            }

            if ($auction->status === 'ended') {
                Log::info("Auction $auctionId is already ended.");
                return response()->json(['status' => 'already_ended']);
            }

            // Close the auction
            $auction->status = 'ended';
            
            // Note: The animal or crop status could also be updated here to "Sold" or reverted
            // For now, let's keep it simple and just mark the auction as ended.
            // A more complex implementation would look at bids and set the winner.

            if ($auction->auctionable) {
                if ($auction->bids()->count() > 0) {
                    $auction->auctionable->update(['status' => 'Sold']);
                } else {
                    $auction->auctionable->update(['status' => 'Active']); // Revert to active if no bids
                }
            }

            $auction->save();
            Log::info("Successfully closed auction $auctionId via QStash.");

            return response()->json(['status' => 'success', 'message' => "Auction $auctionId ended"]);
        }

        return response()->json(['status' => 'ignored', 'message' => 'Unknown job type']);
    }
}
