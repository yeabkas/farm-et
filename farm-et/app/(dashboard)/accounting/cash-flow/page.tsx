"use client";

import { useState } from "react";
import { ReportFilterBar } from "@/components/accounting/ReportFilterBar";

interface CashFlowItem {
  category: string;
  amount: number;
}

export default function CashFlowStatementPage() {
  const [startDate, setStartDate] = useState("2026-01-01");
  const [endDate, setEndDate] = useState("2026-12-31");
  const [grouping, setGrouping] = useState("No Grouping");

  // Balances
  const beginningBalance = 0.0;

  // Operating Cash Inflow
  const operatingInflows: CashFlowItem[] = [
    {
      category:
        "Sales of livestock, produce, grains, and other products you raised",
      amount: 100.0,
    },
  ];

  // Cash Expenditures
  const cashExpenditures: CashFlowItem[] = [
    { category: "Depreciation", amount: -11.0 },
  ];

  const totalInflow = operatingInflows.reduce((acc, i) => acc + i.amount, 0);
  const totalExpenditures = cashExpenditures.reduce(
    (acc, i) => acc + i.amount,
    0
  );
  const netChangeInCash = totalInflow + totalExpenditures;
  const endingCashBalance = beginningBalance + netChangeInCash;

  const handleUpdate = () => {
    // Refetch or recalculate logic
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-mono text-sm p-4">
      {/* Breadcrumbs */}
      <nav className="text-xs text-gray-500 space-x-1">
        <span>Accounting</span>
        <span>/</span>
        <span>Reports</span>
        <span>/</span>
        <span className="text-gray-700 font-medium">Cash Flow Statement</span>
      </nav>

      {/* Title */}
      <h1 className="text-xl font-bold text-gray-800">Cash Flow Statement</h1>

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

      {/* Statement Table */}
      <div className="border-t border-b border-gray-200 bg-white py-2 overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs whitespace-nowrap min-w-full">
          <tbody>
            {/* BEGINNING CASH BALANCE */}
            <tr className="border-b border-gray-200 font-bold text-gray-800">
              <td className="p-3 text-right pr-6" colSpan={1}>
                Beginning Cash Balance
              </td>
              <td className="p-3 text-right w-48">${beginningBalance.toFixed(2)}</td>
            </tr>

            {/* CASH FROM OPERATING ACTIVITIES */}
            <tr>
              <td colSpan={2} className="p-3 font-semibold text-gray-800 text-sm">
                Cash from Operating Activities
              </td>
            </tr>
            {operatingInflows.map((item, idx) => (
              <tr key={idx} className="border-b border-gray-100">
                <td className="p-3 text-gray-700 pl-6">{item.category}</td>
                <td className="p-3 text-right font-medium text-gray-800">
                  ${item.amount.toFixed(2)}
                </td>
              </tr>
            ))}
            <tr className="border-b border-gray-200 font-bold text-gray-800">
              <td className="p-3 text-right pr-6">Total Cash Inflow:</td>
              <td className="p-3 text-right">${totalInflow.toFixed(2)}</td>
            </tr>

            {/* CASH EXPENDITURES */}
            <tr>
              <td colSpan={2} className="p-3 font-semibold text-gray-800 text-sm pt-6">
                Cash Expenditures
              </td>
            </tr>
            {cashExpenditures.map((item, idx) => (
              <tr key={idx} className="border-b border-gray-100">
                <td className="p-3 text-gray-700 pl-6">{item.category}</td>
                <td className="p-3 text-right font-medium text-gray-800">
                  -${Math.abs(item.amount).toFixed(2)}
                </td>
              </tr>
            ))}
            <tr className="border-b border-gray-200 font-bold text-gray-800">
              <td className="p-3 text-right pr-6">Total Expenditures:</td>
              <td className="p-3 text-right">
                -${Math.abs(totalExpenditures).toFixed(2)}
              </td>
            </tr>

            {/* SUMMARY TOTALS */}
            <tr className="font-bold text-gray-800 pt-4">
              <td className="p-3 text-right pr-6">Net Change in Cash:</td>
              <td className="p-3 text-right">${netChangeInCash.toFixed(2)}</td>
            </tr>
            <tr className="font-bold text-emerald-600">
              <td className="p-3 text-right pr-6">Ending Cash Balance:</td>
              <td className="p-3 text-right text-emerald-600">
                ${endingCashBalance.toFixed(2)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Legal / Tax Disclaimer */}
      <p className="text-[11px] text-gray-500 text-center pt-4">
        Farmbrite is not responsible for the accuracy of this data. Always
        double check your records and confer with a professional tax accountant
        before submitting for tax purposes.
      </p>
    </div>
  );
}