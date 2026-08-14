<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreTransactionRequest extends FormRequest
{
    /**
     * All authenticated users may create transactions.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Validation rules for creating a transaction.
     */
    public function rules(): array
    {
        return [
            'type' => 'required|in:Income,Expense',
            'amount' => 'required|numeric|gt:0',
            'payee_customer' => 'nullable|string|max:255',
            'category' => 'required|string|max:255',
            'date' => 'required|date',
            'reporting_year' => 'required|integer|digits:4',
            'description' => 'nullable|string',
            'check_number' => 'nullable|string|max:50',
            'associated_to' => 'nullable|string|max:255',
            'keywords' => 'nullable|string|max:255',
        ];
    }
}
