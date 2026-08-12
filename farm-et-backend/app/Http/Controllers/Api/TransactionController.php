<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\TransactionResource;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class TransactionController extends Controller
{
    /**
     * Get all transactions for the authenticated user, newest first.
     */
    public function index(Request $request)
    {
        return TransactionResource::collection(
            $request->user()->transactions()->latest('date')->get()
        );
    }

    /**
     * Store a new transaction. Accepts camelCase keys.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'type'          => 'required|in:Income,Expense',
            'amount'        => 'required|numeric|gt:0',
            'payeeCustomer' => 'nullable|string|max:255',
            'category'      => 'required|string|max:255',
            'date'          => 'required|date',
            'reportingYear' => 'required|integer|digits:4',
            'description'   => 'nullable|string',
            'checkNumber'   => 'nullable|string|max:50',
            'associatedTo'  => 'nullable|string|max:255',
            'keywords'      => 'nullable|string|max:255',
        ]);

        $snake = collect($validated)->mapWithKeys(
            fn ($value, $key) => [Str::snake($key) => $value]
        )->toArray();

        $transaction = $request->user()->transactions()->create($snake);

        return new TransactionResource($transaction);
    }

    /**
     * Show a specific transaction (user-scoped).
     */
    public function show(Request $request, Transaction $transaction)
    {
        if ($transaction->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return new TransactionResource($transaction);
    }

    /**
     * Update an existing transaction. Accepts camelCase keys.
     */
    public function update(Request $request, Transaction $transaction)
    {
        if ($transaction->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'type'          => 'sometimes|in:Income,Expense',
            'amount'        => 'sometimes|numeric|gt:0',
            'payeeCustomer' => 'nullable|string|max:255',
            'category'      => 'sometimes|string|max:255',
            'date'          => 'sometimes|date',
            'reportingYear' => 'sometimes|integer|digits:4',
            'description'   => 'nullable|string',
            'checkNumber'   => 'nullable|string|max:50',
            'associatedTo'  => 'nullable|string|max:255',
            'keywords'      => 'nullable|string|max:255',
        ]);

        $snake = collect($validated)->mapWithKeys(
            fn ($value, $key) => [Str::snake($key) => $value]
        )->toArray();

        $transaction->update($snake);

        return new TransactionResource($transaction);
    }

    /**
     * Delete a transaction.
     */
    public function destroy(Request $request, Transaction $transaction)
    {
        if ($transaction->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $transaction->delete();

        return response()->json(['message' => 'Transaction deleted successfully']);
    }
}
