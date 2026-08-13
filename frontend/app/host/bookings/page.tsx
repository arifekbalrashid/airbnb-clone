"use client";

import { useEffect, useState } from "react";
import { getHostBookings } from "@/lib/api";
import { HostBooking } from "@/types";
import { formatDate } from "@/utils/formatters";
import { useCurrency } from "@/context/CurrencyContext";
import EmptyState from "@/components/EmptyState";

export default function HostBookingsPage() {
  const { formatPrice } = useCurrency();
  const [bookings, setBookings] = useState<HostBooking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getHostBookings()
      .then((res) => setBookings(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-semibold mb-6">Bookings</h1>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="animate-pulse h-16 bg-gray-200 rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-semibold mb-6">Bookings for Your Listings</h1>

      {bookings.length === 0 ? (
        <EmptyState title="No bookings yet" description="Bookings for your listings will appear here." icon="📋" />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-gray-400">
                <th className="pb-3 font-medium">Guest</th>
                <th className="pb-3 font-medium">Listing</th>
                <th className="pb-3 font-medium">Dates</th>
                <th className="pb-3 font-medium">Guests</th>
                <th className="pb-3 font-medium">Total</th>
                <th className="pb-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id} className="border-b border-gray-100">
                  <td className="py-3">{b.guest_name}</td>
                  <td className="py-3 text-gray-500">{b.listing_title}</td>
                  <td className="py-3 text-gray-500 text-xs">
                    {formatDate(b.check_in)} → {formatDate(b.check_out)}
                  </td>
                  <td className="py-3 text-gray-500">{b.guests}</td>
                  <td className="py-3 font-medium">{formatPrice(b.total_price)}</td>
                  <td className="py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      b.status === "confirmed" ? "bg-green-50 text-green-600" :
                      b.status === "cancelled" ? "bg-red-50 text-red-500" :
                      "bg-gray-100 text-gray-500"
                    }`}>
                      {b.status.charAt(0).toUpperCase() + b.status.slice(1)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
