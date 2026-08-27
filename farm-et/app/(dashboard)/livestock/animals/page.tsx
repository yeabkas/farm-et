"use client";

import { useState, useEffect, useCallback } from "react";
import { Animal } from "@/types/animal";
import { AnimalForm } from "@/components/forms/AnimalForm";
import { AnimalHeader } from "@/components/headers/AnimalHeader";
import { AnimalTable } from "@/components/tables/AnimalTable";
import { AnimalEmptyState } from "@/components/emptyStates/AnimalEmptyState";
import api from "@/lib/api";
import { createAuction } from "@/lib/services";
import { CheckCircle, AlertCircle, X } from "lucide-react";

function SellModal({ animal, onClose, onConfirm }: { animal: Animal, onClose: () => void, onConfirm: (type: 'sale' | 'auction', durationHours?: number, price?: number) => void }) {
  const [type, setType] = useState<'sale' | 'auction'>('sale');
  const [duration, setDuration] = useState<number>(24);
  const [price, setPrice] = useState<number>(Number(animal.estimatedValue) || 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <h3 className="text-lg font-bold mb-4">List {animal.name} on Marketplace</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Listing Type</label>
            <select value={type} onChange={(e) => setType(e.target.value as 'sale' | 'auction')} className="w-full border rounded-md p-2 outline-none focus:border-emerald-500">
              <option value="sale">Fixed Price Sale</option>
              <option value="auction">Auction</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">{type === 'auction' ? 'Starting Price (ETB)' : 'Price (ETB)'}</label>
            <input type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} className="w-full border rounded-md p-2 outline-none focus:border-emerald-500" />
          </div>

          {type === 'auction' && (
            <div>
              <label className="block text-sm font-medium mb-1">Auction Duration (Hours)</label>
              <input type="number" min="1" value={duration} onChange={(e) => setDuration(Number(e.target.value))} className="w-full border rounded-md p-2 outline-none focus:border-emerald-500" />
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md">Cancel</button>
          <button onClick={() => onConfirm(type, duration, price)} className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700">List Item</button>
        </div>
      </div>
    </div>
  );
}

type Toast = { type: "success" | "info" | "error"; message: string } | null;

export default function AnimalsPage() {
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingAnimal, setEditingAnimal] = useState<Animal | null>(null);
  const [sellingAnimal, setSellingAnimal] = useState<Animal | null>(null);
  const [toast, setToast] = useState<Toast>(null);

  // Auto-dismiss toast after 3s
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const loadAnimals = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get("/animals");
      const items = response.data?.data ?? response.data;
      setAnimals(Array.isArray(items) ? items : []);
    } catch (error) {
      const err = error as { response?: { status?: number } };
      const status = err?.response?.status;
      if (status === 401) {
        setError("You are not logged in. Please log in to view your animals.");
      } else {
        setError("Could not load animals. Please check your connection and try again.");
      }
      console.error("Failed to load animals:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadAnimals();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadAnimals]);

  const handleOpenAddForm = () => {
    setEditingAnimal(null);
    setShowForm(true);
  };

  const handleEditAnimal = (animal: Animal) => {
    setEditingAnimal(animal);
    setShowForm(true);
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleSubmitForm = async (submittedAnimal: Animal, files?: File[]) => {
    try {
      setIsSubmitting(true);
      setUploadProgress(0);

      // Upload images directly to Cloudinary from the browser
      let imageUrls: string[] = submittedAnimal.images ?? [];
      if (files && files.length > 0) {
        const { uploadToCloudinary } = await import("@/lib/cloudinary");
        const newUrls = await uploadToCloudinary(files, (pct) => setUploadProgress(pct));
        imageUrls = [...imageUrls, ...newUrls];
      }

      // Send animal data + image URLs as plain JSON to the backend
      const payload = { ...submittedAnimal, images: imageUrls };

      if (editingAnimal) {
        const res = await api.put(`/animals/${editingAnimal.id}`, payload);
        const updated: Animal = res.data?.data ?? res.data;
        setAnimals((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
      } else {
        const res = await api.post("/animals", payload);
        const created: Animal = res.data?.data ?? res.data;
        setAnimals((prev) => [...prev, created]);
      }
      setShowForm(false);
      setEditingAnimal(null);
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      console.error("Failed to save animal:", err?.response?.data ?? err);
      alert("Failed to save animal: " + (err?.response?.data?.message ?? "Please try again."));
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingAnimal(null);
  };

  const handleDeleteAnimal = async (id: string | number) => {
    if (!confirm("Delete this animal? This cannot be undone.")) return;
    try {
      await api.delete(`/animals/${id}`);
      setAnimals((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      console.error("Failed to delete animal:", err);
    }
  };

  const handleSellAnimal = (animal: Animal) => {
    if (animal.status === "For Sale" || animal.status === "Auction") {
      setToast({ type: "info", message: `${animal.name} is already listed.` });
      return;
    }
    setSellingAnimal(animal);
  };

  const confirmSell = async (type: 'sale' | 'auction', durationHours?: number, price?: number) => {
    if (!sellingAnimal) return;
    try {
      if (type === 'sale') {
        const res = await api.put(`/animals/${sellingAnimal.id}`, { ...sellingAnimal, status: "For Sale", estimated_value: price });
        const updated: Animal = res.data?.data ?? res.data;
        setAnimals((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
        setToast({ type: "success", message: `${sellingAnimal.name} is now listed For Sale! 🏷️` });
      } else {
        await createAuction({
          auctionable_type: 'animal',
          auctionable_id: Number(sellingAnimal.id),
          starting_price: price || 0,
          duration_hours: durationHours
        });
        setAnimals((prev) => prev.map((a) => (a.id === sellingAnimal.id ? { ...a, status: "Auction", estimatedValue: price } : a)));
        setToast({ type: "success", message: `${sellingAnimal.name} is now listed for Auction! 🔨` });
      }
      setSellingAnimal(null);
    } catch (error) {
      console.error("Failed to list animal:", error);
      setToast({ type: "error", message: "Could not list item. Please try again." });
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-mono">
      {/* Toast notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-sans max-w-sm transition-all ${
          toast.type === "success" ? "bg-emerald-600 text-white" :
          toast.type === "info"    ? "bg-amber-500 text-white" :
                                     "bg-red-600 text-white"
        }`}>
          {toast.type === "success" ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          <span>{toast.message}</span>
          <button onClick={() => setToast(null)} className="ml-2 opacity-70 hover:opacity-100"><X className="w-3.5 h-3.5" /></button>
        </div>
      )}
      {!showForm && <AnimalHeader onAddAnimalClick={handleOpenAddForm} />}

      {showForm ? (
        <AnimalForm
          initialData={editingAnimal}
          onCancel={handleCancel}
          onSubmit={handleSubmitForm}
          isSubmitting={isSubmitting}
          uploadProgress={uploadProgress}
        />
      ) : loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center space-y-2">
            <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm text-gray-500">Loading animals...</p>
          </div>
        </div>
      ) : error ? (
        <div className="text-center py-20 space-y-3">
          <p className="text-red-600 text-sm font-medium">{error}</p>
          <button
            onClick={loadAnimals}
            className="px-4 py-2 text-sm bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition"
          >
            Retry
          </button>
        </div>
      ) : animals.length === 0 ? (
        <AnimalEmptyState />
      ) : (
        <AnimalTable
          animals={animals}
          onEdit={handleEditAnimal}
          onSell={handleSellAnimal}
          onDelete={handleDeleteAnimal}
        />
      )}

      {sellingAnimal && (
        <SellModal
          animal={sellingAnimal}
          onClose={() => setSellingAnimal(null)}
          onConfirm={confirmSell}
        />
      )}
    </div>
  );
}