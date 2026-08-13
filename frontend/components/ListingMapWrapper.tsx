"use client";

import dynamic from "next/dynamic";
import { ListingCard as ListingCardType } from "@/types";

// Dynamically import MapComponent to disable Server-Side Rendering
const MapComponent = dynamic(() => import("./MapComponent"), { 
  ssr: false,
  loading: () => <div className="w-full h-[calc(100vh-140px)] bg-gray-100 animate-pulse rounded-2xl flex items-center justify-center text-gray-400">Loading map...</div>
});

interface ListingMapWrapperProps {
  listings: ListingCardType[];
  hoveredListingId?: number | null;
  className?: string;
}

export default function ListingMapWrapper({ listings, hoveredListingId, className }: ListingMapWrapperProps) {
  return <MapComponent listings={listings} hoveredListingId={hoveredListingId} className={className} />;
}
