"use client";

import { useState, useEffect, useCallback } from "react";
import { Animal } from "@/types/animal";
import { AnimalForm } from "@/components/forms/AnimalForm";
import { AnimalHeader } from "@/components/headers/AnimalHeader";
import { AnimalTable } from "@/components/tables/AnimalTable";
import { AnimalEmptyState } from "@/components/emptyStates/AnimalEmptyState";
import api from "@/lib/api";
import { CheckCircle, AlertCircle, X } from "lucide-react";

type Toast = { type: "success" | "info" | "error"; message: string } | null;

export default function AnimalsPage() {
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingAnimal, setEditingAnimal] = useState<Animal | null>(null);
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

  const handleSubmitForm = async (submittedAnimal: Animal) => {
    try {
      if (editingAnimal) {
        const res = await api.put(`/animals/${editingAnimal.id}`, submittedAnimal);
        const updated: Animal = res.data?.data ?? res.data;
        setAnimals((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
      } else {
        const res = await api.post("/animals", submittedAnimal);
        const created: Animal = res.data?.data ?? res.data;
        setAnimals((prev) => [...prev, created]);
      }
      setShowForm(false);
      setEditingAnimal(null);
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      console.error("Failed to save animal:", err?.response?.data ?? err);
      alert("Failed to save animal: " + (err?.response?.data?.message ?? "Please try again."));
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

  const handleSellAnimal = async (animal: Animal) => {
    if (animal.status === "For Sale") {
      setToast({ type: "info", message: `${animal.name} is already listed for sale.` });
      return;
    }
    try {
      const res = await api.put(`/animals/${animal.id}`, { ...animal, status: "For Sale" });
      const updated: Animal = res.data?.data ?? res.data;
      setAnimals((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
      setToast({ type: "success", message: `${animal.name} is now listed For Sale in the Marketplace! 🏷️` });
    } catch (error) {
      console.error("Failed to mark animal for sale:", error);
      setToast({ type: "error", message: "Could not update status. Please try again." });
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
    </div>
  );
}