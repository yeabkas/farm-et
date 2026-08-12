<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    /**
     * Get the financial P&L summary.
     *
     * Supports two filter modes:
     *   - Date range:   ?start_date=2026-01-01&end_date=2026-12-31
     *   - Year only:    ?year=2026  (fallback, defaults to current year)
     */
    public function summary(Request $request)
    {
        $query = $request->user()->transactions();

        // Prefer explicit date-range filter; fall back to year filter
        if ($request->filled('start_date') && $request->filled('end_date')) {
            $request->validate([
                'start_date' => 'date',
                'end_date'   => 'date|after_or_equal:start_date',
            ]);
            $query->whereBetween('date', [$request->start_date, $request->end_date]);
        } else {
            $year = $request->query('year', date('Y'));
            $query->where('reporting_year', $year);
        }

        $totalIncome  = (clone $query)->where('type', 'Income')->sum('amount');
        $totalExpense = (clone $query)->where('type', 'Expense')->sum('amount');
        $netIncome    = $totalIncome - $totalExpense;

        // Breakdown by category for charts
        $expensesByCategory = (clone $query)
            ->where('type', 'Expense')
            ->selectRaw('category, SUM(amount) as total')
            ->groupBy('category')
            ->get();

        $incomeByCategory = (clone $query)
            ->where('type', 'Income')
            ->selectRaw('category, SUM(amount) as total')
            ->groupBy('category')
            ->get();

        return response()->json([
            'filters' => [
                'start_date' => $request->start_date ?? null,
                'end_date'   => $request->end_date   ?? null,
                'year'       => $request->query('year', date('Y')),
            ],
            'summary' => [
                'total_income'  => round($totalIncome, 2),
                'total_expense' => round($totalExpense, 2),
                'net_income'    => round($netIncome, 2),
            ],
            'income_by_category'   => $incomeByCategory,
            'expenses_by_category' => $expensesByCategory,
        ]);
    }

    /**
     * Get the Cash Flow Statement.
     *
     * Returns operating inflows and expenditures grouped by category,
     * with beginning balance (hardcoded to 0 until a balance-sheet feature is added)
     * and computed net change and ending balance.
     *
     * Supports:
     *   - Date range:  ?start_date=2026-01-01&end_date=2026-12-31
     *   - Year only:   ?year=2026
     */
    public function cashFlow(Request $request)
    {
        $query = $request->user()->transactions();

        if ($request->filled('start_date') && $request->filled('end_date')) {
            $request->validate([
                'start_date' => 'date',
                'end_date'   => 'date|after_or_equal:start_date',
            ]);
            $query->whereBetween('date', [$request->start_date, $request->end_date]);
        } else {
            $year = $request->query('year', date('Y'));
            $query->where('reporting_year', $year);
        }

        // Operating inflows — Income transactions grouped by category
        $operatingInflows = (clone $query)
            ->where('type', 'Income')
            ->selectRaw('category, SUM(amount) as total')
            ->groupBy('category')
            ->get();

        // Cash expenditures — Expense transactions grouped by category
        $cashExpenditures = (clone $query)
            ->where('type', 'Expense')
            ->selectRaw('category, SUM(amount) as total')
            ->groupBy('category')
            ->get();

        $totalInflow       = $operatingInflows->sum('total');
        $totalExpenditures = $cashExpenditures->sum('total');

        // Beginning balance: 0.00 until a balance-sheet module is introduced
        $beginningBalance  = 0.00;
        $netChangeInCash   = $totalInflow - $totalExpenditures;
        $endingBalance     = $beginningBalance + $netChangeInCash;

        return response()->json([
            'filters' => [
                'start_date' => $request->start_date ?? null,
                'end_date'   => $request->end_date   ?? null,
                'year'       => $request->query('year', date('Y')),
            ],
            'beginning_balance'  => round($beginningBalance, 2),
            'operating_inflows'  => $operatingInflows,
            'cash_expenditures'  => $cashExpenditures,
            'total_inflow'       => round($totalInflow, 2),
            'total_expenditures' => round($totalExpenditures, 2),
            'net_change_in_cash' => round($netChangeInCash, 2),
            'ending_balance'     => round($endingBalance, 2),
        ]);
    }
}