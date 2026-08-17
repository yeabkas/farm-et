"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, Search, Plus, User, LogOut, ChevronDown, Menu } from "lucide-react";
import { fetchUserProfile, logoutUser } from "@/lib/services";

interface UserProfileData {
  id?: number;
  name?: string;
  email?: string;
  farmName?: string | null;
  firstName?: string | null;
  lastName?: string | null;
}

interface TopbarProps {
  onMenuClick?: () => void;
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const router = useRouter();
  const [user, setUser] = useState<UserProfileData | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchUserProfile()
      .then((res) => {
        const userData = res.data ?? res;
        setUser(userData);
      })
      .catch((err) => {
        console.log("Could not fetch user profile for Topbar:", err);
      });
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch {
      // Ignore network errors on logout
    } finally {
      router.push("/");
    }
  };

  const displayName = user
    ? user.farmName || (user.firstName ? `${user.firstName}'s Farm` : `${user.name}'s Farm`)
    : "My Farm";

  const ownerLabel = user?.name || "Owner Account";

  return (
    <header className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between sticky top-0 z-10 font-mono">
      {/* Mobile Menu Button */}
      <div className="flex items-center md:hidden">
        <button
          type="button"
          onClick={onMenuClick}
          className="text-gray-500 hover:text-gray-700 focus:outline-none"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Spacer for desktop to keep right controls on the right if left is empty */}
      <div className="hidden md:block flex-1"></div>      {/* Right Controls: Profile */}
      <div className="flex items-center gap-4">

        {/* User Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setDropdownOpen((prev) => !prev)}
            className="flex items-center gap-2.5 p-1 rounded-lg hover:bg-gray-100 transition text-left"
          >
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs border border-emerald-200">
              <User className="w-4 h-4" />
            </div>
            <div className="hidden sm:block">
              <p className="text-xs font-bold text-gray-800 leading-none">{displayName}</p>
              <p className="text-[10px] text-gray-500 mt-0.5">{ownerLabel}</p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400 hidden sm:block" />
          </button>

          {/* Profile Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-lg z-50 py-2 text-xs">
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="font-bold text-gray-900 truncate">{displayName}</p>
                <p className="text-gray-500 text-[11px] truncate">{user?.email || "owner@farm.et"}</p>
              </div>

              <div className="py-1">
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 flex items-center gap-2 font-medium transition"
                >
                  <LogOut className="w-3.5 h-3.5 text-red-500" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}