/**
 * Server-side utility that fetches a user's farm data from the Laravel API
 * and returns a structured text summary suitable for injecting into AI prompts.
 *
 * Used by:
 * - /api/insights (Option 2) — to generate AI insights from real data
 * - /api/chat     (Option 3) — to answer data-related questions with real numbers
 */

import { serverGet } from './server-api';

// ─── Types for Laravel API responses ──────────────────────────────────────────

interface FinancialSummary {
  year: number;
  summary: {
    total_income: number;
    total_expense: number;
    net_income: number;
  };
  by_category?: Record<string, number>;
}

interface Animal {
  id: number;
  name?: string;
  type?: string;
  breed?: string;
  status?: string;
  tag_number?: string;
  images?: string[];
  [key: string]: unknown;
}

interface Crop {
  id: number;
  name?: string;
  crop_type?: string;
  field_name?: string;
  status?: string;
  planted_at?: string;
  harvested_at?: string;
  images?: string[];
  [key: string]: unknown;
}

interface Transaction {
  id: number;
  type: 'Income' | 'Expense';
  amount: number;
  category?: string;
  description?: string;
  date?: string;
  [key: string]: unknown;
}

export interface FarmDataSnapshot {
  financial: FinancialSummary | null;
  animals: Animal[];
  crops: Crop[];
  recentTransactions: Transaction[];
  fetchedAt: string;
}

// ─── Main fetch function ──────────────────────────────────────────────────────

/**
 * Fetches the user's farm data from multiple Laravel endpoints in parallel.
 * Returns null values for any endpoint that fails (graceful degradation).
 */
export async function fetchFarmData(token: string): Promise<FarmDataSnapshot> {
  const currentYear = new Date().getFullYear();

  const [financial, animalsRes, cropsRes, transactionsRes] = await Promise.allSettled([
    serverGet<FinancialSummary>(`/reports/summary?year=${currentYear}`, { token }),
    serverGet<{ data: Animal[] } | Animal[]>('/animals', { token }),
    serverGet<{ data: Crop[] } | Crop[]>('/crops', { token }),
    serverGet<{ data: Transaction[] } | Transaction[]>('/transactions', { token }),
  ]);

  // Safely extract data, handling both { data: [...] } and [...] response shapes
  const extractArray = <T,>(result: PromiseSettledResult<{ data: T[] } | T[]>): T[] => {
    if (result.status === 'rejected') return [];
    const val = result.value;
    return Array.isArray(val) ? val : (val as { data: T[] }).data ?? [];
  };

  return {
    financial: financial.status === 'fulfilled' ? financial.value : null,
    animals: extractArray<Animal>(animalsRes),
    crops: extractArray<Crop>(cropsRes),
    recentTransactions: extractArray<Transaction>(transactionsRes).slice(0, 20),
    fetchedAt: new Date().toISOString(),
  };
}

// ─── Text summary for AI prompts ──────────────────────────────────────────────

/**
 * Converts a FarmDataSnapshot into a concise text summary
 * that can be injected into an AI system prompt.
 */
export function farmDataToPromptContext(data: FarmDataSnapshot): string {
  const sections: string[] = [];

  // Financial summary
  if (data.financial?.summary) {
    const s = data.financial.summary;
    sections.push(
      `FINANCIAL SUMMARY (${data.financial.year}):`,
      `  Total Income: $${s.total_income?.toLocaleString() ?? '0'}`,
      `  Total Expenses: $${s.total_expense?.toLocaleString() ?? '0'}`,
      `  Net Profit: $${s.net_income?.toLocaleString() ?? '0'}`,
    );

    if (data.financial.by_category) {
      sections.push('  Breakdown by category:');
      for (const [cat, amount] of Object.entries(data.financial.by_category)) {
        sections.push(`    ${cat}: $${Number(amount).toLocaleString()}`);
      }
    }
  }

  // Livestock summary
  if (data.animals.length > 0) {
    const byType: Record<string, number> = {};
    for (const a of data.animals) {
      const type = a.type || a.breed || 'Unknown';
      byType[type] = (byType[type] || 0) + 1;
    }
    sections.push(
      `\nLIVESTOCK (${data.animals.length} total):`,
      ...Object.entries(byType).map(([type, count]) => `  ${type}: ${count}`),
    );
  } else {
    sections.push('\nLIVESTOCK: No animals registered yet.');
  }

  // Crops summary
  if (data.crops.length > 0) {
    const byType: Record<string, number> = {};
    for (const c of data.crops) {
      const type = c.crop_type || c.name || 'Unknown';
      byType[type] = (byType[type] || 0) + 1;
    }
    sections.push(
      `\nCROPS (${data.crops.length} total):`,
      ...Object.entries(byType).map(([type, count]) => `  ${type}: ${count} plot(s)`),
    );
  } else {
    sections.push('\nCROPS: No crops planted yet.');
  }

  // Recent transactions
  if (data.recentTransactions.length > 0) {
    sections.push(`\nRECENT TRANSACTIONS (last ${data.recentTransactions.length}):`);
    for (const t of data.recentTransactions.slice(0, 10)) {
      sections.push(
        `  ${t.date || 'N/A'} | ${t.type} | $${t.amount} | ${t.category || 'Uncategorized'} | ${t.description || ''}`,
      );
    }
    if (data.recentTransactions.length > 10) {
      sections.push(`  ... and ${data.recentTransactions.length - 10} more`);
    }
  }

  return sections.join('\n');
}
