<?php

namespace App\Mail;

use App\Models\Auction;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class NewBidNotificationMail extends Mailable
{
    use Queueable, SerializesModels;

    public $auction;

    public $newBidAmount;

    public function __construct(Auction $auction, $newBidAmount)
    {
        $this->auction = $auction;
        $this->newBidAmount = $newBidAmount;
    }

    public function envelope(): Envelope
    {
        return new Envelope(subject: 'New Bid on Your Auction!');
    }

    public function content(): Content
    {
        return new Content(view: 'emails.new_bid');
    }
}
