"use client";

import { useState, useMemo } from "react";
import { Transaction } from "@/types/transaction";
import { TransactionHeader } from "@/components/headers/TransactionHeader";
import { TransactionFormModal } from "@/components/forms/TransactionFormModal";
import { TransactionTable } from "@/components/tables/TransactionTable";
import { TransactionEmptyState } from "@/components/emptyStates/TransactionEmptyState";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  // Calculated totals for Revenue, Expenses, and Profit
  const { revenue, expenses, profit } = useMemo(() => {
    let rev = 0;
    let exp = 0;
    transactions.forEach((tx) => {
      if (tx.type === "Income") rev += tx.amount;
      if (tx.type === "Expense") exp += tx.amount;
    });
    return { revenue: rev, expenses: exp, profit: rev - exp };
  }, [transactions]);

  // Open modal for CREATING a new transaction
  const handleOpenAddForm = () => {
    setEditingTransaction(null);
    setIsModalOpen(true);
  };

  // Open modal for EDITING an existing transaction
  const handleEditTransaction = (tx: Transaction) => {
    setEditingTransaction(tx);
    setIsModalOpen(true);
  };

  // Duplicate an existing transaction
  const handleDuplicateTransaction = (tx: Transaction) => {
    const duplicated: Transaction = {
      ...tx,
      id: Date.now().toString(),
      description: tx.description ? `Copy of ${tx.description}` : `Copy of ${tx.category}`,
    };
    setTransactions((prev) => [duplicated, ...prev]);
  };

  // Delete a transaction
  const handleDeleteTransaction = (id: string | number) => {
    setTransactions((prev) => prev.filter((t) => String(t.id) !== String(id)));
  };

  // Form submit handler (Handles BOTH Create and Update)
  const handleSubmitForm = (submittedTx: Transaction) => {
    if (editingTransaction) {
      setTransactions((prev) =>
        prev.map((item) => (item.id === submittedTx.id ? submittedTx : item))
      );
    } else {
      setTransactions((prev) => [submittedTx, ...prev]);
    }

    setIsModalOpen(false);
    setEditingTransaction(null);
  };

  // Close modal handler
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTransaction(null);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-mono text-sm p-4">
      {/* 1. Header */}
      <TransactionHeader onRecordTransactionClick={handleOpenAddForm} />

      {/* 2. Transaction Summary Cards / Badges */}
      <div className="flex items-center gap-2">
        <span className="bg-emerald-600 text-white text-xs px-3 py-1 rounded-full font-semibold">
          Revenue: ${revenue.toFixed(2)}
        </span>
        <span className="bg-red-500 text-white text-xs px-3 py-1 rounded-full font-semibold">
          Expenses: ${expenses.toFixed(2)}
        </span>
        <span className="bg-emerald-700 text-white text-xs px-3 py-1 rounded-full font-semibold">
          Profit: ${profit.toFixed(2)}
        </span>
      </div>

      {/* 3. Main Content: Empty State vs Data Table */}
      {transactions.length === 0 ? (
        <TransactionEmptyState onRecordTransactionClick={handleOpenAddForm} />
      ) : (
        <TransactionTable
          transactions={transactions}
          onEdit={handleEditTransaction}
          onDuplicate={handleDuplicateTransaction}
          onDelete={handleDeleteTransaction}
        />
      )}

      {/* 4. Form Modal */}
      <TransactionFormModal
        isOpen={isModalOpen}
        initialData={editingTransaction}
        onClose={handleCloseModal}
        onSubmit={handleSubmitForm}
        onDelete={handleDeleteTransaction}
      />
    </div>
  );
}