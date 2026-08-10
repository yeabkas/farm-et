"use client";

import { Inbox } from "lucide-react";

interface TransactionEmptyStateProps {
  onRecordTransactionClick?: () => void;
}

export function TransactionEmptyState({
  onRecordTransactionClick,
}: TransactionEmptyStateProps) {
  return (
    <div className="border border-dashed border-gray-300 rounded-lg p-12 text-center bg-white space-y-3 font-mono">
      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto text-gray-400">
        <Inbox className="w-6 h-6" />
      </div>
      <h3 className="text-base font-semibold text-gray-700">
        No transactions yet?[cite: 1]
      </h3>
      <p className="text-xs text-gray-500 max-w-sm mx-auto">
        Add a transaction and it will show up here. Or adjust the filters above
        to see other transactions.[cite: 1]
      </p>
      {onRecordTransactionClick && (
        <button
          onClick={onRecordTransactionClick}
          className="mt-2 text-xs text-emerald-600 hover:underline font-medium cursor-pointer"
        >
          + Record your first transaction
        </button>
      )}
    </div>
  );
}