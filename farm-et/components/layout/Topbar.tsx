"use client";

import Link from "next/link";
import { Bell, Search, Plus, User } from "lucide-react";

export function Topbar() {
  return (
    <header className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between sticky top-0 z-10">
      {/* Search Input */}
      <div className="flex items-center gap-2 w-72 font-mono bg-gray-100 px-3 py-1.5 rounded-lg border border-transparent focus-within:border-green-500 focus-within:bg-white transition-all">
        <Search className="w-5 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search crops, livestock, logs..."
          className="bg-transparent font-mono text-sm text-gray-800 placeholder-gray-400 outline-none w-full"
        />
      </div>

      {/* Right Controls: Quick Action, Notifications, Profile */}
      <div className="flex items-center gap-4">
        {/* Quick Action Button */}
        <button
          type="button"
          className="flex items-center font-mono gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition shadow-xs"
        >
          <Plus className="w-4 h-4 font-mono" />
          <span>New Record</span>
        </button>

        {/* Notifications Button */}
        <button
          type="button"
          aria-label="Notifications"
          className="relative p-2 font-mono text-gray-500 hover:bg-gray-100 rounded-full transition"
        >
          <Bell className="w-5 h-5" />
          {/* Active notification indicator dot */}
          <span className="absolute font-mono top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        <div className="h-6 w-px font-mono bg-gray-200" />

        {/* User Profile Avatar / Status */}
        <Link
          href="/"
          className="flex items-center gap-3 p-1 rounded-lg hover:bg-gray-50 transition"
        >
          <div className="w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-bold text-sm border border-green-200">
            <User className="w-4 h-4 font-mono " />
          </div>
          <div className="hidden font-mono sm:block text-left">
            <p className="text-xs font-mono text-gray-800 leading-none">
              Green Acres Farm
            </p>
            <p className="text-[10px]  text-gray-500 mt-0.5">Owner Account</p>
          </div>
        </Link>
      </div>
    </header>
  );
}