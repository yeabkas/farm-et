"use client";

export default function OverviewDashboardPage() {
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-xs">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Active Crops</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">12 Plots</p>
          <span className="text-xs text-green-600 font-medium">↑ 2 planted this week</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-xs">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Livestock</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">48 Head</p>
          <span className="text-xs text-gray-500 font-medium">All healthy</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-xs">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Monthly Revenue</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">$4,250</p>
          <span className="text-xs text-green-600 font-medium">↑ 12% vs last month</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-xs">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Pending Tasks</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">5 Due</p>
          <span className="text-xs text-amber-600 font-medium">2 High Priority</span>
        </div>
      </div>
    </div>
  );
}