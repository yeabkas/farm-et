<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    // ─── Relationships ────────────────────────────────────────────────────────

    /** One user has one farm profile (created during onboarding). */
    public function farmProfile(): HasOne
    {
        return $this->hasOne(FarmProfile::class);
    }

    /** One user owns many transactions. */
    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class);
    }

    /** One user owns many animals. */
    public function animals(): HasMany
    {
        return $this->hasMany(Animal::class);
    }

    /** One user owns many crops. */
    public function crops(): HasMany
    {
        return $this->hasMany(Crop::class);
    }

    // ─── Mass Assignment ──────────────────────────────────────────────────────

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'otp_code',
        'otp_expires_at',
    ];

    public function isAdmin(): bool
    {
        return $this->role === 'admin' || $this->email === 'yeabkasz@gmail.com';
    }

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password'          => 'hashed',
        ];
    }
}