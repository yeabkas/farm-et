<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Animal extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
        'animal_type',
        'breed',
        'sex',
        'age',
        'status',
        'neutered',
        'coloring',
        'description',
        'method_acquired',
        'veterinarian',
        'mature_weight',
        'estimated_value',
    ];

    protected function casts(): array
    {
        return [
            'age' => 'float',
            'mature_weight' => 'float',
            'estimated_value' => 'float',
        ];
    }

    /**
     * An animal belongs to a user.
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
