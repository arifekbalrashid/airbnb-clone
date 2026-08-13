"use client";

import Link from "next/link";
import { ListingCard as ListingCardType } from "@/types";
import { useCurrency } from "@/context/CurrencyContext";
import WishlistButton from "./WishlistButton";
import { useState } from "react";
import { useSearchParams } from "next/navigation";

interface Props {
  listing: ListingCardType;
  isWishlisted?: boolean;
  onWishlistToggle?: () => void;
}

export default function ListingCard({
listing, isWishlisted = false, onWishlistToggle }: Props) {
  const { formatPrice } = useCurrency();
  const [imgError, setImgError] = useState(false);
  const mainImage = listing.images?.[0]?.image_url;
  const searchParams = useSearchParams();

  // Build listing URL with date params if they exist
  const checkIn = searchParams.get("check_in");
  const checkOut = searchParams.get("check_out");
  const guests = searchParams.get("guests");
  let listingHref = `/listing/${listing.id}`;
  const qp = new URLSearchParams();
  if (checkIn) qp.set("check_in", checkIn);
  if (checkOut) qp.set("check_out", checkOut);
  if (guests) qp.set("guests", guests);
  if (qp.toString()) listingHref += `?${qp.toString()}`;

  // Calculate total for N nights if dates are selected
  const nightCount = checkIn && checkOut
    ? Math.max(0, Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000))
    : 0;

  return (
    <Link href={listingHref} className="group block">
      <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-100">
        {mainImage && !imgError ? (
          <img
            src={mainImage}
            alt={listing.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 text-sm">
            No image
          </div>
        )}
        <div className="absolute top-3 right-3">
          <WishlistButton
            listingId={listing.id}
            isWishlisted={isWishlisted}
            onToggle={onWishlistToggle}
          />
        </div>
      </div>
      <div className="mt-2">
        <div className="flex justify-between items-start">
          <h3 className="font-medium text-sm text-foreground truncate">
            {listing.city}, {listing.country}
          </h3>
          {listing.rating > 0 && (
            <span className="text-sm flex items-center gap-0.5 shrink-0">
              ★ {listing.rating.toFixed(2)}
            </span>
          )}
        </div>
        <p className="text-sm text-gray-400 truncate">{listing.title}</p>
        <p className="text-sm text-gray-400">
          {listing.bedrooms} bed{listing.bedrooms !== 1 ? "s" : ""} · {listing.bathrooms} bath
        </p>
        <p className="mt-1 text-sm">
          <span className="font-semibold">{nightCount > 0 ? formatPrice(listing.price_per_night * nightCount) : formatPrice(listing.price_per_night)}</span>
          <span className="text-gray-400">{nightCount > 0 ? ` for ${nightCount} night${nightCount !== 1 ? 's' : ''}` : ' night'}</span>
        </p>
      </div>
    </Link>
  );
}
