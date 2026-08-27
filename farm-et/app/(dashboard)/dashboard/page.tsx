'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchFinancialSummary, fetchCrops, fetchAnimals } from '@/lib/services';
import { AiInsightsCard } from '@/components/dashboard/AiInsightsCard';

export default function OverviewDashboardPage() {
  // useQuery handles loading/error states without useEffect
  const { data: summaryData, isLoading, isError } = useQuery({
    queryKey: ['financialSummary', 2026],
    queryFn: () => fetchFinancialSummary(2026),
  });

  const { data: cropsResponse } = useQuery({
    queryKey: ['crops'],
    queryFn: fetchCrops,
  });

  const { data: animalsResponse } = useQuery({
    queryKey: ['animals'],
    queryFn: fetchAnimals,
  });

  const totals = summaryData?.summary;
  
  // Handle various response structures (e.g. paginated vs raw array)
  const cropsArray = Array.isArray(cropsResponse?.data) ? cropsResponse.data : (Array.isArray(cropsResponse) ? cropsResponse : []);
  const activeCropsCount = cropsArray.filter((c: { status: string }) => c.status !== 'Harvested' && c.status !== 'Completed').length;

  const animalsArray = Array.isArray(animalsResponse?.data) ? animalsResponse.data : (Array.isArray(animalsResponse) ? animalsResponse : []);
  const activeAnimalsCount = animalsArray.filter((a: { status: string }) => a.status !== 'Sold' && a.status !== 'Deceased').length;

  if (isLoading) {
    return <div className="p-6 text-gray-500">Loading summary...</div>;
  }

  if (isError) {
    return (
      <div className="p-6 text-red-500">
        Failed to load financial summary. Please ensure you are logged in.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Farm Overview</h1>
        <p className="text-sm text-gray-500">
          Welcome back! Here is what is happening across your farm today.
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {/* Total Income */}
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-xs">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
            Total Income ({summaryData?.year || 2026})
          </p>
          <p className="text-2xl font-bold text-green-600 mt-2">
            ${totals?.total_income ? totals.total_income.toLocaleString() : "0.00"}
          </p>
          <span className="text-xs text-gray-500 font-medium">Live from API</span>
        </div>

        {/* Net Income */}
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-xs">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
            Net Profit
          </p>
          <p className="text-2xl font-bold text-blue-600 mt-2">
            ${totals?.net_income ? totals.net_income.toLocaleString() : "0.00"}
          </p>
          <span className="text-xs text-gray-500 font-medium">Revenue - Expenses</span>
        </div>

        {/* Total Expenses */}
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-xs">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
            Total Expenses
          </p>
          <p className="text-2xl font-bold text-red-600 mt-2">
            ${totals?.total_expense ? totals.total_expense.toLocaleString() : "0.00"}
          </p>
          <span className="text-xs text-gray-500 font-medium">Total recorded costs</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-xs">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
            Active Crops
          </p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{activeCropsCount} Plots</p>
          <span className="text-xs text-green-600 font-medium">Live from API</span>
        </div>

        {/* Livestock */}
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-xs">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
            Livestock
          </p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{activeAnimalsCount} Animals</p>
          <span className="text-xs text-green-600 font-medium">Live from API</span>
        </div>
      </div>

      {/* AI Insights */}
      <AiInsightsCard />
    </div>
  );
}