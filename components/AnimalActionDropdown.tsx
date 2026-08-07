"use client";

import { useState, useRef, useEffect } from "react";
import { MoreVertical, Edit3, DollarSign, Copy, Trash2 } from "lucide-react";
import { Animal } from "@/types/animal";

interface AnimalActionDropdownProps {
  animal: Animal;
  onEdit: (animal: Animal) => void;
  onSell: (animal: Animal) => void;
  onDuplicate: (animal: Animal) => void;
  onDelete: (animalId: string) => void;
}

export function AnimalActionDropdown({
  animal,
  onEdit,
  onSell,
  onDuplicate,
  onDelete,
}: AnimalActionDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Three dots trigger button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="p-1.5 rounded-md text-gray-600 hover:bg-gray-200 transition focus:outline-none"
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {/* Action Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50 py-1 font-sans text-xs">
          {/* Edit Animal */}
          <button
            onClick={() => {
              onEdit(animal);
              setIsOpen(false);
            }}
            className="w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100 flex items-center gap-2.5"
          >
            <Edit3 className="w-3.5 h-3.5 text-gray-500" />
            Edit Animal
          </button>

          {/* Sell Animal */}
          <button
            onClick={() => {
              onSell(animal);
              setIsOpen(false);
            }}
            className="w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100 flex items-center gap-2.5"
          >
            <DollarSign className="w-3.5 h-3.5 text-gray-500" />
            Sell Animal
          </button>

          <hr className="my-1 border-gray-200" />

          {/* Duplicate Animal */}
          <button
            onClick={() => {
              onDuplicate(animal);
              setIsOpen(false);
            }}
            className="w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100 flex items-center gap-2.5"
          >
            <Copy className="w-3.5 h-3.5 text-gray-500" />
            Duplicate Animal
          </button>

          {/* Delete Animal */}
          <button
            onClick={() => {
              onDelete(animal.id);
              setIsOpen(false);
            }}
            className="w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 flex items-center gap-2.5"
          >
            <Trash2 className="w-3.5 h-3.5 text-red-500" />
            Delete Animal
          </button>
        </div>
      )}
    </div>
  );
}