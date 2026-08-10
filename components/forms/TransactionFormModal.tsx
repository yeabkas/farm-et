"use client";

import { useState } from "react";
import { X, Paperclip, Trash2 } from "lucide-react";
import {
  Transaction,
  TransactionType,
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
} from "@/types/transaction";

interface TransactionFormModalProps {
  isOpen: boolean;
  initialData?: Transaction | null;
  onClose: () => void;
  onSubmit: (transaction: Transaction) => void;
  onDelete?: (id: string) => void;
}

const getInitialTransactionFormState = (initialData?: Transaction | null): Partial<Transaction> => {
  if (initialData) return initialData;

  return {
    type: "Expense",
    amount: 0,
    payeeCustomer: "",
    category: EXPENSE_CATEGORIES[0],
    date: new Date().toISOString().split("T")[0],
    reportingYear: new Date().getFullYear().toString(),
    checkNumber: "",
    associatedTo: "",
    keywords: "",
    description: "",
  };
};

export function TransactionFormModal({
  isOpen,
  initialData,
  onClose,
  onSubmit,
  onDelete,
}: TransactionFormModalProps) {
  const [formData, setFormData] = useState<Partial<Transaction>>(
    getInitialTransactionFormState(initialData)
  );

  if (!isOpen) return null;

  const isEditing = Boolean(initialData);
  const categories =
    formData.type === "Expense" ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  const handleTypeChange = (type: TransactionType) => {
    const defaultCat =
      type === "Expense" ? EXPENSE_CATEGORIES[0] : INCOME_CATEGORIES[0];
    setFormData((prev) => ({ ...prev, type, category: defaultCat }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || !formData.category) return;

    const payload: Transaction = {
      id: initialData?.id || Date.now().toString(),
      type: formData.type || "Expense",
      amount: Number(formData.amount),
      payeeCustomer: formData.payeeCustomer || "",
      category: formData.category,
      date: formData.date || new Date().toISOString().split("T")[0],
      reportingYear: formData.reportingYear || new Date().getFullYear().toString(),
      checkNumber: formData.checkNumber || "",
      associatedTo: formData.associatedTo || "",
      keywords: formData.keywords || "",
      description: formData.description || "",
    };

    onSubmit(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col font-mono text-sm">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">
            {isEditing ? "Edit Transaction" : "New Transaction"}
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-md transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <form id="transaction-form" onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            {/* Left Column */}
            <div className="space-y-4">
              {/* Type Selection */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Type
                </label>
                <div className="flex items-center gap-6 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-gray-700">
                    <input
                      type="radio"
                      name="type"
                      checked={formData.type === "Expense"}
                      onChange={() => handleTypeChange("Expense")}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    Expense
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-gray-700">
                    <input
                      type="radio"
                      name="type"
                      checked={formData.type === "Income"}
                      onChange={() => handleTypeChange("Income")}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    Income
                  </label>
                </div>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Amount
                </label>
                <div className="flex border border-gray-300 rounded-md overflow-hidden focus-within:ring-1 focus-within:ring-emerald-500">
                  <span className="bg-gray-100 px-3 flex items-center text-gray-500 border-r border-gray-300">
                    $
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={formData.amount ?? ""}
                    onChange={(e) =>
                      setFormData({ ...formData, amount: parseFloat(e.target.value) })
                    }
                    className="w-full p-2 outline-none"
                  />
                </div>
              </div>

              {/* Payee / Customer */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Payee/Customer
                </label>
                <input
                  type="text"
                  placeholder="Example: Johnson Feed"
                  value={formData.payeeCustomer}
                  onChange={(e) => setFormData({ ...formData, payeeCustomer: e.target.value })}
                  className="w-full border border-gray-300 rounded-md p-2 outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full border border-gray-300 rounded-md p-2 bg-white outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Associated To */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Associated To
                </label>
                <input
                  type="text"
                  placeholder="Find Animal, Equipment, Plant, Location..."
                  value={formData.associatedTo}
                  onChange={(e) => setFormData({ ...formData, associatedTo: e.target.value })}
                  className="w-full border border-gray-300 rounded-md p-2 outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              {/* Date */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full border border-gray-300 rounded-md p-2 outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              {/* Reporting Year */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Reporting Year
                </label>
                <select
                  value={formData.reportingYear}
                  onChange={(e) => setFormData({ ...formData, reportingYear: e.target.value })}
                  className="w-full border border-gray-300 rounded-md p-2 bg-white outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="2026">2026</option>
                  <option value="2025">2025</option>
                  <option value="2024">2024</option>
                </select>
              </div>

              {/* Check Number */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Check Number
                </label>
                <input
                  type="text"
                  placeholder="Optional"
                  value={formData.checkNumber}
                  onChange={(e) => setFormData({ ...formData, checkNumber: e.target.value })}
                  className="w-full border border-gray-300 rounded-md p-2 outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              {/* Keywords */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Keywords
                </label>
                <input
                  type="text"
                  placeholder="Example: Vet, Vaccinations, etc"
                  value={formData.keywords}
                  onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                  className="w-full border border-gray-300 rounded-md p-2 outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Description
            </label>
            <textarea
              rows={3}
              placeholder="Add details..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full border border-gray-300 rounded-md p-2 outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Attachment Button */}
          <div>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 rounded-md text-xs text-gray-700 hover:bg-gray-50 transition"
            >
              <Paperclip className="w-3.5 h-3.5" />
              Add Attachment
            </button>
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-gray-50 rounded-b-lg">
          <div>
            {isEditing && onDelete && (
              <button
                type="button"
                onClick={() => {
                  if (initialData?.id) onDelete(initialData.id);
                  onClose();
                }}
                className="p-2 text-red-600 hover:bg-red-100 rounded-md transition"
                title="Delete Transaction"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition"
            >
              Close
            </button>
            <button
              type="submit"
              form="transaction-form"
              className="px-5 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition shadow-xs"
            >
              {isEditing ? "Update" : "Create"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}