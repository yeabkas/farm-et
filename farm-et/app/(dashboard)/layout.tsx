"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { Chatbot } from "@/components/chatbot/Chatbot";

/**
 * Maps the current pathname to a human-readable page context string
 * that the AI assistant can use to give relevant help.
 */
function getPageContext(pathname: string): string {
  const contextMap: Record<string, string> = {
    '/dashboard': 'Farm Overview',
    '/livestock': 'Livestock',
    '/livestock/animals': 'Livestock > Animals',
    '/plantings': 'Plantings',
    '/plantings/crops': 'Plantings > Crops',
    '/plantings/crop-plan': 'Plantings > Crop Plan',
    '/accounting': 'Accounting',
    '/accounting/transactions': 'Accounting > Transactions',
    '/accounting/profit-loss': 'Accounting > P&L Statement',
    '/accounting/cash-flow': 'Accounting > Cash Flow',
    '/market': 'Market',
    '/market/dashboard': 'Market > Dashboard',
    '/market/products': 'Market > Products',
    '/market/orders': 'Market > Orders',
    '/admin/dashboard': 'Admin > Overview & Users',
  };

  // Check for exact match first, then prefix match for dynamic routes
  if (contextMap[pathname]) return contextMap[pathname];

  for (const [path, ctx] of Object.entries(contextMap)) {
    if (pathname.startsWith(path)) return ctx;
  }

  return 'Dashboard';
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();
  const pageContext = getPageContext(pathname);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 relative">
      {/* Sidebar Navigation */}
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 overflow-y-auto w-full">
        <Topbar onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>

      {/* AI Assistant — available on every dashboard page */}
      <Chatbot context={pageContext} />
    </div>
  );
}