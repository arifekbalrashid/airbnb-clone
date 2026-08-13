"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getListings, getWishlistIds } from "@/lib/api";
import { ListingCard as ListingCardType } from "@/types";
import ListingCard from "@/components/ListingCard";

export default function HomePage() {
  const router = useRouter();
  const [listings, setListings] = useState<ListingCardType[]>([]);
  const [wishlistIds, setWishlistIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const [listingsRes, wishRes] = await Promise.all([
          getListings({ limit: 20, sort_by: "rating_desc" }),
          getWishlistIds(),
        ]);
        setListings(listingsRes.data);
        setWishlistIds(wishRes.data);
      } catch (e) {
        console.error("Failed to load:", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search) params.set("location", search);
    router.push(`/search?${params.toString()}`);
  }

  return (
    <div>


      {/* Listings grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
        <h2 className="text-2xl font-bold mb-6">Popular stays across India</h2>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-square rounded-xl bg-gray-200" />
                <div className="mt-2 h-4 bg-gray-200 rounded w-3/4" />
                <div className="mt-1 h-4 bg-gray-200 rounded w-1/2" />
                <div className="mt-1 h-4 bg-gray-200 rounded w-1/3" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {listings.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                isWishlisted={wishlistIds.includes(listing.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
