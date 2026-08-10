"use client";

import { useState, useRef, useEffect } from "react";
import { MoreVertical, Edit3, DollarSign, Copy, Trash2 } from "lucide-react";

// Generic interface where T represents any entity (Animal, Crop, etc.)
interface ActionDropdownProps<T extends { id?: string }> {
  item: T;
  itemLabel?: string; // Optional label for text (e.g., "Animal", "Crop")
  onEdit?: (item: T) => void;
  onSell?: (item: T) => void;
  onDuplicate?: (item: T) => void;
  onDelete?: (itemId: string) => void;
}

export function ActionDropdown<T extends { id?: string }>({
  item,
  itemLabel = "Item",
  onEdit,
  onSell,
  onDuplicate,
  onDelete,
}: ActionDropdownProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
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
          {/* Edit */}
          {onEdit && (
            <button
              onClick={() => {
                onEdit(item);
                setIsOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100 flex items-center gap-2.5"
            >
              <Edit3 className="w-3.5 h-3.5 text-gray-500" />
              Edit {itemLabel}
            </button>
          )}

          {/* Sell */}
          {onSell && (
            <button
              onClick={() => {
                onSell(item);
                setIsOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100 flex items-center gap-2.5"
            >
              <DollarSign className="w-3.5 h-3.5 text-gray-500" />
              Sell {itemLabel}
            </button>
          )}

          {(onEdit || onSell) && (onDuplicate || onDelete) && (
            <hr className="my-1 border-gray-200" />
          )}

          {/* Duplicate */}
          {onDuplicate && (
            <button
              onClick={() => {
                onDuplicate(item);
                setIsOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100 flex items-center gap-2.5"
            >
              <Copy className="w-3.5 h-3.5 text-gray-500" />
              Duplicate {itemLabel}
            </button>
          )}

          {/* Delete */}
          {onDelete && (
            <button
              onClick={() => {
                if (item.id) onDelete(item.id);
                setIsOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 flex items-center gap-2.5"
            >
              <Trash2 className="w-3.5 h-3.5 text-red-500" />
              Delete {itemLabel}
            </button>
          )}
        </div>
      )}
    </div>
  );
}