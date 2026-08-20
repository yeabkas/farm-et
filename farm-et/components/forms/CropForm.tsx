"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { Crop } from "@/types/crop";

type CropFormState = {
  cropType: string;
  status: string;
  varietyStrain?: string;
  botanicalName?: string;
  description?: string;
  saleWindow?: number | string;
  internalId?: string;
  daysToMaturity?: number;
  harvestUnits: string;
  estimatedValue?: number;
  isPerennial?: boolean;
};

interface CropFormProps {
  initialData?: Crop | null;
  onCancel: () => void;
  onSubmit: (crop: Crop) => void;
}

const defaultFormState: CropFormState = {
  cropType: "",
  status: "Active",
  varietyStrain: "",
  botanicalName: "",
  description: "",
  saleWindow: "",
  internalId: "",
  daysToMaturity: undefined,
  harvestUnits: "kg",
  estimatedValue: undefined,
  isPerennial: false,
};

export function CropForm({ initialData, onCancel, onSubmit }: CropFormProps) {
  const [formData, setFormData] = useState<CropFormState>(() => {
    if (initialData) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id: _, harvestUnits, status, ...rest } = initialData;
      return {
        ...rest,
        status: status ?? "Active",
        harvestUnits: harvestUnits ?? "kg",
      };
    }
    return defaultFormState;
  });

  const isEditing = Boolean(initialData);

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (type === "number") {
      setFormData((prev) => ({
        ...prev,
        [name]: value === "" ? undefined : Number(value),
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const createCropObject = () => ({
    id: initialData?.id ?? 0,
    ...formData,
  });

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.cropType) return;
    onSubmit(createCropObject());
  };

  const handleSaveAndNew = () => {
    if (!formData.cropType) return;
    onSubmit(createCropObject());
    setFormData(defaultFormState);
  };

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-xs space-y-8 font-mono">
      <h2 className="text-xl font-mono text-gray-800 border-b pb-4">
        {isEditing ? `Edit Crop: ${initialData?.cropType}` : "New Crop"}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Type & Variety */}
        <div className="space-y-4">
          <h3 className="text-lg font-mono text-gray-700 border-b pb-2">
            Type & Variety
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 max-w-4xl">
            <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-0">
              <label className="w-full sm:w-40 text-sm font-mono text-gray-700">
                Crop Type *
              </label>
              <input
                type="text"
                name="cropType"
                required
                placeholder="e.g. Tomato, Corn, Aster"
                value={formData.cropType}
                onChange={handleInputChange}
                className="flex-1 border border-gray-300 rounded-md p-2 text-sm focus:ring-1 focus:ring-emerald-500 outline-none"
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-0">
              <label className="w-full sm:w-40 text-sm font-mono text-gray-700">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="flex-1 border border-gray-300 rounded-md p-2 text-sm focus:ring-1 focus:ring-emerald-500 outline-none bg-white"
              >
                <option value="Active">Active</option>
                <option value="Auction">Auction</option>
                <option value="For Sale">For Sale</option>
                <option value="Sold">Sold</option>
                <option value="Archived">Archived</option>
              </select>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-0">
              <label className="w-full sm:w-40 text-sm font-mono text-gray-700">
                Variety / Strain
              </label>
              <input
                type="text"
                name="varietyStrain"
                placeholder="e.g. Roma, Sweet Corn"
                value={formData.varietyStrain || ""}
                onChange={handleInputChange}
                className="flex-1 border border-gray-300 rounded-md p-2 text-sm focus:ring-1 focus:ring-emerald-500 outline-none"
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-0">
              <label className="w-full sm:w-40 text-sm font-mono text-gray-700">
                Botanical Name
              </label>
              <input
                type="text"
                name="botanicalName"
                placeholder="e.g. Solanum lycopersicum"
                value={formData.botanicalName || ""}
                onChange={handleInputChange}
                className="flex-1 border border-gray-300 rounded-md p-2 text-sm focus:ring-1 focus:ring-emerald-500 outline-none"
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-0">
              <label className="w-full sm:w-40 text-sm font-mono text-gray-700">
                Internal ID / SKU
              </label>
              <input
                type="text"
                name="internalId"
                placeholder="e.g. TOM-01"
                value={formData.internalId || ""}
                onChange={handleInputChange}
                className="flex-1 border border-gray-300 rounded-md p-2 text-sm focus:ring-1 focus:ring-emerald-500 outline-none"
              />
            </div>

            <div className="flex flex-col sm:flex-row items-start gap-1.5 sm:gap-0 col-span-1 md:col-span-2">
              <label className="w-full sm:w-40 text-sm font-mono text-gray-700 pt-2">
                Description
              </label>
              <textarea
                name="description"
                rows={3}
                placeholder="General details or growing conditions..."
                value={formData.description || ""}
                onChange={handleInputChange}
                className="flex-1 border border-gray-300 rounded-md p-2 text-sm focus:ring-1 focus:ring-emerald-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Growth & Planting Characteristics */}
        <div className="space-y-4">
          <h3 className="text-lg font-mono text-gray-700 border-b pb-2">
            Growth Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 max-w-4xl">
            <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-0">
              <label className="w-full sm:w-40 text-sm font-mono text-gray-700">
                Days to Maturity
              </label>
              <div className="flex-1 flex border border-gray-300 rounded-md overflow-hidden">
                <input
                  type="number"
                  name="daysToMaturity"
                  placeholder="0"
                  value={formData.daysToMaturity ?? ""}
                  onChange={handleInputChange}
                  className="w-full p-2 text-sm outline-none"
                />
                <span className="bg-gray-100 border-l border-gray-300 px-3 flex items-center text-xs text-gray-500 font-mono">
                  days
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-0">
              <label className="w-full sm:w-40 text-sm font-mono text-gray-700">
                Perennial
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="isPerennial"
                  id="isPerennial"
                  checked={Boolean(formData.isPerennial)}
                  onChange={handleInputChange}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-gray-300"
                />
                <label htmlFor="isPerennial" className="text-sm text-gray-600 cursor-pointer">
                  Plant is perennial (regrows annually)
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Harvest & Economics */}
        <div className="space-y-4">
          <h3 className="text-lg font-mono text-gray-700 border-b pb-2">
            Harvest & Economics
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 max-w-4xl">
            <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-0">
              <label className="w-full sm:w-40 text-sm font-mono text-gray-700">
                Harvest Units
              </label>
              <select
                name="harvestUnits"
                value={formData.harvestUnits || "kg"}
                onChange={handleInputChange}
                className="flex-1 border border-gray-300 rounded-md p-2 text-sm bg-white focus:ring-1 focus:ring-emerald-500 outline-none"
              >
                <option value="kg">Kilograms (kg)</option>
                <option value="lbs">Pounds (lbs)</option>
                <option value="bales">Bales</option>
                <option value="bunches">Bunches</option>
                <option value="bushels">Bushels</option>
                <option value="crates">Crates</option>
              </select>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-0">
              <label className="w-full sm:w-40 text-sm font-mono text-gray-700">
                Sale Window
              </label>
              <div className="flex-1 flex border border-gray-300 rounded-md overflow-hidden">
                <input
                  type="text"
                  name="saleWindow"
                  placeholder="e.g. 14"
                  value={formData.saleWindow || ""}
                  onChange={handleInputChange}
                  className="w-full p-2 text-sm outline-none"
                />
                <span className="bg-gray-100 border-l border-gray-300 px-3 flex items-center text-xs text-gray-500 font-mono">
                  days
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-0">
              <label className="w-full sm:w-40 text-sm font-mono text-gray-700">
                Est. Value
              </label>
              <div className="flex-1 flex border border-gray-300 rounded-md overflow-hidden">
                <span className="bg-gray-100 border-r border-gray-300 px-3 flex items-center text-xs text-gray-500 font-mono">
                  $
                </span>
                <input
                  type="number"
                  name="estimatedValue"
                  placeholder="0.00"
                  value={formData.estimatedValue ?? ""}
                  onChange={handleInputChange}
                  className="w-full p-2 text-sm outline-none"
                />
                <span className="bg-gray-100 border-l border-gray-300 px-3 flex items-center text-xs text-gray-500 font-mono">
                  / unit
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="pt-6 border-t flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <button
            type="button"
            className="text-xs text-emerald-600 hover:underline font-mono self-start sm:self-auto"
          >
            Customize Fields
          </button>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-mono text-gray-600 hover:bg-gray-100 rounded-md transition w-full sm:w-auto text-center"
            >
              Cancel
            </button>
            {!isEditing && (
              <button
                type="button"
                onClick={handleSaveAndNew}
                className="px-4 py-2 text-sm font-mono border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-md transition w-full sm:w-auto text-center"
              >
                Save & New
              </button>
            )}
            <button
              type="submit"
              className="px-5 py-2 text-sm font-mono bg-emerald-600 hover:bg-emerald-700 text-white rounded-md transition shadow-xs w-full sm:w-auto text-center"
            >
              {isEditing ? "Save Changes" : "Create"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}