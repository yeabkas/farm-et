"use client";

import { Printer } from "lucide-react";

interface ReportFilterBarProps {
  startDate: string;
  endDate: string;
  grouping: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  onGroupingChange: (grouping: string) => void;
  onUpdate: () => void;
}

export function ReportFilterBar({
  startDate,
  endDate,
  grouping,
  onStartDateChange,
  onEndDateChange,
  onGroupingChange,
  onUpdate,
}: ReportFilterBarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 font-mono text-xs">
      <div className="flex items-center gap-3">
        {/* Start Date */}
        <input
          type="date"
          value={startDate}
          onChange={(e) => onStartDateChange(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-1.5 bg-white text-gray-700 outline-none focus:border-emerald-500"
        />

        {/* End Date */}
        <input
          type="date"
          value={endDate}
          onChange={(e) => onEndDateChange(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-1.5 bg-white text-gray-700 outline-none focus:border-emerald-500"
        />

        {/* Grouping Dropdown */}
        <select
          value={grouping}
          onChange={(e) => onGroupingChange(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-1.5 bg-white text-gray-700 outline-none focus:border-emerald-500"
        >
          <option value="No Grouping">No Grouping</option>
          <option value="By Month">By Month</option>
          <option value="By Category">By Category</option>
        </select>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onUpdate}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-4 py-1.5 rounded-md transition shadow-xs cursor-pointer"
        >
          Update
        </button>

        <button
          onClick={() => window.print()}
          className="border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 p-1.5 rounded-md transition cursor-pointer"
          title="Print Report"
        >
          <Printer className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}