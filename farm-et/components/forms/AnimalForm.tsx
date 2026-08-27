"use client";

import { useState } from "react";
import { Animal } from "@/types/animal";

interface AnimalFormProps {
  initialData?: Animal | null;
  onCancel: () => void;
  onSubmit: (animal: Animal, files?: File[]) => void;
  isSubmitting?: boolean;
  uploadProgress?: number;
}

const defaultFormState = {
  name: "",
  animalType: "Cattle",
  breed: "",
  sex: "Female",
  age: "",
  status: "Active",
  neutered: "Intact",
  coloring: "",
  description: "",
  methodAcquired: "Raised on Farm",
  veterinarian: "",
  matureWeight: "",
  estimatedValue: "",
};

export function AnimalForm({ initialData, onCancel, onSubmit, isSubmitting, uploadProgress }: AnimalFormProps) {
  const [formData, setFormData] = useState<Omit<Animal, "id"> & { auctionDurationHours?: number, auctionStartingPrice?: number, auctionDurationValue?: number, auctionDurationUnit?: string }>(() => {
    if (initialData) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id: _, ...rest } = initialData;
      return {
        name: rest.name ?? "",
        animalType: rest.animalType ?? "Cattle",
        breed: rest.breed ?? "",
        sex: rest.sex ?? "Female",
        age: rest.age ?? "",
        status: rest.status ?? "Active",
        neutered: rest.neutered ?? "Intact",
        coloring: rest.coloring ?? "",
        description: rest.description ?? "",
        methodAcquired: rest.methodAcquired ?? "Raised on Farm",
        veterinarian: rest.veterinarian ?? "",
        matureWeight: rest.matureWeight ?? "",
        estimatedValue: rest.estimatedValue ?? "",
        auctionStartingPrice: (rest as Record<string, unknown>).auctionStartingPrice as number | undefined,
        auctionDurationValue: (rest as Record<string, unknown>).auctionDurationHours as number | undefined,
        auctionDurationUnit: 'hours',
      };
    }
    return defaultFormState;
  });

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const isEditing = Boolean(initialData);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const createAnimalObject = () => {
    let computedHours = formData.auctionDurationHours;
    if (formData.auctionDurationValue) {
      if (formData.auctionDurationUnit === 'days') computedHours = formData.auctionDurationValue * 24;
      else if (formData.auctionDurationUnit === 'months') computedHours = formData.auctionDurationValue * 24 * 30;
      else computedHours = formData.auctionDurationValue;
    }
    
    return {
      id: initialData?.id ?? 0,
      ...formData,
      auctionDurationHours: computedHours,
    };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;
    onSubmit(createAnimalObject(), selectedFiles);
  };

  const handleSaveAndNew = () => {
    if (!formData.name) return;
    onSubmit(createAnimalObject(), selectedFiles);
    setFormData(defaultFormState);
    setSelectedFiles([]);
  };

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-xs space-y-8 font-mono">
      <h2 className="text-xl font-mono text-gray-800 border-b pb-4">
        {isEditing ? `Edit Animal: ${initialData?.name}` : "New Animal"}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-mono text-gray-700 border-b pb-2">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 max-w-4xl">
            <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-0">
              <label className="w-full sm:w-40 text-sm font-mono text-gray-700">Name/Label</label>
              <input
                type="text"
                name="name"
                required
                value={formData.name ?? ""}
                onChange={handleInputChange}
                className="flex-1 border border-gray-300 rounded-md p-2 text-sm focus:ring-1 focus:ring-emerald-500 outline-none"
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-0">
              <label className="w-full sm:w-40 text-sm font-mono text-gray-700">Animal Type</label>
              <input
                type="text"
                name="animalType"
                value={formData.animalType ?? "Cattle"}
                onChange={handleInputChange}
                className="flex-1 border border-gray-300 rounded-md p-2 text-sm focus:ring-1 focus:ring-emerald-500 outline-none"
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-0">
              <label className="w-full sm:w-40 text-sm font-mono text-gray-700">Breed</label>
              <input
                type="text"
                name="breed"
                placeholder="Breed"
                value={formData.breed ?? ""}
                onChange={handleInputChange}
                className="flex-1 border border-gray-300 rounded-md p-2 text-sm focus:ring-1 focus:ring-emerald-500 outline-none"
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-0">
              <label className="w-full sm:w-40 text-sm font-mono text-gray-700">Sex</label>
              <select
                name="sex"
                value={formData.sex ?? "Female"}
                onChange={handleInputChange}
                className="flex-1 border border-gray-300 rounded-md p-2 text-sm bg-white focus:ring-1 focus:ring-emerald-500 outline-none"
              >
                <option value="Female">Female</option>
                <option value="Male">Male</option>
              </select>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-0">
              <label className="w-full sm:w-40 text-sm font-mono text-gray-700">Status</label>
              <select
                name="status"
                value={formData.status ?? "Active"}
                onChange={handleInputChange}
                className="flex-1 border border-gray-300 rounded-md p-2 text-sm bg-white focus:ring-1 focus:ring-emerald-500 outline-none"
              >
                <option value="Active">Active</option>
                <option value="Auction">Auction</option>
                <option value="For Sale">For Sale</option>
                <option value="Lactating">Lactating</option>
                <option value="Lost">Lost</option>
                <option value="Off Farm">Off Farm</option>
                <option value="Quarantined">Quarantined</option>
                <option value="Sold">Sold</option>
                <option value="Weaning">Weaning</option>
              </select>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-0">
              <label className="w-full sm:w-40 text-sm font-mono text-gray-700">Age</label>
              <div className="flex-1 flex border border-gray-300 rounded-md overflow-hidden">
                <input
                  type="number"
                  name="age"
                  value={formData.age ?? ""}
                  onChange={handleInputChange}
                  className="w-full p-2 text-sm outline-none"
                />
                <span className="bg-gray-100 border-l border-gray-300 px-3 flex items-center text-xs text-gray-500 font-mono">
                  yrs
                </span>
              </div>
            </div>
            
            {formData.status === 'Auction' && (
              <>
                <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-0">
                  <label className="w-full sm:w-40 text-sm font-mono text-gray-700">Starting Price</label>
                  <div className="flex-1 flex border border-gray-300 rounded-md overflow-hidden bg-emerald-50 border-emerald-200">
                    <span className="bg-emerald-100 border-r border-emerald-200 px-3 flex items-center text-xs text-emerald-700 font-mono">
                      $
                    </span>
                    <input
                      type="number"
                      name="auctionStartingPrice"
                      placeholder="Default: Est. Value"
                      value={formData.auctionStartingPrice ?? ""}
                      onChange={handleInputChange}
                      className="w-full p-2 text-sm outline-none bg-transparent"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-0">
                  <label className="w-full sm:w-40 text-sm font-mono text-gray-700">Auction Duration</label>
                  <div className="flex-1 flex border border-gray-300 rounded-md overflow-hidden bg-emerald-50 border-emerald-200">
                    <input
                      type="number"
                      name="auctionDurationValue"
                      placeholder="Default: 24 (hours)"
                      value={formData.auctionDurationValue ?? ""}
                      onChange={handleInputChange}
                      className="w-full p-2 text-sm outline-none bg-transparent"
                    />
                    <select
                      name="auctionDurationUnit"
                      value={formData.auctionDurationUnit || 'hours'}
                      onChange={handleInputChange}
                      className="bg-emerald-100 border-l border-emerald-200 px-2 flex items-center text-xs text-emerald-700 font-mono outline-none"
                    >
                      <option value="hours">hours</option>
                      <option value="days">days</option>
                      <option value="months">months</option>
                    </select>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Physical Characteristics */}
        <div className="space-y-4">
          <h3 className="text-lg font-mono text-gray-700 border-b pb-2">Physical Characteristics</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 max-w-4xl">
            <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-0">
              <label className="w-full sm:w-40 text-sm font-mono text-gray-700">Neutered</label>
              <div className="flex items-center gap-4 text-sm">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="neutered"
                    value="Neutered"
                    checked={formData.neutered === "Neutered"}
                    onChange={handleInputChange}
                    className="text-emerald-600 focus:ring-emerald-500"
                  />
                  Neutered
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="neutered"
                    value="Intact"
                    checked={formData.neutered === "Intact"}
                    onChange={handleInputChange}
                    className="text-emerald-600 focus:ring-emerald-500"
                  />
                  Intact
                </label>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-0">
              <label className="w-full sm:w-40 text-sm font-mono text-gray-700">Coloring</label>
              <input
                type="text"
                name="coloring"
                placeholder="Brown, white, Black, etc"
                value={formData.coloring ?? ""}
                onChange={handleInputChange}
                className="flex-1 border border-gray-300 rounded-md p-2 text-sm focus:ring-1 focus:ring-emerald-500 outline-none"
              />
            </div>

            <div className="flex flex-col sm:flex-row items-start gap-1.5 sm:gap-0 col-span-1 md:col-span-2">
              <label className="w-full sm:w-40 text-sm font-mono text-gray-700 pt-2">Description</label>
              <textarea
                name="description"
                rows={3}
                value={formData.description ?? ""}
                onChange={handleInputChange}
                className="flex-1 border border-gray-300 rounded-md p-2 text-sm focus:ring-1 focus:ring-emerald-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-mono text-gray-700 border-b pb-2">Additional Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 max-w-4xl">
            <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-0">
              <label className="w-full sm:w-40 text-sm font-mono text-gray-700">Method Acquired</label>
              <select
                name="methodAcquired"
                value={formData.methodAcquired ?? "Raised on Farm"}
                onChange={handleInputChange}
                className="flex-1 border border-gray-300 rounded-md p-2 text-sm bg-white focus:ring-1 focus:ring-emerald-500 outline-none"
              >
                <option value="Raised on Farm">Raised on Farm</option>
                <option value="Purchased">Purchased</option>
                <option value="Gifted/Donation">Gifted/Donation</option>
              </select>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-0">
              <label className="w-full sm:w-40 text-sm font-mono text-gray-700">Veterinarian</label>
              <input
                type="text"
                name="veterinarian"
                placeholder="Select or enter veterinarian"
                value={formData.veterinarian ?? ""}
                onChange={handleInputChange}
                className="flex-1 border border-gray-300 rounded-md p-2 text-sm focus:ring-1 focus:ring-emerald-500 outline-none"
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-0">
              <label className="w-full sm:w-40 text-sm font-mono text-gray-700">Mature Weight</label>
              <div className="flex-1 flex border border-gray-300 rounded-md overflow-hidden">
                <input
                  type="number"
                  name="matureWeight"
                  value={formData.matureWeight ?? ""}
                  onChange={handleInputChange}
                  className="w-full p-2 text-sm outline-none"
                />
                <span className="bg-gray-100 border-l border-gray-300 px-3 flex items-center text-xs text-gray-500 font-mono">
                  kg
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-0">
              <label className="w-full sm:w-40 text-sm font-mono text-gray-700">Estimated Value</label>
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
              </div>
            </div>
          </div>
        </div>

        {/* Images Upload */}
        <div className="space-y-4">
          <h3 className="text-lg font-mono text-gray-700 border-b pb-2">Images</h3>
          <div className="max-w-4xl">
            <div className="flex flex-col sm:flex-row items-start gap-1.5 sm:gap-0">
              <label className="w-full sm:w-40 text-sm font-mono text-gray-700 pt-2">Upload Images</label>
              <div className="flex-1 w-full">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer"
                />
                
                {(selectedFiles.length > 0 || (initialData?.images && initialData.images.length > 0)) && (
                  <div className="mt-4 flex gap-4 flex-wrap">
                    {/* Existing Images */}
                    {initialData?.images?.map((url: string, idx: number) => (
                      <div key={`existing-${idx}`} className="relative w-24 h-24 border border-gray-200 rounded-md overflow-hidden bg-gray-50">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={url} alt="saved preview" className="w-full h-full object-cover" />
                      </div>
                    ))}
                    
                    {/* New Selected Files */}
                    {selectedFiles.map((file, idx) => (
                      <div key={`new-${idx}`} className="relative w-24 h-24 border border-emerald-200 rounded-md overflow-hidden bg-gray-50 shadow-sm">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={URL.createObjectURL(file)} alt="new preview" className="w-full h-full object-cover opacity-80" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="pt-6 border-t flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <button type="button" className="text-xs text-emerald-600 hover:underline font-mono self-start sm:self-auto">
            Customize Fields
          </button>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-mono text-gray-600 hover:bg-gray-100 rounded-md transition w-full sm:w-auto text-center disabled:opacity-50"
            >
              Cancel
            </button>
            {!isEditing && (
              <button
                type="button"
                onClick={handleSaveAndNew}
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-mono border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-md transition w-full sm:w-auto text-center disabled:opacity-50"
              >
                Save & New
              </button>
            )}
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-sm font-mono bg-emerald-600 hover:bg-emerald-700 text-white rounded-md transition shadow-xs w-full sm:w-auto text-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Saving..." : isEditing ? "Save Changes" : "Create"}
            </button>
          </div>
        </div>

        {/* Upload Progress Overlay */}
        {isSubmitting && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl p-8 max-w-sm w-full mx-4 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-200 border-t-emerald-600 mx-auto mb-4"></div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                {(uploadProgress ?? 0) < 100 ? "Uploading Images..." : "Saving..."}
              </h3>
              {(uploadProgress ?? 0) > 0 && (uploadProgress ?? 0) < 100 && (
                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                  <div
                    className="bg-emerald-600 h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              )}
              <p className="text-sm text-gray-500">
                {(uploadProgress ?? 0) < 100
                  ? `Uploading... ${uploadProgress ?? 0}%`
                  : "Saving to database..."}
              </p>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
