"use client";

import { useState, useEffect } from "react";
import { fetchMyAuctions } from "@/lib/services";
import { Gavel, X, Phone, Mail, Package, Users, Search } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface UserInfo {
  id: number;
  name: string;
  email: string;
  phone: string | null;
}

interface Bid {
  id: number;
  amount: number;
  created_at: string;
  user: UserInfo;
}

interface MyAuction {
  id: number;
  auctionable_type: "Animal" | "Crop";
  auctionable: {
    name: string;
    category: string;
  };
  starting_price: number;
  current_bid: number;
  bid_count: number;
  end_time: string;
  status: string;
  bids: Bid[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatPrice(value: number): string {
  return `ETB ${new Intl.NumberFormat("en-ET").format(value)}`;
}

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat("en-ET", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(dateStr));
}

// ─── Bids Modal ──────────────────────────────────────────────────────────────

function BidsModal({ auction, onClose }: { auction: MyAuction; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 animate-fadeIn max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100">
          <X className="w-5 h-5 text-gray-500" />
        </button>
        <div className="mb-6">
          <h3 className="text-2xl font-bold text-gray-900">Bids for {auction.auctionable.name}</h3>
          <p className="text-sm text-gray-500 mt-1">Current Highest Bid: {formatPrice(auction.current_bid)}</p>
        </div>

        {auction.bids.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-100">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No bids have been placed yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {auction.bids.map((bid, index) => (
              <div key={bid.id} className="flex flex-col sm:flex-row gap-4 p-4 rounded-xl border border-gray-200 bg-white hover:border-emerald-200 transition-colors">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                      index === 0 ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      #{index + 1}
                    </span>
                    <h4 className="font-bold text-gray-900">{bid.user.name}</h4>
                  </div>
                  <div className="space-y-1 mt-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="w-4 h-4 text-emerald-500" />
                      <a href={`mailto:${bid.user.email}`} className="hover:text-emerald-600 transition-colors">{bid.user.email}</a>
                    </div>
                    {bid.user.phone ? (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="w-4 h-4 text-emerald-500" />
                        <a href={`tel:${bid.user.phone}`} className="hover:text-emerald-600 transition-colors">{bid.user.phone}</a>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-sm text-gray-400 italic">
                        <Phone className="w-4 h-4" />
                        No phone number provided
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 sm:border-l border-gray-100 pt-3 sm:pt-0 sm:pl-4">
                  <div className="text-left sm:text-right">
                    <p className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Bid Amount</p>
                    <p className="text-xl font-extrabold text-amber-600">{formatPrice(bid.amount)}</p>
                  </div>
                  <p className="text-xs text-gray-400 font-medium">{formatDate(bid.created_at)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function MyAuctionsDashboard() {
  const [auctions, setAuctions] = useState<MyAuction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAuction, setSelectedAuction] = useState<MyAuction | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchMyAuctions()
      .then((res) => setAuctions(res.data ?? []))
      .catch(() => setError("Could not load your auctions. Please try again."))
      .finally(() => setLoading(false));
  }, []);

  const displayed = auctions.filter(a => 
    a.auctionable.name.toLowerCase().includes(search.toLowerCase()) ||
    a.auctionable.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 font-mono">
      <div className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-600 px-6 py-10">
        <div className="max-w-5xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Gavel className="w-7 h-7 text-emerald-200" />
            <h1 className="text-3xl font-black text-white tracking-tight">My Auctions</h1>
          </div>
          <p className="text-emerald-100 text-sm mb-6">
            Manage your active and ended auctions, and view bidder details.
          </p>
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search your auctions..."
              className="w-full pl-12 pr-4 py-3 rounded-xl text-sm bg-white text-gray-800 border-2 border-transparent focus:border-emerald-300 outline-none shadow-sm"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-gray-500">Loading your auctions...</p>
          </div>
        )}

        {!loading && error && (
          <div className="text-center py-20">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {!loading && !error && displayed.length === 0 && (
          <div className="text-center py-24 space-y-3">
            <div className="text-6xl">🔨</div>
            <p className="text-lg font-semibold text-gray-700">No auctions found</p>
            <p className="text-sm text-gray-500 max-w-xs mx-auto">
              You haven&apos;t placed any items for auction yet, or none match your search.
            </p>
          </div>
        )}

        {!loading && !error && displayed.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayed.map((auction) => (
              <div key={auction.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col">
                <div className="p-5 border-b border-gray-100 flex items-start justify-between">
                  <div>
                    <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1 block">
                      {auction.auctionable_type}
                    </span>
                    <h3 className="font-bold text-lg text-gray-900">{auction.auctionable.name}</h3>
                    <p className="text-sm text-gray-500">{auction.auctionable.category}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    auction.status === 'active' && new Date(auction.end_time) > new Date()
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {auction.status === 'active' && new Date(auction.end_time) > new Date() ? 'Active' : 'Ended'}
                  </span>
                </div>
                
                <div className="p-5 flex-1 space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-semibold">Starting Price</p>
                      <p className="font-bold text-gray-900">{formatPrice(auction.starting_price)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-amber-600 uppercase font-bold tracking-wider">Current Highest</p>
                      <p className="font-extrabold text-amber-600 text-lg">{formatPrice(auction.current_bid)}</p>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-xl p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-gray-400" />
                      <span className="text-sm font-medium text-gray-700">{auction.bid_count} Bids</span>
                    </div>
                    <span className="text-xs text-gray-500">
                      Ends: {formatDate(auction.end_time)}
                    </span>
                  </div>
                </div>

                <div className="p-4 pt-0">
                  <button
                    onClick={() => setSelectedAuction(auction)}
                    className="w-full py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-sm font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    <Package className="w-4 h-4" />
                    View Bidders
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedAuction && (
        <BidsModal
          auction={selectedAuction}
          onClose={() => setSelectedAuction(null)}
        />
      )}

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95) translateY(8px); }
          to   { opacity: 1; transform: scale(1)    translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
      `}</style>
    </div>
  );
}
