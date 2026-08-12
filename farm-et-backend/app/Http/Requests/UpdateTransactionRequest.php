<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateTransactionRequest extends FormRequest
{
    /**
     * All authenticated users may update their own transactions.
     * Ownership is verified in the controller (403 check).
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Validation rules for updating a transaction (all fields optional).
     */
    public function rules(): array
    {
        return [
            'type'           => 'sometimes|in:Income,Expense',
            'amount'         => 'sometimes|numeric|gt:0',
            'payee_customer' => 'nullable|string|max:255',
            'category'       => 'sometimes|string|max:255',
            'date'           => 'sometimes|date',
            'reporting_year' => 'sometimes|integer|digits:4',
            'description'    => 'nullable|string',
            'check_number'   => 'nullable|string|max:50',
            'associated_to'  => 'nullable|string|max:255',
            'keywords'       => 'nullable|string|max:255',
        ];
    }
}
