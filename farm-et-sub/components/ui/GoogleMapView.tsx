"use client";

import { GoogleMap, useJsApiLoader, MarkerF } from "@react-google-maps/api";
import { useCallback } from "react";

const containerStyle = {
  width: "100%",
  height: "220px",
  borderRadius: "0.375rem", // matches rounded-md
};

// Default center fallback (e.g., center of map)
const defaultCenter = {
  lat: 9.02,
  lng: 38.74,
};

interface GoogleMapViewProps {
  latitude: number;
  longitude: number;
  onLocationSelect: (lat: number, lng: number) => void;
}

export function GoogleMapView({ latitude, longitude, onLocationSelect }: GoogleMapViewProps) {
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
  });

  // Center on current form values if provided, otherwise default
  const center = {
    lat: latitude || defaultCenter.lat,
    lng: longitude || defaultCenter.lng,
  };

  // Handle click on map to set coordinates
  const handleMapClick = useCallback(
    (e: google.maps.MapMouseEvent) => {
      if (e.latLng) {
        onLocationSelect(e.latLng.lat(), e.latLng.lng());
      }
    },
    [onLocationSelect]
  );

  // Handle marker drag
  const handleMarkerDragEnd = useCallback(
    (e: google.maps.MapMouseEvent) => {
      if (e.latLng) {
        onLocationSelect(e.latLng.lat(), e.latLng.lng());
      }
    },
    [onLocationSelect]
  );

  if (!isLoaded) {
    return (
      <div style={containerStyle} className="bg-gray-100 flex items-center justify-center text-sm text-gray-500 border">
        Loading Map Viewport...
      </div>
    );
  }

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={12}
      onClick={handleMapClick}
      options={{
        disableDefaultUI: true, // keeps map clean
        zoomControl: true,
      }}
    >
      <MarkerF
        position={center}
        draggable={true}
        onDragEnd={handleMarkerDragEnd}
      />
    </GoogleMap>
  );
}