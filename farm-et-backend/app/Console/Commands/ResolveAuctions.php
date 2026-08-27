<?php

namespace App\Console\Commands;

use App\Mail\AuctionEndedMail;
use App\Models\Auction;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class ResolveAuctions extends Command
{
    protected $signature = 'auctions:resolve';

    protected $description = 'Resolve ended auctions and send notifications';

    public function handle()
    {
        $auctions = Auction::where('status', 'active')
            ->where('end_time', '<=', now())
            ->with(['highestBid.user', 'user', 'auctionable'])
            ->get();

        foreach ($auctions as $auction) {
            $auction->update(['status' => 'ended']);

            $seller = $auction->user;
            $highestBid = $auction->highestBid;
            $item = $auction->auctionable;

            if ($highestBid) {
                // Mark item as sold
                if ($item) {
                    $item->update(['status' => 'Sold']);
                }

                // Send notifications (best-effort)
                try {
                    Mail::to($highestBid->user->email)->send(new AuctionEndedMail($auction, 'winner'));
                    Mail::to($seller->email)->send(new AuctionEndedMail($auction, 'seller'));
                } catch (\Exception $e) {
                    Log::warning('Auction ended notification failed for auction #'.$auction->id.': '.$e->getMessage());
                }
            } else {
                // No bids — return item to Active
                if ($item) {
                    $item->update(['status' => 'Active']);
                }
            }
        }

        $this->info('Resolved '.$auctions->count().' auctions.');
    }
}
