"use client";

import { useEffect, useState } from "react";
import { getMyBookings, cancelBooking } from "@/lib/api";
import { Booking } from "@/types";
import { formatDate } from "@/utils/formatters";
import { useCurrency } from "@/context/CurrencyContext";
import { useToast } from "@/context/ToastContext";
import EmptyState from "@/components/EmptyState";
import Link from "next/link";
import ReviewModal from "@/components/ReviewModal";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function TripsPage() {
  const { formatPrice } = useCurrency();
  const { showToast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewModalData, setReviewModalData] = useState<{
    isOpen: boolean;
    listingId: number;
    bookingId: number;
    title: string;
  }>({
    isOpen: false,
    listingId: 0,
    bookingId: 0,
    title: "",
  });

  useEffect(() => {
    getMyBookings()
      .then((res) => setBookings(res.data))
      .catch(() => showToast("Failed to load trips", "error"))
      .finally(() => setLoading(false));
  }, [showToast]);

  async function handleCancel(id: number) {
    if (!confirm("Cancel this booking?")) return;
    try {
      await cancelBooking(id);
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status: "cancelled" } : b))
      );
      showToast("Booking cancelled");
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : "Cancel failed", "error");
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-semibold mb-6">My Trips</h1>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse h-32 bg-gray-200 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-2xl font-semibold mb-6">My Trips</h1>

      {bookings.length === 0 ? (
        <EmptyState
          title="No trips yet"
          description="When you book a stay, it will appear here."
          icon="✈️"
        />
      ) : (
        <div className="space-y-4">
          {bookings.map((b) => {
            const isCompleted = new Date(b.check_out) < new Date();
            const canCancel = b.status === "confirmed" && new Date(b.check_in) > new Date();
            const canReview = (b.status === "confirmed" || b.status === "completed") && isCompleted;
            
            return (
            <div key={b.id} className="flex flex-col sm:flex-row gap-4 border border-gray-200 rounded-xl p-4">
              {b.listing_image && (
                <Link href={`/listing/${b.listing_id}`}>
                  <img
                    src={b.listing_image}
                    alt={b.listing_title || ""}
                    className="w-full sm:w-40 h-28 object-cover rounded-lg"
                  />
                </Link>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <div>
                    <Link href={`/listing/${b.listing_id}`} className="font-medium hover:underline">
                      {b.listing_title}
                    </Link>
                    <p className="text-sm text-gray-400">{b.listing_city}</p>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium ${
                      (b.status === "confirmed" && isCompleted) || b.status === "completed"
                        ? "bg-gray-100 text-gray-700"
                        : b.status === "confirmed"
                        ? "bg-green-50 text-green-600"
                        : b.status === "cancelled"
                        ? "bg-red-50 text-red-500"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {(b.status === "confirmed" && isCompleted) || b.status === "completed"
                      ? "Completed"
                      : b.status.charAt(0).toUpperCase() + b.status.slice(1)}
                  </span>
                </div>
                <div className="mt-2 text-sm text-gray-500">
                  <p>{formatDate(b.check_in)} → {formatDate(b.check_out)}</p>
                  <p>{b.guests} guest{b.guests > 1 ? "s" : ""} · {b.nights} night{b.nights > 1 ? "s" : ""}</p>
                  <p className="font-semibold text-foreground mt-1">{formatPrice(b.total_price)}</p>
                </div>
                <div className="mt-2 flex gap-3 text-xs items-center">
                  <span className="text-gray-400">Booking #{b.id}</span>
                  {canCancel && (
                    <button
                      onClick={() => handleCancel(b.id)}
                      className="text-red-500 hover:underline"
                    >
                      Cancel
                    </button>
                  )}
                  {canCancel && canReview && <span className="text-gray-300">•</span>}
                  {canReview && (
                    <button
                      onClick={() => setReviewModalData({
                        isOpen: true,
                        listingId: b.listing_id,
                        bookingId: b.id,
                        title: b.listing_title || "this place",
                      })}
                      className="text-primary hover:underline font-medium"
                    >
                      Write a Review
                    </button>
                  )}
                </div>
              </div>
            </div>
          )})}
        </div>
      )}

      <ReviewModal
        isOpen={reviewModalData.isOpen}
        onClose={() => setReviewModalData({ ...reviewModalData, isOpen: false })}
        listingId={reviewModalData.listingId}
        bookingId={reviewModalData.bookingId}
        listingTitle={reviewModalData.title}
        onSuccess={() => {
          // Could refresh bookings or mark it as reviewed if we tracked that
        }}
      />
      </div>
    </ProtectedRoute>
  );
}
