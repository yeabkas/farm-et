"use client";

import { useState } from "react";
import { ReportFilterBar } from "@/components/accounting/ReportFilterBar";

interface ReportItem {
  category: string;
  amount: number;
}

export default function PnLStatementPage() {
  const [startDate, setStartDate] = useState("2026-01-01");
  const [endDate, setEndDate] = useState("2026-12-31");
  const [grouping, setGrouping] = useState("No Grouping");

  // Sample data matching screen design
  const incomeItems: ReportItem[] = [
    {
      category:
        "Sales of livestock, produce, grains, and other products you raised",
      amount: 100.0,
    },
  ];

  const expenseItems: ReportItem[] = [
    { category: "Depreciation", amount: 11.0 },
  ];

  const totalIncome = incomeItems.reduce((acc, item) => acc + item.amount, 0);
  const totalExpenses = expenseItems.reduce((acc, item) => acc + item.amount, 0);
  const netProfit = totalIncome - totalExpenses;

  const handleUpdate = () => {
    // Logic to refetch or recalculate report data based on date ranges
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-mono text-sm p-4">
      {/* Breadcrumbs */}
      <nav className="text-xs text-gray-500 space-x-1">
        <span>Accounting</span>
        <span>/</span>
        <span>Reports</span>
        <span>/</span>
        <span className="text-gray-700 font-medium">Profit and Loss Statement</span>
      </nav>

      {/* Page Heading */}
      <h1 className="text-xl font-bold text-gray-800">
        Profit and Loss Statement
      </h1>

      {/* Filter Controls Bar */}
      <ReportFilterBar
        startDate={startDate}
        endDate={endDate}
        grouping={grouping}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
        onGroupingChange={setGrouping}
        onUpdate={handleUpdate}
      />

      {/* Main Report Table Container */}
      <div className="border border-gray-200 rounded-md bg-white overflow-hidden shadow-xs">
        <table className="w-full text-left border-collapse text-xs">
          <tbody>
            {/* INCOME SECTION */}
            <tr className="border-b border-gray-200 bg-gray-50/50">
              <td colSpan={2} className="p-3 font-semibold text-gray-700 uppercase">
                Income
              </td>
            </tr>
            {incomeItems.map((item, idx) => (
              <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50/50">
                <td className="p-3 text-gray-700 pl-6">{item.category}</td>
                <td className="p-3 text-right font-medium text-gray-800 w-48">
                  ${item.amount.toFixed(2)}
                </td>
              </tr>
            ))}
            <tr className="border-b border-gray-200 bg-gray-50 font-bold text-gray-800">
              <td className="p-3 uppercase">Total Income</td>
              <td className="p-3 text-right">${totalIncome.toFixed(2)}</td>
            </tr>

            {/* EXPENSES SECTION */}
            <tr className="border-b border-gray-200 bg-gray-50/50">
              <td colSpan={2} className="p-3 font-semibold text-gray-700 uppercase">
                Expenses
              </td>
            </tr>
            {expenseItems.map((item, idx) => (
              <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50/50">
                <td className="p-3 text-gray-700 pl-6">{item.category}</td>
                <td className="p-3 text-right font-medium text-gray-800 w-48">
                  ${item.amount.toFixed(2)}
                </td>
              </tr>
            ))}
            <tr className="border-b border-gray-200 bg-gray-50 font-bold text-gray-800">
              <td className="p-3 uppercase">Total Expenses</td>
              <td className="p-3 text-right">${totalExpenses.toFixed(2)}</td>
            </tr>

            {/* NET PROFIT SUMMARY */}
            <tr className="bg-gray-100 font-bold text-gray-900 border-t-2 border-gray-300">
              <td className="p-3 uppercase">Net Profit</td>
              <td className="p-3 text-right">${netProfit.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Legal/Disclaimer Notice */}
      <p className="text-[11px] text-gray-500 pt-2">
        Farmbrite is not responsible for the accuracy of this data. Always
        review and double check your records with an accounting professional.
      </p>
    </div>
  );
}