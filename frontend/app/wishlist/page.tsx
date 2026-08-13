"use client";

import { useEffect, useState } from "react";
import { getWishlist } from "@/lib/api";
import { WishlistItem } from "@/types";
import ListingCard from "@/components/ListingCard";
import EmptyState from "@/components/EmptyState";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function WishlistPage() {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  function load() {
    getWishlist()
      .then((res) => setItems(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-semibold mb-6">Wishlist</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-square rounded-xl bg-gray-200" />
              <div className="mt-2 h-4 bg-gray-200 rounded w-3/4" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-2xl font-semibold mb-6">Wishlist</h1>

      {items.length === 0 ? (
        <EmptyState
          title="Your wishlist is empty"
          description="Heart the listings you love and they'll appear here."
          icon="❤️"
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {items.map((item) => (
            <ListingCard
              key={item.id}
              listing={item.listing}
              isWishlisted={true}
              onWishlistToggle={load}
            />
          ))}
        </div>
      )}
      </div>
    </ProtectedRoute>
  );
}
