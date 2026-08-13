"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getHostListings, deleteListing } from "@/lib/api";
import { ListingCard as ListingCardType } from "@/types";
import { useCurrency } from "@/context/CurrencyContext";
import { useToast } from "@/context/ToastContext";
import EmptyState from "@/components/EmptyState";

export default function HostListingsPage() {
  const { formatPrice } = useCurrency();
  const { showToast } = useToast();
  const [listings, setListings] = useState<ListingCardType[]>([]);
  const [loading, setLoading] = useState(true);

  function load() {
    getHostListings()
      .then((res) => setListings(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  async function handleDelete(id: number) {
    if (!confirm("Are you sure you want to delete this listing? This cannot be undone.")) return;
    try {
      await deleteListing(id);
      setListings((prev) => prev.filter((l) => l.id !== id));
      showToast("Listing deleted");
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : "Delete failed", "error");
    }
  }

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-semibold mb-6">Your Listings</h1>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <div key={i} className="animate-pulse h-20 bg-gray-200 rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Your Listings</h1>
        <Link
          href="/host/listings/new"
          className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-hover transition-colors"
        >
          + New Listing
        </Link>
      </div>

      {listings.length === 0 ? (
        <EmptyState title="No listings yet" description="Create your first listing." icon="🏡" />
      ) : (
        <div className="space-y-3">
          {listings.map((l) => (
            <div key={l.id} className="flex flex-col sm:flex-row gap-4 border border-gray-200 rounded-xl p-4">
              {l.images[0] && (
                <img src={l.images[0].image_url} alt={l.title} className="w-full sm:w-32 h-24 object-cover rounded-lg" />
              )}
              <div className="flex-1">
                <Link href={`/listing/${l.id}`} className="font-medium hover:underline">{l.title}</Link>
                <p className="text-sm text-gray-400">{l.city} · {l.property_type}</p>
                <p className="text-sm font-medium mt-1">{formatPrice(l.price_per_night)} / night</p>
              </div>
              <div className="flex sm:flex-col gap-2">
                <Link
                  href={`/host/listings/${l.id}/edit`}
                  className="text-xs px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  Edit
                </Link>
                <button
                  onClick={() => handleDelete(l.id)}
                  className="text-xs px-3 py-1.5 border border-red-200 text-red-500 rounded-lg hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
