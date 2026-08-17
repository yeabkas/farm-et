"use client";

import { useState, useEffect, useMemo } from "react";
import { fetchMarketListings } from "@/lib/services";
import { Search, SlidersHorizontal, Tag, MapPin, Package, X, ShoppingBag, Phone, Mail } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Listing {
  id: number;
  listingType: "animal" | "crop";
  name: string;
  category: string;
  breed?: string | null;
  sex?: string | null;
  age?: number | string | null;
  description?: string | null;
  estimatedValue?: number | null;
  harvestUnits?: string | null;
  matureWeight?: number | string | null;
  sellerName: string;
  sellerEmail?: string | null;
  sellerPhone?: string | null;
  farmName: string;
  createdAt: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const ANIMAL_EMOJIS: Record<string, string> = {
  cattle: "🐄", cow: "🐄", bull: "🐂",
  goat: "🐐", sheep: "🐑", pig: "🐷",
  chicken: "🐔", hen: "🐔", rooster: "🐓",
  horse: "🐴", donkey: "🫏", camel: "🐪",
  rabbit: "🐇", duck: "🦆", turkey: "🦃",
  dog: "🐕", cat: "🐈", bee: "🐝",
};

const CROP_EMOJIS: Record<string, string> = {
  teff: "🌾", wheat: "🌾", barley: "🌾", corn: "🌽", maize: "🌽",
  tomato: "🍅", potato: "🥔", onion: "🧅", garlic: "🧄",
  carrot: "🥕", pepper: "🌶️", coffee: "☕", tea: "🍵",
  sunflower: "🌻", soybean: "🫘", bean: "🫘", lentil: "🫘",
  banana: "🍌", mango: "🥭", avocado: "🥑", orange: "🍊",
  apple: "🍎", lettuce: "🥬", spinach: "🥬", cabbage: "🥬",
};

function getEmoji(listing: Listing): string {
  const key = (listing.category || listing.name || "").toLowerCase();
  if (listing.listingType === "animal") {
    for (const [k, v] of Object.entries(ANIMAL_EMOJIS)) {
      if (key.includes(k)) return v;
    }
    return "🐾";
  }
  for (const [k, v] of Object.entries(CROP_EMOJIS)) {
    if (key.includes(k)) return v;
  }
  return "🌿";
}

function formatPrice(value?: number | null, units?: string | null): string {
  if (!value && value !== 0) return "Price on request";
  const formatted = new Intl.NumberFormat("en-ET").format(value);
  return units ? `ETB ${formatted} / ${units}` : `ETB ${formatted}`;
}

function timeAgo(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  if (diff < 30) return `${diff} days ago`;
  if (diff < 365) return `${Math.floor(diff / 30)}mo ago`;
  return `${Math.floor(diff / 365)}y ago`;
}

// ─── Contact Modal ────────────────────────────────────────────────────────────

function ContactModal({ listing, onClose }: { listing: Listing; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-fadeIn">
        <button onClick={onClose} className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100">
          <X className="w-5 h-5 text-gray-500" />
        </button>
        <div className="text-center mb-6">
          <div className="text-6xl mb-3">{getEmoji(listing)}</div>
          <h3 className="text-xl font-bold text-gray-900">{listing.name}</h3>
          <p className="text-sm text-emerald-600 font-medium mt-1">{listing.category}</p>
        </div>
        <div className="bg-emerald-50 rounded-xl p-4 mb-5 space-y-2">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="text-sm text-gray-700 font-medium">{listing.farmName}</span>
          </div>
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="text-sm text-gray-700">{listing.sellerName}</span>
          </div>
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="text-sm font-semibold text-emerald-700">
              {formatPrice(listing.estimatedValue, listing.harvestUnits)}
            </span>
          </div>
        </div>
        {listing.description && (
          <p className="text-sm text-gray-600 mb-5 leading-relaxed">{listing.description}</p>
        )}

        <div className="space-y-3 mb-5">
          <h4 className="text-sm font-semibold text-gray-800">Contact Seller</h4>
          <div className="flex flex-col gap-2">
            {listing.sellerEmail ? (
              <a href={`mailto:${listing.sellerEmail}`} className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Email Address</p>
                  <p className="text-sm text-gray-900 font-semibold">{listing.sellerEmail}</p>
                </div>
              </a>
            ) : null}

            {listing.sellerPhone ? (
              <a href={`tel:${listing.sellerPhone}`} className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Phone Number</p>
                  <p className="text-sm text-gray-900 font-semibold">{listing.sellerPhone}</p>
                </div>
              </a>
            ) : null}

            {!listing.sellerEmail && !listing.sellerPhone && (
               <p className="text-xs text-gray-500 italic bg-gray-50 rounded-lg p-3">
                 No direct contact info available. Visit <strong>{listing.farmName}</strong> to arrange a purchase.
               </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Product Card ─────────────────────────────────────────────────────────────

function ProductCard({ listing, onContact }: { listing: Listing; onContact: () => void }) {
  const emoji = getEmoji(listing);
  const isAnimal = listing.listingType === "animal";

  return (
    <div className="group bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
      {/* Image / Icon area */}
      <div className={`relative h-44 flex items-center justify-center text-7xl
        ${isAnimal
          ? "bg-gradient-to-br from-amber-50 to-orange-100"
          : "bg-gradient-to-br from-emerald-50 to-green-100"
        }`}>
        <span className="select-none drop-shadow-md">{emoji}</span>
        <span className={`absolute top-3 left-3 text-xs font-bold px-2.5 py-1 rounded-full
          ${isAnimal
            ? "bg-orange-100 text-orange-700 border border-orange-200"
            : "bg-emerald-100 text-emerald-700 border border-emerald-200"
          }`}>
          {isAnimal ? "🐾 Animal" : "🌿 Crop"}
        </span>
        {listing.listingType === "animal" && listing.age && (
          <span className="absolute top-3 right-3 text-xs bg-white/80 backdrop-blur-sm px-2 py-1 rounded-full text-gray-600 border border-gray-200">
            {listing.age} yrs
          </span>
        )}
      </div>

      {/* Card body */}
      <div className="p-4 flex flex-col flex-1 gap-2">
        {/* Title + category */}
        <div>
          <h3 className="font-bold text-gray-900 text-base leading-tight group-hover:text-emerald-700 transition-colors">
            {listing.name}
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            {listing.category}
            {listing.breed && ` · ${listing.breed}`}
            {listing.sex && ` · ${listing.sex}`}
          </p>
        </div>

        {/* Description */}
        {listing.description && (
          <p className="text-xs text-gray-600 leading-relaxed line-clamp-2 flex-1">
            {listing.description}
          </p>
        )}

        {/* Price */}
        <div className="mt-auto pt-2 border-t border-gray-100">
          <p className="text-lg font-extrabold text-gray-900">
            {formatPrice(listing.estimatedValue, listing.harvestUnits)}
          </p>
          {listing.matureWeight && (
            <p className="text-xs text-gray-500">Weight: {listing.matureWeight} kg</p>
          )}
        </div>

        {/* Seller */}
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <MapPin className="w-3 h-3 shrink-0 text-emerald-500" />
          <span className="truncate">{listing.farmName}</span>
          <span className="text-gray-300">·</span>
          <span className="text-gray-400 shrink-0">{timeAgo(listing.createdAt)}</span>
        </div>

        {/* CTA */}
        <button
          onClick={onContact}
          className="w-full mt-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-sm font-semibold rounded-xl transition-colors"
        >
          Contact Seller
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function MarketDashboard() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<"all" | "animal" | "crop">("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "price-asc" | "price-desc" | "name">("newest");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchMarketListings()
      .then((res) => setListings(res.data ?? []))
      .catch(() => setError("Could not load marketplace listings. Please try again."))
      .finally(() => setLoading(false));
  }, []);

  // Unique categories for filter dropdown
  const allTypes = useMemo(() => {
    const set = new Set(listings.map((l) => l.category).filter(Boolean));
    return ["all", ...Array.from(set)];
  }, [listings]);

  // Filtered + sorted listings
  const displayed = useMemo(() => {
    let result = listings;

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (l) =>
          l.name.toLowerCase().includes(q) ||
          l.category.toLowerCase().includes(q) ||
          l.farmName.toLowerCase().includes(q) ||
          l.sellerName.toLowerCase().includes(q)
      );
    }
    if (categoryFilter !== "all") result = result.filter((l) => l.listingType === categoryFilter);
    if (typeFilter !== "all") result = result.filter((l) => l.category === typeFilter);
    if (minPrice) result = result.filter((l) => (l.estimatedValue ?? 0) >= Number(minPrice));
    if (maxPrice) result = result.filter((l) => (l.estimatedValue ?? Infinity) <= Number(maxPrice));

    return result.slice().sort((a, b) => {
      if (sortBy === "price-asc") return (a.estimatedValue ?? 0) - (b.estimatedValue ?? 0);
      if (sortBy === "price-desc") return (b.estimatedValue ?? 0) - (a.estimatedValue ?? 0);
      if (sortBy === "name") return a.name.localeCompare(b.name);
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [listings, search, categoryFilter, typeFilter, minPrice, maxPrice, sortBy]);

  const clearFilters = () => {
    setSearch(""); setCategoryFilter("all"); setTypeFilter("all");
    setMinPrice(""); setMaxPrice(""); setSortBy("newest");
  };
  const hasActiveFilters = search || categoryFilter !== "all" || typeFilter !== "all" || minPrice || maxPrice || sortBy !== "newest";

  return (
    <div className="min-h-screen bg-gray-50 font-mono">
      {/* ── Hero / Search Banner ─────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-600 px-6 py-10">
        <div className="max-w-5xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <ShoppingBag className="w-7 h-7 text-emerald-200" />
            <h1 className="text-3xl font-black text-white tracking-tight">FarmET Marketplace</h1>
          </div>
          <p className="text-emerald-100 text-sm mb-6">
            Fresh livestock and crops — direct from Ethiopian farms
          </p>
          {/* Search bar */}
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search animals, crops, farms..."
              className="w-full pl-12 pr-4 py-3.5 rounded-xl text-sm bg-white text-gray-800 border-2 border-transparent focus:border-emerald-300 outline-none shadow-lg"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-4 top-1/2 -translate-y-1/2">
                <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Category tabs ─────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-200 px-6 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center gap-0 overflow-x-auto">
          {(["all", "animal", "crop"] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-5 py-3.5 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${
                categoryFilter === cat
                  ? "border-emerald-600 text-emerald-700"
                  : "border-transparent text-gray-500 hover:text-gray-800"
              }`}
            >
              {cat === "all" ? "🛒 All Listings" : cat === "animal" ? "🐾 Animals" : "🌿 Crops"}
              {cat === "all" && ` (${listings.length})`}
              {cat === "animal" && ` (${listings.filter((l) => l.listingType === "animal").length})`}
              {cat === "crop" && ` (${listings.filter((l) => l.listingType === "crop").length})`}
            </button>
          ))}
          <div className="ml-auto flex items-center gap-2 py-2 shrink-0">
            <button
              onClick={() => setShowFilters((p) => !p)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                showFilters ? "bg-emerald-600 text-white border-emerald-600" : "text-gray-600 border-gray-300 hover:bg-gray-50"
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Filters
            </button>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="text-xs border border-gray-300 rounded-lg px-2 py-1.5 bg-white text-gray-700 outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="newest">Newest first</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name">Name A–Z</option>
            </select>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 flex gap-6">
        {/* ── Sidebar Filters ──────────────────────────────────────────────── */}
        {showFilters && (
          <aside className="w-56 shrink-0 space-y-5">
            <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-800">Filters</h3>
                {hasActiveFilters && (
                  <button onClick={clearFilters} className="text-xs text-red-500 hover:text-red-700">
                    Clear all
                  </button>
                )}
              </div>

              {/* Type filter */}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">
                  Specific Type
                </label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full text-xs border border-gray-200 rounded-lg px-2 py-2 bg-white text-gray-700 outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  {allTypes.map((t) => (
                    <option key={t} value={t}>{t === "all" ? "All types" : t}</option>
                  ))}
                </select>
              </div>

              {/* Price range */}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">
                  Price (ETB)
                </label>
                <div className="space-y-2">
                  <input
                    type="number"
                    placeholder="Min price"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-full text-xs border border-gray-200 rounded-lg px-2 py-2 outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                  <input
                    type="number"
                    placeholder="Max price"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-full text-xs border border-gray-200 rounded-lg px-2 py-2 outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>
          </aside>
        )}

        {/* ── Product Grid ─────────────────────────────────────────────────── */}
        <main className="flex-1 min-w-0">
          {/* Results bar */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-500">
              {loading ? "Loading..." : `Showing ${displayed.length} of ${listings.length} listings`}
            </p>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1">
                <X className="w-3 h-3" /> Clear filters
              </button>
            )}
          </div>

          {/* States */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-gray-500">Loading marketplace...</p>
            </div>
          )}

          {!loading && error && (
            <div className="text-center py-20">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {!loading && !error && displayed.length === 0 && (
            <div className="text-center py-24 space-y-3">
              <div className="text-6xl">🛒</div>
              <p className="text-lg font-semibold text-gray-700">No listings found</p>
              <p className="text-sm text-gray-500 max-w-xs mx-auto">
                {hasActiveFilters
                  ? "Try adjusting your filters or search term."
                  : "No animals or crops are listed for sale yet. Add animals or crops and set their status to \"For Sale\" to appear here."}
              </p>
              {hasActiveFilters && (
                <button onClick={clearFilters} className="text-sm text-emerald-600 underline">
                  Clear all filters
                </button>
              )}
            </div>
          )}

          {!loading && !error && displayed.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {displayed.map((listing) => (
                <ProductCard
                  key={`${listing.listingType}-${listing.id}`}
                  listing={listing}
                  onContact={() => setSelectedListing(listing)}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Contact modal */}
      {selectedListing && (
        <ContactModal
          listing={selectedListing}
          onClose={() => setSelectedListing(null)}
        />
      )}

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95) translateY(8px); }
          to   { opacity: 1; transform: scale(1)    translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}
