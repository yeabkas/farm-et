"use client";

import { useState } from "react";
import { Crop } from "@/types/crop";
import { CropForm } from "@/components/forms/CropForm";
import { CropHeader } from "@/components/headers/CropHeader";
import { CropTable } from "@/components/tables/CropTable";
import { CropEmptyState } from "@/components/emptyStates/CropEmptyState";

export default function CropsPage() {
  const [crops, setCrops] = useState<Crop[]>([]);
  const [showForm, setShowForm] = useState(false);

  // Track crop being edited
  const [editingCrop, setEditingCrop] = useState<Crop | null>(null);

  // Open form for CREATING a new crop
  const handleOpenAddForm = () => {
    setEditingCrop(null);
    setShowForm(true);
  };

  // Open form for EDITING an existing crop
  const handleEditCrop = (crop: Crop) => {
    setEditingCrop(crop);
    setShowForm(true);
  };

  // Handle form submission (Handles BOTH Create and Update)
  const handleSubmitForm = (submittedCrop: Crop) => {
    if (editingCrop) {
      // Update existing crop in state
      setCrops((prev) =>
        prev.map((c) => (c.id === submittedCrop.id ? submittedCrop : c))
      );
    } else {
      // Add new crop to state
      setCrops((prev) => [...prev, submittedCrop]);
    }

    // Reset view state
    setShowForm(false);
    setEditingCrop(null);
  };

  // Handle cancel action
  const handleCancel = () => {
    setShowForm(false);
    setEditingCrop(null);
  };

  // Handle deletion
  const handleDeleteCrop = (id: string) => {
    setCrops((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-mono">
      {!showForm && <CropHeader onAddCropClick={handleOpenAddForm} />}

      {showForm ? (
        <CropForm
          initialData={editingCrop}
          onCancel={handleCancel}
          onSubmit={handleSubmitForm}
        />
      ) : crops.length === 0 ? (
        <CropEmptyState/>
      ) : (
        <CropTable
          crops={crops}
          onEdit={handleEditCrop}
          onDelete={handleDeleteCrop}
        />
      )}
    </div>
  );
} 