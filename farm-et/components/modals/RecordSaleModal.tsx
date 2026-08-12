"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Animal } from "@/types/animal";

interface RecordSaleModalProps {
  animal: Animal;
  onClose: () => void;
  onConfirmSale: (animalId: string, saleData: { buyer: string; price: number; note: string }) => void;
}

export function RecordSaleModal({ animal, onClose, onConfirmSale }: RecordSaleModalProps) {
  const [billOfSaleNum] = useState(() => Math.floor(100000000 + Math.random() * 900000000).toString());
  const [note, setNote] = useState("");
  const [date, setDate] = useState("2026-08-05");
  const [buyer, setBuyer] = useState("");
  const [price, setPrice] = useState<number>(0);
  const [recordIncome, setRecordIncome] = useState(true);
  const [generateBill, setGenerateBill] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirmSale(animal.id, {
      buyer,
      price,
      note,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs font-mono">
      <div className="bg-white rounded-lg border border-gray-200 shadow-2xl w-full max-w-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-800">Record Sale of {animal.name}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700">Sell 1 Animal</h3>

            <div>
              <label className="block text-xs text-gray-500 mb-1">Bill Of Sale #</label>
              <input
                type="text"
                value={billOfSaleNum}
                readOnly
                className="w-full max-w-xs border border-gray-300 rounded-md p-2 text-sm bg-gray-50 text-gray-600 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1">Note</label>
              <textarea
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full border border-gray-300 rounded-md p-2 text-sm outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full border border-gray-300 rounded-md p-2 text-sm outline-none"
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Keywords e.g. vet, insects"
                  className="w-full border border-gray-300 rounded-md p-2 text-sm outline-none"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4 border-t pt-4">
            <h3 className="text-sm font-semibold text-gray-700">Sale Information</h3>

            <div className="grid grid-cols-1 gap-4 max-w-md">
              <div className="flex items-center">
                <label className="w-32 text-xs text-gray-600">Sold To</label>
                <input
                  type="text"
                  placeholder="John Smith"
                  value={buyer}
                  onChange={(e) => setBuyer(e.target.value)}
                  className="flex-1 border border-gray-300 rounded-md p-2 text-sm outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center">
                <label className="w-32 text-xs text-gray-600">Total Sale Price</label>
                <div className="flex-1 flex border border-gray-300 rounded-md overflow-hidden">
                  <span className="bg-gray-100 border-r border-gray-300 px-3 flex items-center text-xs text-gray-500">
                    $
                  </span>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full p-2 text-sm outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2 text-xs text-gray-700 pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={recordIncome}
                  onChange={(e) => setRecordIncome(e.target.checked)}
                  className="rounded-xs text-emerald-600"
                />
                Record Income Transaction
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={generateBill}
                  onChange={(e) => setGenerateBill(e.target.checked)}
                  className="rounded-xs text-emerald-600"
                />
                Generate a Bill of Sale
              </label>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm bg-emerald-600 hover:bg-emerald-700 text-white rounded-md transition shadow-xs"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}