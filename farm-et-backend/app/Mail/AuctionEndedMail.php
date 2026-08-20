<?php

namespace App\Mail;

use App\Models\Auction;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class AuctionEndedMail extends Mailable
{
    use Queueable, SerializesModels;

    public $auction;
    public $role; // 'winner' or 'seller'

    public function __construct(Auction $auction, string $role)
    {
        $this->auction = $auction;
        $this->role = $role;
    }

    public function envelope(): Envelope
    {
        return new Envelope(subject: 'Auction Ended');
    }

    public function content(): Content
    {
        return new Content(view: 'emails.auction_ended');
    }
}
