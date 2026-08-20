<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AnimalResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'userId' => $this->user_id,
            'name' => $this->name,
            'animalType' => $this->animal_type,
            'breed' => $this->breed,
            'sex' => $this->sex,
            'age' => $this->age,
            'status' => $this->status,
            'neutered' => $this->neutered,
            'coloring' => $this->coloring,
            'description' => $this->description,
            'methodAcquired' => $this->method_acquired,
            'veterinarian' => $this->veterinarian,
            'matureWeight' => $this->mature_weight,
            'estimatedValue' => $this->estimated_value,
            'createdAt' => $this->created_at,
            'updatedAt' => $this->updated_at,
        ];

        if ($this->relationLoaded('auction') && $this->auction) {
            $data['auctionStartingPrice'] = $this->auction->starting_price;
            $data['auctionDurationHours'] = max(1, now()->diffInHours($this->auction->end_time, false));
            if ($data['auctionDurationHours'] < 0) {
                $data['auctionDurationHours'] = 0; // auction ended
            }
        }

        return $data;
    }
}
