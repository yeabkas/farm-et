"use client";

import { useState } from "react";
import { Search, Filter } from "lucide-react";
import { Animal } from "@/types/animal";
import { ActionDropdown } from "@/components/ui/Dropdown";

interface AnimalTableProps {
  animals: Animal[];
  onEdit?: (animal: Animal) => void;
  onSell?: (animal: Animal) => void;
  onDuplicate?: (animal: Animal) => void;
  onDelete?: (id: string) => void;
}

export function AnimalTable({ animals, onEdit, onSell, onDuplicate, onDelete }: AnimalTableProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredAnimals = animals.filter(
    (a) =>
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.breed.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.animalType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="flex items-center justify-end gap-3">
        <div className="relative w-72">
          <input
            type="text"
            placeholder="Search Animals"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full border border-gray-300 rounded-md pl-3 pr-8 py-1.5 text-sm outline-none focus:border-emerald-500"
          />
          <Search className="w-4 h-4 text-gray-400 absolute right-2.5 top-2.5" />
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span>Criteria: Status: Multiple</span>
          <button className="flex items-center gap-1 border border-gray-300 bg-white px-2.5 py-1.5 rounded-md hover:bg-gray-50 text-gray-700 font-mono">
            <Filter className="w-3.5 h-3.5" /> Filter
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="flex gap-4">
      <div className="bg-gray-100/80 border border-gray-200 px-6 py-3 rounded-md text-center min-w-25">
          <p className="text-xs text-gray-500">Animals</p>
          <p className="text-xl font-bold text-gray-800">{filteredAnimals.length}</p>
          <p className="text-[10px] text-gray-400">100% Of {filteredAnimals.length}</p>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-visible shadow-xs">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 text-xs font-mono text-gray-600">
              <th className="p-3 w-8">
                <input type="checkbox" className="rounded-xs border-gray-300" />
              </th>
              <th className="p-3">Animal</th>
              <th className="p-3">Gender</th>
              <th className="p-3">Age</th>
              <th className="p-3">Last Weight</th>
              <th className="p-3">Status</th>
              <th className="p-3">Type</th>
              <th className="p-3 w-8"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredAnimals.map((animal) => (
              <tr key={animal.id} className="hover:bg-gray-50/80">
                <td className="p-3">
                  <input type="checkbox" className="rounded-xs border-gray-300" />
                </td>
                <td className="p-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-300 text-gray-700 font-mono font-bold text-xs flex items-center justify-center uppercase">
                    {animal.name.substring(0, 2)}
                  </div>
                  <span className="font-mono text-emerald-600 cursor-pointer hover:underline">
                    {animal.name}
                  </span>
                </td>
                <td className="p-3 text-gray-600">{animal.sex}</td>
                <td className="p-3 text-gray-600">{animal.age ? `${animal.age} yrs` : "--"}</td>
                <td className="p-3 text-gray-600">
                  {animal.matureWeight ? `${animal.matureWeight} kg` : "--"}
                </td>
                <td className="p-3">
                  <span className="bg-emerald-600 text-white text-[11px] font-mono px-2.5 py-0.5 rounded-full">
                    {animal.status}
                  </span>
                </td>
                <td className="p-3 text-emerald-600">{animal.animalType}</td>
                <td className="p-3 text-right">
  <ActionDropdown 
    item={animal}
    itemLabel="Animal"
    onEdit={(a) => onEdit?.(a)}
    onSell={(a) => onSell?.(a)}
    onDuplicate={(a) => onDuplicate?.(a)}
    onDelete={(id) => onDelete?.(id)}
  />
</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-gray-500">
        Displaying {filteredAnimals.length} record(s)
      </p>
    </div>
  );
}