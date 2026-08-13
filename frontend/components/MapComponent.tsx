"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { ListingCard as ListingCardType } from "@/types";

// This component updates the map center bounds when listings change
function MapUpdater({ listings }: { listings: ListingCardType[] }) {
  const map = useMap();

  useEffect(() => {
    if (listings.length === 0) return;

    // Calculate bounds
    const bounds = L.latLngBounds(
      listings
        .filter(l => l.latitude && l.longitude)
        .map((l) => [l.latitude!, l.longitude!])
    );

    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    }
  }, [listings, map]);

  return null;
}

interface MapComponentProps {
  listings: ListingCardType[];
  hoveredListingId?: number | null;
  className?: string;
}

export default function MapComponent({ listings, hoveredListingId, className }: MapComponentProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Fix leaflet marker icon issues with Next.js/Webpack
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
      iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
      shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    });
  }, []);

  if (!mounted) return <div className="w-full h-full bg-gray-100 animate-pulse rounded-2xl" />;

  const createPriceIcon = (price: number, isHovered: boolean) => {
    const htmlString = `
      <div style="
        background-color: ${isHovered ? '#222222' : 'white'};
        color: ${isHovered ? 'white' : '#222222'};
        font-weight: 700;
        font-size: 14px;
        padding: 4px 10px;
        border-radius: 28px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.15);
        border: 1px solid ${isHovered ? '#222222' : '#DDDDDD'};
        white-space: nowrap;
        transition: all 0.2s ease-in-out;
        transform: scale(${isHovered ? 1.1 : 1});
        z-index: ${isHovered ? 100 : 1};
        font-family: inherit;
      ">
        ₹${price.toLocaleString()}
      </div>
    `;

    return L.divIcon({
      html: htmlString,
      className: "custom-leaflet-marker",
      iconSize: [60, 30],
      iconAnchor: [30, 15], // Center the label
    });
  };

  const defaultCenter: [number, number] = [30.7333, 76.7794]; // Default to Chandigarh, India if no valid coordinates

  return (
    <div className={className || "w-full h-[calc(100vh-140px)] rounded-2xl overflow-hidden sticky top-[100px] shadow-sm border border-gray-200"}>
      <MapContainer 
        center={defaultCenter} 
        zoom={12} 
        scrollWheelZoom={true} 
        className="w-full h-full z-0"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        
        <MapUpdater listings={listings} />

        {listings.map((listing) => {
          if (!listing.latitude || !listing.longitude) return null;
          
          const isHovered = hoveredListingId === listing.id;

          return (
            <Marker
              key={listing.id}
              position={[listing.latitude, listing.longitude]}
              icon={createPriceIcon(listing.price_per_night, isHovered)}
              zIndexOffset={isHovered ? 1000 : 0}
            >
              <Popup className="custom-popup" closeButton={false}>
                <div className="w-[240px] overflow-hidden -m-[14px]">
                  <div className="h-[160px] w-full bg-gray-200 relative">
                     {listing.images && listing.images.length > 0 ? (
                       <img src={listing.images[0].image_url} alt={listing.title} className="w-full h-full object-cover" />
                     ) : (
                       <div className="w-full h-full flex items-center justify-center text-gray-400">No image</div>
                     )}
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-sm truncate">{listing.city}, {listing.country}</h3>
                      <div className="flex items-center gap-1 text-xs">
                        <svg className="w-3 h-3 text-black" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span>{listing.rating.toFixed(2)}</span>
                      </div>
                    </div>
                    <p className="text-gray-500 text-xs truncate mb-2">{listing.title}</p>
                    <div className="font-semibold text-sm">
                      ₹{listing.price_per_night.toLocaleString()} <span className="font-normal text-gray-500">night</span>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
