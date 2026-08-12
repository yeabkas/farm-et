"use client";

import { Plus } from "lucide-react";

interface TransactionHeaderProps {
  onRecordTransactionClick: () => void;
}

export function TransactionHeader({
  onRecordTransactionClick,
}: TransactionHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <h1 className="text-xl font-bold text-gray-800">Accounting</h1>
      <button
        type="button"
        onClick={onRecordTransactionClick}
        className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md font-medium text-xs shadow-xs transition cursor-pointer"
      >
        <Plus className="w-4 h-4" /> Record a Transaction
      </button>
    </div>
  );
}