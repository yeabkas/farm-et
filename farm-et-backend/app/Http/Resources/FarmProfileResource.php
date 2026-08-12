<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class FarmProfileResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'         => $this->id,
            'userId'     => $this->user_id,
            'firstName'  => $this->first_name,
            'lastName'   => $this->last_name,
            'farmName'   => $this->farm_name,
            'latitude'   => $this->latitude,
            'longitude'  => $this->longitude,
            'unitSystem' => $this->unit_system,
            'timezone'   => $this->timezone,
            'currency'   => $this->currency,
            'createdAt'  => $this->created_at,
            'updatedAt'  => $this->updated_at,
        ];
    }
}
