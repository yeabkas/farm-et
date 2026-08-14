<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AdminController extends Controller
{
    /**
     * Ensure request is performed by admin.
     */
    private function authorizeAdmin(Request $request)
    {
        $user = $request->user();
        if (! $user || ($user->role !== 'admin' && $user->email !== 'yeabkasz@gmail.com')) {
            abort(403, 'Unauthorized. Admin access required.');
        }
    }

    /**
     * Get platform overview stats and directory of all registered users.
     */
    public function users(Request $request)
    {
        $this->authorizeAdmin($request);

        $users = User::with(['farmProfile', 'transactions', 'animals', 'crops'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($u) {
                $forSaleAnimals = $u->animals->where('status', 'For Sale')->count();
                $forSaleCrops = $u->crops->where('status', 'For Sale')->count();

                return [
                    'id' => $u->id,
                    'name' => $u->name,
                    'email' => $u->email,
                    'role' => $u->role ?? 'user',
                    'farmName' => $u->farmProfile?->farm_name ?? 'N/A',
                    'location' => $u->farmProfile ? "{$u->farmProfile->latitude}, {$u->farmProfile->longitude}" : 'N/A',
                    'currency' => $u->farmProfile?->currency ?? 'ETB',
                    'totalTransactions' => $u->transactions->count(),
                    'totalAnimals' => $u->animals->count(),
                    'totalCrops' => $u->crops->count(),
                    'forSaleCount' => $forSaleAnimals + $forSaleCrops,
                    'createdAt' => $u->created_at->format('M d, Y'),
                ];
            });

        return response()->json([
            'data' => $users,
            'summary' => [
                'totalUsers' => $users->count(),
                'totalTransactions' => $users->sum('totalTransactions'),
                'totalForSale' => $users->sum('forSaleCount'),
            ],
        ]);
    }

    /**
     * Inspect a specific user's transactions and items currently for sale.
     */
    public function showUser(Request $request, $id)
    {
        $this->authorizeAdmin($request);

        $targetUser = User::with(['farmProfile', 'transactions', 'animals', 'crops'])->findOrFail($id);

        $forSaleAnimals = $targetUser->animals->where('status', 'For Sale')->values()->map(function ($a) {
            return [
                'id' => $a->id,
                'name' => $a->name,
                'category' => 'Livestock',
                'type' => $a->animal_type ?? $a->type ?? 'Animal',
                'price' => (float) ($a->estimated_value ?? 0),
                'status' => $a->status,
                'details' => 'Breed: '.($a->breed ?? 'N/A').' | Age: '.($a->age ?? 'N/A').' yrs',
                'createdAt' => $a->created_at->format('M d, Y'),
            ];
        });

        $forSaleCrops = $targetUser->crops->where('status', 'For Sale')->values()->map(function ($c) {
            return [
                'id' => $c->id,
                'name' => $c->crop_type ?? $c->name ?? 'Crop',
                'category' => 'Plantings',
                'type' => $c->variety_strain ?? 'Crop',
                'price' => (float) ($c->estimated_value ?? 0),
                'status' => $c->status,
                'details' => 'Harvest Units: '.($c->harvest_units ?? 'kg'),
                'createdAt' => $c->created_at->format('M d, Y'),
            ];
        });

        $productsForSale = $forSaleAnimals->concat($forSaleCrops);

        $transactions = $targetUser->transactions->map(function ($t) {
            return [
                'id' => $t->id,
                'type' => $t->type,
                'amount' => (float) $t->amount,
                'category' => $t->category,
                'payeeCustomer' => $t->payee_customer,
                'description' => $t->description,
                'date' => $t->date,
                'createdAt' => $t->created_at->format('M d, Y'),
            ];
        });

        return response()->json([
            'user' => [
                'id' => $targetUser->id,
                'name' => $targetUser->name,
                'email' => $targetUser->email,
                'role' => $targetUser->role ?? 'user',
                'farmName' => $targetUser->farmProfile?->farm_name ?? 'N/A',
                'currency' => $targetUser->farmProfile?->currency ?? 'ETB',
                'createdAt' => $targetUser->created_at->format('M d, Y'),
            ],
            'transactions' => $transactions,
            'productsForSale' => $productsForSale,
        ]);
    }

    /**
     * Create a new admin user directly (bypassing OTP).
     */
    public function createAdmin(Request $request)
    {
        $this->authorizeAdmin($request);

        $fields = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email',
            'password' => 'required|string|min:8',
        ]);

        $admin = User::create([
            'name' => $fields['name'],
            'email' => $fields['email'],
            'password' => Hash::make($fields['password']),
            'role' => 'admin',
            'email_verified_at' => now(), // Bypass OTP
        ]);

        return response()->json([
            'message' => 'Admin user created successfully.',
            'admin' => $admin,
        ], 201);
    }

    /**
     * Revoke admin privileges from a user (only Yeabkasz@gmail.com can do this).
     */
    public function revokeAdmin($id, Request $request)
    {
        $this->authorizeAdmin($request);

        $currentUser = $request->user();

        // Only Yeabkasz@gmail.com is allowed to perform this action
        if (strtolower($currentUser->email) !== 'yeabkasz@gmail.com') {
            return response()->json(['message' => 'Unauthorized. Only the superadmin can revoke admin privileges.'], 403);
        }

        $targetUser = User::findOrFail($id);

        if (strtolower($targetUser->email) === 'yeabkasz@gmail.com') {
            return response()->json(['message' => 'Cannot revoke superadmin privileges.'], 400);
        }

        if ($targetUser->role !== 'admin') {
            return response()->json(['message' => 'User is not an admin.'], 400);
        }

        $targetUser->update(['role' => 'user']);

        return response()->json(['message' => 'Admin privileges revoked successfully.']);
    }

    /**
     * Promote a user to admin (only Yeabkasz@gmail.com can do this).
     */
    public function promoteAdmin($id, Request $request)
    {
        $this->authorizeAdmin($request);

        $currentUser = $request->user();

        // Only Yeabkasz@gmail.com is allowed to perform this action
        if (strtolower($currentUser->email) !== 'yeabkasz@gmail.com') {
            return response()->json(['message' => 'Unauthorized. Only the superadmin can promote users to admin.'], 403);
        }

        $targetUser = User::findOrFail($id);

        if ($targetUser->role === 'admin') {
            return response()->json(['message' => 'User is already an admin.'], 400);
        }

        $targetUser->update(['role' => 'admin']);

        return response()->json(['message' => 'User promoted to admin successfully.']);
    }

    /**
     * Reset a user's password (only Yeabkasz@gmail.com can do this).
     */
    public function resetPassword($id, Request $request)
    {
        $this->authorizeAdmin($request);

        $currentUser = $request->user();

        // Only Yeabkasz@gmail.com is allowed to perform this action
        if (strtolower($currentUser->email) !== 'yeabkasz@gmail.com') {
            return response()->json(['message' => 'Unauthorized. Only the superadmin can reset passwords.'], 403);
        }

        $request->validate([
            'password' => 'required|string|min:8',
        ]);

        $targetUser = User::findOrFail($id);

        $targetUser->password = $request->password;
        $targetUser->save();

        return response()->json(['message' => 'User password has been reset successfully.']);
    }
}
