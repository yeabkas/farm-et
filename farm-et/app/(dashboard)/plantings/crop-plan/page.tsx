"use client";

import { useState, useEffect, useCallback } from "react";
import { Crop } from "@/types/crop";
import { CropForm } from "@/components/forms/CropForm";
import { CropHeader } from "@/components/headers/CropHeader";
import { CropTable } from "@/components/tables/CropTable";
import { CropEmptyState } from "@/components/emptyStates/CropEmptyState";
import api from "@/lib/api";
import { createAuction } from "@/lib/services";
import { CheckCircle, AlertCircle, X } from "lucide-react";

function SellModal({ crop, onClose, onConfirm }: { crop: Crop, onClose: () => void, onConfirm: (type: 'sale' | 'auction', durationHours?: number, price?: number) => void }) {
  const [type, setType] = useState<'sale' | 'auction'>('sale');
  const [duration, setDuration] = useState<number>(24);
  const [price, setPrice] = useState<number>(Number(crop.estimatedValue) || 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <h3 className="text-lg font-bold mb-4">List {crop.cropType} on Marketplace</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Listing Type</label>
            <select value={type} onChange={(e) => setType(e.target.value as any)} className="w-full border rounded-md p-2 outline-none focus:border-emerald-500">
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

export default function CropsPage() {
  const [crops, setCrops] = useState<Crop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingCrop, setEditingCrop] = useState<Crop | null>(null);
  const [sellingCrop, setSellingCrop] = useState<Crop | null>(null);
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

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleSubmitForm = async (submittedCrop: Crop, files?: File[]) => {
    try {
      setIsSubmitting(true);
      setUploadProgress(0);

      // Upload images directly to Cloudinary from the browser
      let imageUrls: string[] = submittedCrop.images ?? [];
      if (files && files.length > 0) {
        const { uploadToCloudinary } = await import("@/lib/cloudinary");
        const newUrls = await uploadToCloudinary(files, (pct) => setUploadProgress(pct));
        imageUrls = [...imageUrls, ...newUrls];
      }

      // Send crop data + image URLs as plain JSON to the backend
      const payload = { ...submittedCrop, images: imageUrls };

      if (editingCrop) {
        const res = await api.put(`/crops/${editingCrop.id}`, payload);
        const updated: Crop = res.data?.data ?? res.data;
        setCrops((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      } else {
        const res = await api.post("/crops", payload);
        const created: Crop = res.data?.data ?? res.data;
        setCrops((prev) => [...prev, created]);
      }
      setShowForm(false);
      setEditingCrop(null);
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      console.error("Failed to save crop:", err?.response?.data ?? err);
      alert("Failed to save crop: " + (err?.response?.data?.message ?? "Please try again."));
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
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

  const handleSellCrop = (crop: Crop) => {
    if (crop.status === "For Sale" || crop.status === "Auction") {
      setToast({ type: "info", message: `${crop.cropType} is already listed.` });
      return;
    }
    setSellingCrop(crop);
  };

  const confirmSell = async (type: 'sale' | 'auction', durationHours?: number, price?: number) => {
    if (!sellingCrop) return;
    try {
      if (type === 'sale') {
        const res = await api.put(`/crops/${sellingCrop.id}`, { ...sellingCrop, status: "For Sale", estimatedValue: price });
        const updated: Crop = res.data?.data ?? res.data;
        setCrops((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
        setToast({ type: "success", message: `${sellingCrop.cropType} is now listed For Sale! 🏷️` });
      } else {
        await createAuction({
          auctionable_type: 'crop',
          auctionable_id: Number(sellingCrop.id),
          starting_price: price || 0,
          duration_hours: durationHours
        });
        setCrops((prev) => prev.map((c) => (c.id === sellingCrop.id ? { ...c, status: "Auction", estimatedValue: price } : c)));
        setToast({ type: "success", message: `${sellingCrop.cropType} is now listed for Auction! 🔨` });
      }
      setSellingCrop(null);
    } catch (error) {
      console.error("Failed to list crop:", error);
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
        <CropEmptyState/>
      ) : (
        <CropTable
          crops={crops}
          onEdit={handleEditCrop}
          onSell={handleSellCrop}
          onDelete={handleDeleteCrop}
        />
      )}

      {sellingCrop && (
        <SellModal
          crop={sellingCrop}
          onClose={() => setSellingCrop(null)}
          onConfirm={confirmSell}
        />
      )}
    </div>
  );
}