<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class Auction extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'auctionable_type',
        'auctionable_id',
        'starting_price',
        'status',
        'end_time',
    ];

    protected function casts(): array
    {
        return [
            'starting_price' => 'float',
            'end_time' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function auctionable(): MorphTo
    {
        return $this->morphTo();
    }

    public function bids(): HasMany
    {
        return $this->hasMany(Bid::class);
    }

    public function highestBid()
    {
        return $this->hasOne(Bid::class)->latestOfMany('amount');
    }
}
