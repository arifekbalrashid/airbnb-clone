"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getBooking } from "@/lib/api";
import { Booking } from "@/types";
import { formatDate } from "@/utils/formatters";
import { useCurrency } from "@/context/CurrencyContext";
import { useToast } from "@/context/ToastContext";

export default function CheckoutPage() {
  const { formatPrice } = useCurrency();
  const { bookingId } = useParams<{ bookingId: string }>();
  const router = useRouter();
  const { showToast } = useToast();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await getBooking(parseInt(bookingId));
        setBooking(res.data);
      } catch {
        showToast("Booking not found", "error");
        router.push("/trips");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [bookingId, router, showToast]);

  function handlePay() {
    showToast("Payment successful! (Mock)");
    router.push(`/confirmation/${bookingId}`);
  }

  if (loading || !booking) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/2 mb-8" />
        <div className="h-64 bg-gray-200 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-semibold mb-8">Confirm and pay</h1>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Booking summary */}
        <div className="border border-gray-200 rounded-xl p-5">
          {booking.listing_image && (
            <img
              src={booking.listing_image}
              alt={booking.listing_title || ""}
              className="w-full aspect-video object-cover rounded-lg mb-4"
            />
          )}
          <h3 className="font-medium">{booking.listing_title}</h3>
          <p className="text-sm text-gray-400">{booking.listing_city}</p>
          <div className="mt-4 space-y-1 text-sm text-gray-500">
            <p>{formatDate(booking.check_in)} → {formatDate(booking.check_out)}</p>
            <p>{booking.guests} guest{booking.guests > 1 ? "s" : ""} · {booking.nights} night{booking.nights > 1 ? "s" : ""}</p>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100 space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">{formatPrice(booking.nightly_price)} × {booking.nights} nights</span>
              <span>{formatPrice(booking.nightly_price * booking.nights)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Cleaning fee</span>
              <span>{formatPrice(booking.cleaning_fee)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Service fee</span>
              <span>{formatPrice(booking.service_fee)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Taxes</span>
              <span>{formatPrice(booking.tax)}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-gray-100 font-semibold">
              <span>Total</span>
              <span>{formatPrice(booking.total_price)}</span>
            </div>
          </div>
        </div>

        {/* Mock payment form */}
        <div>
          <h3 className="font-medium mb-4">Payment method</h3>
          <p className="text-xs text-gray-400 mb-4 bg-yellow-50 px-3 py-2 rounded-lg">
            ⚠️ This is a mock checkout. No real payment is processed.
          </p>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Card number</label>
              <input
                type="text"
                defaultValue="4242 4242 4242 4242"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                readOnly
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Expiry</label>
                <input
                  type="text"
                  defaultValue="12/28"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">CVV</label>
                <input
                  type="text"
                  defaultValue="123"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  readOnly
                />
              </div>
            </div>
          </div>
          <button
            onClick={handlePay}
            className="w-full mt-6 py-3 bg-primary text-white rounded-lg font-medium text-sm hover:bg-primary-hover transition-colors"
          >
            Pay {formatPrice(booking.total_price)}
          </button>
        </div>
      </div>
    </div>
  );
}
