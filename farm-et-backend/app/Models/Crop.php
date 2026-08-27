<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Crop extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'crop_type',
        'status',
        'variety_strain',
        'botanical_name',
        'description',
        'internal_id',
        'days_to_maturity',
        'is_perennial',
        'harvest_units',
        'sale_window',
        'estimated_value',
        'images',
    ];

    protected function casts(): array
    {
        return [
            'is_perennial' => 'boolean',
            'days_to_maturity' => 'integer',
            'sale_window' => 'integer',
            'estimated_value' => 'float',
            'images' => 'array',
        ];
    }

    /**
     * A crop belongs to a user.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function auction()
    {
        return $this->morphOne(Auction::class, 'auctionable')->where('status', 'active');
    }
}
