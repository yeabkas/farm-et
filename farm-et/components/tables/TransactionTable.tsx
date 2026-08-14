"use client";

import { useState } from "react";
import { Transaction } from "@/types/transaction";
import { ActionDropdown } from "@/components/ui/Dropdown";

interface TransactionTableProps {
  transactions: Transaction[];
  onEdit: (transaction: Transaction) => void;
  onDuplicate: (transaction: Transaction) => void;
  onDelete: (id: string | number) => void;
}

export function TransactionTable({
  transactions,
  onEdit,
  onDuplicate,
  onDelete,
}: TransactionTableProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-visible shadow-xs font-mono">
      <table className="w-full text-left border-collapse text-xs">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50 text-gray-600">
            <th className="p-3 w-8">
              <input type="checkbox" className="rounded-xs border-gray-300" />
            </th>
            <th className="p-3">Date</th>
            <th className="p-3">Payee</th>
            <th className="p-3">Category</th>
            <th className="p-3">Description</th>
            <th className="p-3">Type</th>
            <th className="p-3 text-right">Amount</th>
            <th className="p-3 w-8"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {transactions.map((tx) => {
            const isExpense = tx.type === "Expense";
            const formattedDate = new Date(tx.date).toLocaleDateString("en-US", {
              month: "short",
              day: "2-digit",
              year: "numeric",
            });

            return (
              <tr key={tx.id} className="hover:bg-gray-50/80">
                <td className="p-3">
                  <input type="checkbox" className="rounded-xs border-gray-300" />
                </td>
                <td className="p-3 text-emerald-600 cursor-pointer hover:underline font-medium">
                  {formattedDate}
                </td>
                <td className="p-3 text-gray-700">{tx.payeeCustomer || "--"}</td>
                <td className="p-3 text-gray-700">{tx.category}</td>
                <td className="p-3 text-gray-600 max-w-xs truncate">
                  {tx.description || tx.associatedTo || "--"}
                </td>
                <td className="p-3">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold text-white ${
                      isExpense ? "bg-red-500" : "bg-emerald-600"
                    }`}
                  >
                    {tx.type}
                  </span>
                </td>
                <td
                  className={`p-3 text-right font-medium ${
                    isExpense ? "text-gray-800" : "text-emerald-600"
                  }`}
                >
                  {isExpense ? `-$${tx.amount.toFixed(2)}` : `$${tx.amount.toFixed(2)}`}
                </td>
                <td className="p-3 text-right">
                  <ActionDropdown
                    item={tx}
                    itemLabel="Transaction"
                    onEdit={(t) => onEdit(t)}
                    onDuplicate={(t) => onDuplicate(t)}
                    onDelete={(id) => onDelete(id)}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}