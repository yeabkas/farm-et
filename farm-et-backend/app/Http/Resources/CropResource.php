<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CropResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'userId' => $this->user_id,
            'cropType' => $this->crop_type,
            'status' => $this->status,
            'varietyStrain' => $this->variety_strain,
            'botanicalName' => $this->botanical_name,
            'description' => $this->description,
            'internalId' => $this->internal_id,
            'daysToMaturity' => $this->days_to_maturity,
            'isPerennial' => $this->is_perennial,
            'harvestUnits' => $this->harvest_units,
            'saleWindow' => $this->sale_window,
            'estimatedValue' => $this->estimated_value,
            'createdAt' => $this->created_at,
            'updatedAt' => $this->updated_at,
        ];
    }
}
