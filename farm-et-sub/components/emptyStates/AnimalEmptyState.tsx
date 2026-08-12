"use client";

import { Tag } from "lucide-react";

export function AnimalEmptyState() {
  return (
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-16 flex flex-col items-center justify-center text-center bg-gray-50/50 min-h-380px">
      <div className="w-16 h-16 bg-gray-600 text-white rounded-lg flex items-center justify-center mb-4 shadow-xs">
        <Tag className="w-8 h-8 -rotate-45" />
      </div>
      <h3 className="text-xl font-mono text-gray-800 italic">No animals yet?</h3>
      <p className="text-sm text-gray-500 mt-1 max-w-md">
        Add a new animal or import your current animals and they&apos;ll show up here. 
      </p>
      <p className="text-xs text-gray-500 mt-2">
        Need help? Check out this{" "}
        <span className="text-emerald-600 font-mono hover:underline cursor-pointer">
          Getting Started Guide
        </span>
        .
      </p>
    </div>
  );
}