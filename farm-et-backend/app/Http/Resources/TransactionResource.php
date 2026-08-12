<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TransactionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'            => $this->id,
            'userId'        => $this->user_id,
            'type'          => $this->type,
            'amount'        => $this->amount,
            'payeeCustomer' => $this->payee_customer,
            'category'      => $this->category,
            'date'          => $this->date,
            'reportingYear' => $this->reporting_year,
            'description'   => $this->description,
            'checkNumber'   => $this->check_number,
            'associatedTo'  => $this->associated_to,
            'keywords'      => $this->keywords,
            'createdAt'     => $this->created_at,
            'updatedAt'     => $this->updated_at,
        ];
    }
}
