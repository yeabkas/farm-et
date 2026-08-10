"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronDown,
  ChevronRight,
  Sprout,
  Receipt,
  Store,
  BeefIcon,
} from "lucide-react";
import animals from "@/app/(dashboard)/livestock/[id]/page";

interface SubItem {
  name: string;
  href: string;
}

interface NavSection {
  key: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  baseHref: string;
  items: SubItem[];
}

const navSections: NavSection[] = [
  {
    key: "livestock",
    name: "Livestock",
    icon: BeefIcon,
    baseHref: "/livestock",
    items: [
      { name: "Animals", href: "/livestock/animals" },
    ],
  },
  {
    key: "plantings",
    name: "Plantings",
    icon: Sprout,
    baseHref: "/plantings",
    items: [
      { name: "Crops", href: "/plantings/crops" },
    ],
  },
  {
    key: "accounting",
    name: "Accounting",
    icon: Receipt,
    baseHref: "/accounting",
    items: [
      { name: "Transactions", href: "/accounting/transactions" },
      { name: "P&L Statement", href: "/accounting/profit-loss" },
      { name: "Cash Flow", href: "/accounting/cash-flow" },
    ],
  },
  {
    key: "market",
    name: "Market",
    icon: Store,
    baseHref: "/market",
    items: [
      { name: "Dashboard", href: "/market/dashboard" },
      { name: "Products", href: "/market/products" },
      { name: "Orders", href: "/market/orders" },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [openSection, setOpenSection] = useState<string | null>(null);

  // Determine the default section to expand based on current route.
  // This avoids the need for useEffect and avoids the React warning about
  // calling setState synchronously inside an effect.
  const defaultOpenSection = navSections.find((section) =>
    pathname.startsWith(section.baseHref)
  )?.key;

  const toggleSection = (key: string) => {
    setOpenSection((prev) => (prev === key ? null : key));
  };

  return (
    <aside className="w-60 bg-white border-r border-gray-200 h-screen flex flex-col font-mono select-none">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-gray-100">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="text-2xl font-black font-mono tracking-tight text-emerald-600">
            Farm-ET
          </span>
        </Link>
      </div>

      {/* Navigation Options */}
      <nav className="flex-1 py-4 px-3 space-y-1 font-mono overflow-y-auto">
        {navSections.map((section) => {
          const Icon = section.icon;
          const isSectionActive = pathname.startsWith(section.baseHref);
          const isOpen =
            openSection === section.key ||
            (openSection === null && defaultOpenSection === section.key);

          return (
            <div key={section.key} className="space-y-1 font-mono">
              {/* Parent Toggle Button */}
              <button
                type="button"
                onClick={() => toggleSection(section.key)}
                className={`w-full flex items-center justify-between px-3 py-2 text-sm font-mono rounded-md transition-colors ${
                  isSectionActive
                    ? "text-gray-900 font-semibold"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <div className="font-mono flex items-center gap-3">
                  <Icon className="w-4 h-4 text-gray-500" />
                  <span>{section.name}</span>
                </div>
                {isOpen ? (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                )}
              </button>

              {/* Sub-items List */}
              {isOpen && (
                <div className="pl-9 pr-1 space-y-1">
                  {section.items.map((subItem) => {
                    const isSubActive = pathname === subItem.href;
                    return (
                      <Link
                        key={subItem.href}
                        href={subItem.href}
                        className={`block px-3 py-1.5 text-xs rounded-md transition-colors ${
                          isSubActive
                            ? "bg-gray-200/80 text-gray-900 font-mono"
                            : "text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        {subItem.name}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}