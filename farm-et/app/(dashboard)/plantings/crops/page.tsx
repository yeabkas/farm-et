"use client";

import { useState, useEffect, useCallback } from "react";
import { Crop } from "@/types/crop";
import { CropForm } from "@/components/forms/CropForm";
import { CropHeader } from "@/components/headers/CropHeader";
import { CropTable } from "@/components/tables/CropTable";
import { CropEmptyState } from "@/components/emptyStates/CropEmptyState";
import api from "@/lib/api";
import { CheckCircle, AlertCircle, X } from "lucide-react";

type Toast = { type: "success" | "info" | "error"; message: string } | null;

export default function CropsPage() {
  const [crops, setCrops] = useState<Crop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingCrop, setEditingCrop] = useState<Crop | null>(null);
  const [toast, setToast] = useState<Toast>(null);

  // Auto-dismiss toast after 3s
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const loadCrops = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get("/crops");
      const items = response.data?.data ?? response.data;
      setCrops(Array.isArray(items) ? items : []);
    } catch (error) {
      const err = error as { response?: { status?: number } };
      const status = err?.response?.status;
      if (status === 401) {
        setError("You are not logged in. Please log in to view your crops.");
      } else {
        setError("Could not load crops. Please check your connection and try again.");
      }
      console.error("Failed to load crops:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadCrops();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadCrops]);

  const handleOpenAddForm = () => {
    setEditingCrop(null);
    setShowForm(true);
  };

  const handleEditCrop = (crop: Crop) => {
    setEditingCrop(crop);
    setShowForm(true);
  };

  const handleSubmitForm = async (submittedCrop: Crop) => {
    try {
      if (editingCrop) {
        const res = await api.put(`/crops/${editingCrop.id}`, submittedCrop);
        const updated: Crop = res.data?.data ?? res.data;
        setCrops((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      } else {
        const res = await api.post("/crops", submittedCrop);
        const created: Crop = res.data?.data ?? res.data;
        setCrops((prev) => [...prev, created]);
      }
      setShowForm(false);
      setEditingCrop(null);
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      console.error("Failed to save crop:", err?.response?.data ?? err);
      alert("Failed to save crop: " + (err?.response?.data?.message ?? "Please try again."));
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingCrop(null);
  };

  const handleDeleteCrop = async (id: string | number) => {
    if (!confirm("Delete this crop? This cannot be undone.")) return;
    try {
      await api.delete(`/crops/${id}`);
      setCrops((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.error("Failed to delete crop:", err);
    }
  };

  const handleSellCrop = async (crop: Crop) => {
    if (crop.status === "For Sale") {
      setToast({ type: "info", message: `${crop.cropType} is already listed for sale.` });
      return;
    }
    try {
      const res = await api.put(`/crops/${crop.id}`, { ...crop, status: "For Sale" });
      const updated: Crop = res.data?.data ?? res.data;
      setCrops((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      setToast({ type: "success", message: `${crop.cropType} is now listed For Sale in the Marketplace! 🏷️` });
    } catch (error) {
      console.error("Failed to mark crop for sale:", error);
      setToast({ type: "error", message: "Could not update status. Please try again." });
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-mono">
      {/* Toast notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-sans max-w-sm ${
          toast.type === "success" ? "bg-emerald-600 text-white" :
          toast.type === "info"    ? "bg-amber-500 text-white" :
                                     "bg-red-600 text-white"
        }`}>
          {toast.type === "success" ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          <span>{toast.message}</span>
          <button onClick={() => setToast(null)} className="ml-2 opacity-70 hover:opacity-100"><X className="w-3.5 h-3.5" /></button>
        </div>
      )}
      {!showForm && <CropHeader onAddCropClick={handleOpenAddForm} />}

      {showForm ? (
        <CropForm
          initialData={editingCrop}
          onCancel={handleCancel}
          onSubmit={handleSubmitForm}
        />
      ) : loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center space-y-2">
            <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm text-gray-500">Loading crops...</p>
          </div>
        </div>
      ) : error ? (
        <div className="text-center py-20 space-y-3">
          <p className="text-red-600 text-sm font-medium">{error}</p>
          <button
            onClick={loadCrops}
            className="px-4 py-2 text-sm bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition"
          >
            Retry
          </button>
        </div>
      ) : crops.length === 0 ? (
        <CropEmptyState />
      ) : (
        <CropTable
          crops={crops}
          onEdit={handleEditCrop}
          onSell={handleSellCrop}
          onDelete={handleDeleteCrop}
        />
      )}
    </div>
  );
}