<?php

namespace App\Mail;

use App\Models\Auction;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class OutbidNotificationMail extends Mailable
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
        return new Envelope(subject: 'You have been outbid!');
    }

    public function content(): Content
    {
        return new Content(view: 'emails.outbid');
    }
}
