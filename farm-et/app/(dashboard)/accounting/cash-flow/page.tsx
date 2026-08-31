"use client";

import { useState, useEffect, useMemo } from "react";
import { ReportFilterBar } from "@/components/accounting/ReportFilterBar";
import { fetchTransactions } from "@/lib/services";

interface CashFlowItem {
  category: string;
  amount: number;
}

interface Transaction {
  id: number;
  type: 'Income' | 'Expense';
  category: string;
  amount: number;
  date: string;
}

export default function CashFlowStatementPage() {
  const [startDate, setStartDate] = useState("2026-01-01");
  const [endDate, setEndDate] = useState("2026-12-31");
  const [grouping, setGrouping] = useState("No Grouping");

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    setLoading(true);
    fetchTransactions()
      .then((res: any) => {
        setTransactions(res.data || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdate = () => {
    loadData();
  };

  const { operatingInflows, cashExpenditures, totalInflow, totalExpenditures, netChangeInCash, endingCashBalance } = useMemo(() => {
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();

    // Calculate beginning balance from transactions before startDate
    let beginningBalance = 0.0;
    transactions.forEach(t => {
      if (!t.date) return;
      const tTime = new Date(t.date).getTime();
      if (tTime < start) {
        const amt = Number(t.amount) || 0;
        if (t.type === 'Income') beginningBalance += amt;
        else if (t.type === 'Expense') beginningBalance -= amt;
      }
    });

    const filtered = transactions.filter(t => {
      if (!t.date) return false;
      const tTime = new Date(t.date).getTime();
      return tTime >= start && tTime <= end;
    });

    const inflowMap: Record<string, number> = {};
    const expenditureMap: Record<string, number> = {};

    filtered.forEach(t => {
      const amt = Number(t.amount) || 0;
      if (t.type === 'Income') {
        inflowMap[t.category] = (inflowMap[t.category] || 0) + amt;
      } else if (t.type === 'Expense') {
        expenditureMap[t.category] = (expenditureMap[t.category] || 0) + amt;
      }
    });

    const inflowArr: CashFlowItem[] = Object.keys(inflowMap).map(k => ({ category: k, amount: inflowMap[k] }));
    const expenditureArr: CashFlowItem[] = Object.keys(expenditureMap).map(k => ({ category: k, amount: -expenditureMap[k] })); // Negative for expenditures

    const tInflow = inflowArr.reduce((acc, i) => acc + i.amount, 0);
    const tExpenditures = expenditureArr.reduce((acc, i) => acc + i.amount, 0);

    const netChange = tInflow + tExpenditures;
    const endingBalance = beginningBalance + netChange;

    return {
      beginningBalance,
      operatingInflows: inflowArr,
      cashExpenditures: expenditureArr,
      totalInflow: tInflow,
      totalExpenditures: tExpenditures,
      netChangeInCash: netChange,
      endingCashBalance: endingBalance
    };
  }, [transactions, startDate, endDate]);

  // Using the calculated beginning balance instead of a hardcoded one
  const beginningBalance = endingCashBalance - netChangeInCash;

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
        FarmET is not responsible for the accuracy of this data. Always
        double check your records and confer with a professional tax accountant
        before submitting for tax purposes.
      </p>
    </div>
  );
}