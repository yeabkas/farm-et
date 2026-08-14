"use client";

import { useState, useRef, useEffect } from "react";
import { MoreVertical, Edit3, DollarSign, Copy, Trash2 } from "lucide-react";
import { Animal } from "@/types/animal";

interface AnimalActionDropdownProps {
  animal: Animal;
  onEdit: (animal: Animal) => void;
  onSell: (animal: Animal) => void;
  onDuplicate: (animal: Animal) => void;
  onDelete: (animalId: string | number) => void;
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
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-44 bg-white border border-gray-200 rounded-md shadow-lg z-50 py-1 font-mono text-xs">
          <button
            onClick={() => {
              onEdit(animal);
              setIsOpen(false);
            }}
            className="w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-50 flex items-center gap-2"
          >
            <Edit3 className="w-3.5 h-3.5 text-gray-500" />
            Edit Animal
          </button>

          <button
            onClick={() => {
              onSell(animal);
              setIsOpen(false);
            }}
            className="w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-50 flex items-center gap-2"
          >
            <DollarSign className="w-3.5 h-3.5 text-gray-500" />
            Sell Animal
          </button>

          <button
            onClick={() => {
              onDuplicate(animal);
              setIsOpen(false);
            }}
            className="w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-50 flex items-center gap-2 border-t border-gray-100"
          >
            <Copy className="w-3.5 h-3.5 text-gray-500" />
            Duplicate Animal
          </button>

          <button
            onClick={() => {
              if (animal.id !== undefined) onDelete(animal.id);
              setIsOpen(false);
            }}
            className="w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 flex items-center gap-2 border-t border-gray-100"
          >
            <Trash2 className="w-3.5 h-3.5 text-red-500" />
            Delete Animal
          </button>
        </div>
      )}
    </div>
  );
}