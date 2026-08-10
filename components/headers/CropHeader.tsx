"use client";

import { Plus, MoreVertical } from "lucide-react";

interface CropHeaderProps {
  onAddCropClick: () => void;
}

export function CropHeader({ onAddCropClick }: CropHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <h1 className="text-2xl font-mono text-gray-800">Crops</h1>

      <div className="flex items-center gap-2">
        <button
          onClick={onAddCropClick}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md text-sm font-mono transition flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Add Crop
        </button>
        <button className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-md text-sm font-mono transition">
          Add Group
        </button>
        <button className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 p-2 rounded-md transition">
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}