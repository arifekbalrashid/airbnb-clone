"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getBooking } from "@/lib/api";
import { Booking } from "@/types";
import { formatDate } from "@/utils/formatters";
import { useCurrency } from "@/context/CurrencyContext";

export default function ConfirmationPage() {
  const { formatPrice } = useCurrency();
  const { bookingId } = useParams<{ bookingId: string }>();
  const [booking, setBooking] = useState<Booking | null>(null);

  useEffect(() => {
    getBooking(parseInt(bookingId)).then((res) => setBooking(res.data)).catch(() => {});
  }, [bookingId]);

  if (!booking) {
    return (
      <div className="max-w-xl mx-auto px-4 py-12 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/2 mb-4" />
        <div className="h-48 bg-gray-200 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-12 text-center">
      <div className="text-5xl mb-4">🎉</div>
      <h1 className="text-2xl font-semibold mb-2">Reservation confirmed!</h1>
      <p className="text-sm text-gray-400 mb-8">Your booking has been confirmed. Have a great trip!</p>

      <div className="border border-gray-200 rounded-xl p-6 text-left">
        {booking.listing_image && (
          <img
            src={booking.listing_image}
            alt={booking.listing_title || ""}
            className="w-full aspect-video object-cover rounded-lg mb-4"
          />
        )}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Property</span>
            <span className="font-medium">{booking.listing_title}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Location</span>
            <span>{booking.listing_city}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Check-in</span>
            <span>{formatDate(booking.check_in)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Check-out</span>
            <span>{formatDate(booking.check_out)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Guests</span>
            <span>{booking.guests}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Total</span>
            <span className="font-semibold">{formatPrice(booking.total_price)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Booking ID</span>
            <span className="text-xs font-mono">#{booking.id}</span>
          </div>
        </div>
      </div>

      <Link
        href="/trips"
        className="inline-block mt-6 px-6 py-3 bg-primary text-white rounded-lg font-medium text-sm hover:bg-primary-hover transition-colors"
      >
        View My Trips
      </Link>
    </div>
  );
}
