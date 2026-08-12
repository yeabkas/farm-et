"use client";

import { useState } from "react";
import { Search, Filter } from "lucide-react";
import { Crop } from "@/types/crop";
import { ActionDropdown } from "@/components/ui/Dropdown";

interface CropTableProps {
  crops: Crop[];
  onEdit?: (crop: Crop) => void;
  onSell?: (crop: Crop) => void;
  onDuplicate?: (crop: Crop) => void;
  onDelete?: (id: string | number) => void;
}

export function CropTable({
  crops,
  onEdit,
  onSell,
  onDuplicate,
  onDelete,
}: CropTableProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCrops = crops.filter(
    (c) =>
      c.cropType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.varietyStrain &&
        c.varietyStrain.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.botanicalName &&
        c.botanicalName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.internalId &&
        c.internalId.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-4 font-mono">
      {/* Controls Bar */}
      <div className="flex items-center justify-end gap-3 font-sans">
        <div className="relative w-72">
          <input
            type="text"
            placeholder="Search Crops"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full border border-gray-300 rounded-md pl-3 pr-8 py-1.5 text-sm outline-none focus:border-emerald-500"
          />
          <Search className="w-4 h-4 text-gray-400 absolute right-2.5 top-2.5" />
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span>Criteria: All Crops</span>
          <button className="flex items-center gap-1 border border-gray-300 bg-white px-2.5 py-1.5 rounded-md hover:bg-gray-50 text-gray-700 font-mono">
            <Filter className="w-3.5 h-3.5" /> Filter
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="flex gap-4">
        <div className="bg-gray-100/80 border border-gray-200 px-6 py-3 rounded-md text-center min-w-25">
          <p className="text-xs text-gray-500">Crops</p>
          <p className="text-xl font-bold text-gray-800">
            {filteredCrops.length}
          </p>
          <p className="text-[10px] text-gray-400">
            100% Of {filteredCrops.length}
          </p>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-visible shadow-xs">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 text-xs font-mono text-gray-600">
              <th className="p-3 w-8">
                <input
                  type="checkbox"
                  className="rounded-xs border-gray-300"
                />
              </th>
              <th className="p-3">Crop / Variety</th>
              <th className="p-3">Botanical Name</th>
              <th className="p-3">SKU / ID</th>
              <th className="p-3">Days to Maturity</th>
              <th className="p-3">Perennial</th>
              <th className="p-3">Status</th>
              <th className="p-3">Est. Value</th>
              <th className="p-3 w-8"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredCrops.map((crop) => (
              <tr key={crop.id} className="hover:bg-gray-50/80">
                <td className="p-3">
                  <input
                    type="checkbox"
                    className="rounded-xs border-gray-300"
                  />
                </td>

                {/* Crop Type & Variety */}
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 font-mono font-bold text-xs flex items-center justify-center uppercase shrink-0">
                      {crop.cropType.substring(0, 2)}
                    </div>
                    <div>
                      <span className="font-mono text-emerald-600 cursor-pointer hover:underline font-medium block">
                        {crop.cropType}
                      </span>
                      {crop.varietyStrain && (
                        <span className="text-xs text-gray-500 block">
                          {crop.varietyStrain}
                        </span>
                      )}
                    </div>
                  </div>
                </td>

                {/* Botanical Name */}
                <td className="p-3 text-gray-600 italic text-xs">
                  {crop.botanicalName || "--"}
                </td>

                {/* SKU / Internal ID */}
                <td className="p-3 text-gray-600">
                  {crop.internalId || "--"}
                </td>

                {/* Days to Maturity */}
                <td className="p-3 text-gray-600">
                  {crop.daysToMaturity ? `${crop.daysToMaturity} days` : "--"}
                </td>

                {/* Perennial Status */}
                <td className="p-3">
                  {crop.isPerennial ? (
                    <span className="bg-emerald-100 text-emerald-800 text-[11px] font-mono px-2.5 py-0.5 rounded-full">
                      Yes
                    </span>
                  ) : (
                    <span className="bg-gray-100 text-gray-600 text-[11px] font-mono px-2.5 py-0.5 rounded-full">
                      Annual
                    </span>
                  )}
                </td>

                {/* Status */}
                <td className="p-3">
                  <span className={`text-[11px] font-mono px-2.5 py-0.5 rounded-full ${
                    crop.status === "For Sale"
                      ? "bg-amber-100 text-amber-800 border border-amber-300"
                      : crop.status === "Sold"
                      ? "bg-gray-200 text-gray-500 border border-gray-300"
                      : crop.status === "Archived"
                      ? "bg-red-50 text-red-400 border border-red-200"
                      : "bg-emerald-100 text-emerald-700 border border-emerald-200"
                  }`}>
                    {crop.status === "For Sale" ? "🏷️ For Sale" : (crop.status ?? "Active")}
                  </span>
                </td>

                {/* Revenue */}
                <td className="p-3 text-gray-600">
                  {crop.estimatedValue !== undefined && crop.estimatedValue !== null
                    ? `ETB ${crop.estimatedValue.toFixed(2)} / ${crop.harvestUnits || "unit"}`
                    : "--"}
                </td>

                {/* Actions */}
                <td className="p-3 text-right">
                  <ActionDropdown
                    item={crop}
                    itemLabel="Crop"
                    onEdit={(c) => onEdit?.(c)}
                    onSell={(c) => onSell?.(c)}
                    onDuplicate={(c) => onDuplicate?.(c)}
                    onDelete={(id) => onDelete?.(id)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-gray-500">
        Displaying {filteredCrops.length} record(s)
      </p>
    </div>
  );
}