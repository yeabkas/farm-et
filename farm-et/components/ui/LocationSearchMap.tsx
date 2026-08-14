"use client";

import { useState, useEffect, useRef } from "react";
import { Search, MapPin, Navigation, Loader2, X, Check } from "lucide-react";
import { GoogleMapView } from "./GoogleMapView";

interface LocationResult {
  place_id: number | string;
  display_name: string;
  lat: string;
  lon: string;
}

interface LocationSearchMapProps {
  latitude: number;
  longitude: number;
  onLocationSelect: (lat: number, lng: number, placeName?: string) => void;
}

export function LocationSearchMap({
  latitude,
  longitude,
  onLocationSelect,
}: LocationSearchMapProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<LocationResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedPlaceName, setSelectedPlaceName] = useState<string>("");
  const [detectingGps, setDetectingGps] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced search using OpenStreetMap Nominatim API (Free, global & Ethiopian coverage)
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setTimeout(() => {
        setSuggestions([]);
        setIsSearching(false);
      }, 0);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            searchQuery
          )}&limit=5&addressdetails=1`,
          {
            headers: {
              "Accept-Language": "en",
            },
          }
        );
        if (response.ok) {
          const data: LocationResult[] = await response.json();
          setSuggestions(data);
          setShowDropdown(data.length > 0);
        }
      } catch (err) {
        console.error("Location search error:", err);
      } finally {
        setIsSearching(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSelectSuggestion = (item: LocationResult) => {
    const lat = parseFloat(item.lat);
    const lng = parseFloat(item.lon);
    setSelectedPlaceName(item.display_name);
    setSearchQuery(item.display_name);
    setShowDropdown(false);
    onLocationSelect(lat, lng, item.display_name);
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    setDetectingGps(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = parseFloat(position.coords.latitude.toFixed(6));
        const lng = parseFloat(position.coords.longitude.toFixed(6));
        const gpsLabel = `Current Location (${lat}, ${lng})`;
        setSelectedPlaceName(gpsLabel);
        setSearchQuery("");
        setDetectingGps(false);
        onLocationSelect(lat, lng, gpsLabel);
      },
      (error) => {
        console.error("Error detecting location:", error);
        setDetectingGps(false);
        alert("Could not detect location. Please check browser permissions or search manually.");
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setSuggestions([]);
    setShowDropdown(false);
  };

  return (
    <div className="space-y-2 font-mono text-left" ref={dropdownRef}>
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-emerald-600" />
          <span>Farm Location Search</span>
        </label>
        <button
          type="button"
          onClick={handleUseCurrentLocation}
          disabled={detectingGps}
          className="text-xs text-emerald-700 hover:text-emerald-800 font-medium flex items-center gap-1 hover:underline disabled:opacity-50"
        >
          {detectingGps ? (
            <Loader2 className="w-3 h-3 animate-spin text-emerald-600" />
          ) : (
            <Navigation className="w-3 h-3 text-emerald-600" />
          )}
          <span>{detectingGps ? "Detecting..." : "Use My Location"}</span>
        </button>
      </div>

      {/* Location Search Bar & Autocomplete Dropdown */}
      <div className="relative">
        <div className="relative flex items-center bg-white border border-gray-300 rounded-md focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500 shadow-xs">
          <Search className="w-4 h-4 text-gray-400 ml-2.5 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => {
              if (suggestions.length > 0) setShowDropdown(true);
            }}
            placeholder="Search city, town, region (e.g. Addis Ababa, Hawassa, Bishoftu)..."
            className="w-full p-2 text-xs bg-transparent outline-none text-gray-800 placeholder-gray-400"
          />
          {isSearching && <Loader2 className="w-4 h-4 text-emerald-600 animate-spin mr-2 shrink-0" />}
          {searchQuery && !isSearching && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="p-1 mr-1 text-gray-400 hover:text-gray-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Autocomplete Dropdown Menu */}
        {showDropdown && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-48 overflow-y-auto divide-y divide-gray-100 text-xs">
            {suggestions.map((item) => (
              <button
                key={item.place_id}
                type="button"
                onClick={() => handleSelectSuggestion(item)}
                className="w-full text-left px-3 py-2 hover:bg-emerald-50 text-gray-700 flex items-start gap-2 transition"
              >
                <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span className="line-clamp-2 leading-tight">{item.display_name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Selected location feedback pill */}
      {selectedPlaceName && (
        <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md truncate">
          <Check className="w-3 h-3 text-emerald-600 shrink-0" />
          <span className="truncate">Selected: {selectedPlaceName}</span>
        </div>
      )}

      {/* Interactive Map Viewport */}
      <div className="rounded-md border border-gray-300 overflow-hidden shadow-xs">
        <GoogleMapView
          latitude={latitude}
          longitude={longitude}
          onLocationSelect={(lat, lng) => {
            setSelectedPlaceName(`Custom Coordinates (${lat}, ${lng})`);
            onLocationSelect(lat, lng);
          }}
        />
      </div>
    </div>
  );
}
