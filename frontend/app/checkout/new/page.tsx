"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getListing, createBooking } from "@/lib/api";
import { Listing } from "@/types";
import { formatDate } from "@/utils/formatters";
import { useCurrency } from "@/context/CurrencyContext";
import { useToast } from "@/context/ToastContext";
import { useAuth } from "@/context/AuthContext";

function CheckoutContent() {
  const { formatPrice } = useCurrency();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  const { currentUser } = useAuth();
  
  const listingId = searchParams.get("listingId");
  const checkIn = searchParams.get("checkIn");
  const checkOut = searchParams.get("checkOut");
  const guests = searchParams.get("guests") || "1";

  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    async function load() {
      if (!listingId) {
        router.push("/");
        return;
      }
      try {
        const res = await getListing(parseInt(listingId));
        setListing(res.data);
      } catch {
        showToast("Listing not found", "error");
        router.push("/");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [listingId, router, showToast]);

  const nights = checkIn && checkOut
    ? Math.max(0, Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000))
    : 0;

  const nightlyTotal = listing ? listing.price_per_night * nights : 0;
  const cleaningFee = listing ? Math.round(listing.price_per_night * 0.10) : 0;
  const serviceFee = Math.round(nightlyTotal * 0.12);
  const tax = Math.round(nightlyTotal * 0.08);
  const total = nightlyTotal + cleaningFee + serviceFee + tax;

  async function handleConfirmAndPay() {
    if (!checkIn || !checkOut || !listing || !currentUser) return;
    setBookingLoading(true);
    try {
      const res = await createBooking({
        listing_id: listing.id,
        check_in: checkIn,
        check_out: checkOut,
        guests: parseInt(guests),
      });
      showToast("Payment successful!");
      router.push(`/trips`);
    } catch (e: any) {
      showToast(e.message || "Booking failed", "error");
    } finally {
      setBookingLoading(false);
    }
  }

  if (loading || !listing) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-8" />
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex-1 space-y-4">
            <div className="h-24 bg-gray-200 rounded-xl" />
            <div className="h-24 bg-gray-200 rounded-xl" />
          </div>
          <div className="w-full md:w-[400px] h-96 bg-gray-200 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>
        <h1 className="text-3xl font-semibold">Confirm and pay</h1>
      </div>

      <div className="flex flex-col md:flex-row gap-12">
        {/* Left Side: Steps */}
        <div className="flex-1 space-y-6">
          {/* Step 1: Login */}
          <div className="border border-gray-200 rounded-xl p-6 shadow-[0_6px_16px_rgba(0,0,0,0.06)]">
            <h2 className="text-xl font-medium mb-4">1. Log in or sign up</h2>
            {!currentUser ? (
              <div className="flex items-center justify-between">
                <p className="text-gray-500">You must be logged in to book this place.</p>
                <button 
                  onClick={() => alert("Please use the 'Log in' button in the top right menu to continue.")} 
                  className="bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Continue
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <p className="text-gray-700">Logged in as <span className="font-semibold">{currentUser.name}</span> ({currentUser.email})</p>
                <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              </div>
            )}
          </div>

          {/* Step 2: Payment */}
          <div className={`border border-gray-200 rounded-xl p-6 ${!currentUser ? 'opacity-50 pointer-events-none' : ''}`}>
            <h2 className="text-xl font-medium mb-4">2. Add a payment method</h2>
            <p className="text-xs text-gray-400 mb-4 bg-yellow-50 px-3 py-2 rounded-lg">
              ⚠️ This is a mock checkout. No real payment is processed.
            </p>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Card number</label>
                <input type="text" placeholder="0000 0000 0000 0000" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" disabled={!currentUser} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Expiration</label>
                  <input type="text" placeholder="MM/YY" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" disabled={!currentUser} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">CVV</label>
                  <input type="text" placeholder="123" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" disabled={!currentUser} />
                </div>
              </div>
            </div>
          </div>

          {/* Step 3: Review */}
          <div className={`border border-gray-200 rounded-xl p-6 ${!currentUser ? 'opacity-50 pointer-events-none' : ''}`}>
            <h2 className="text-xl font-medium mb-4">3. Review your reservation</h2>
            <p className="text-gray-500 text-sm mb-6">By selecting the button below, I agree to the House Rules, Ground rules for guests, and Airbnb's Rebooking and Refund Policy.</p>
            <button
              onClick={handleConfirmAndPay}
              disabled={bookingLoading || !currentUser}
              className="w-full sm:w-auto bg-primary hover:bg-primary-hover text-white px-8 py-3 rounded-xl font-medium transition-colors disabled:opacity-50"
            >
              {bookingLoading ? "Processing..." : "Confirm and pay"}
            </button>
          </div>
        </div>

        {/* Right Side: Booking Summary Card */}
        <div className="w-full md:w-[400px]">
          <div className="border border-gray-200 rounded-xl p-6 sticky top-28 shadow-[0_6px_16px_rgba(0,0,0,0.12)] bg-white">
            <div className="flex gap-4 pb-6 border-b border-gray-200">
              {listing.images[0] && (
                <img
                  src={listing.images[0].image_url}
                  alt={listing.title}
                  className="w-28 h-20 object-cover rounded-lg"
                />
              )}
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-1">{listing.property_type}</p>
                <h3 className="font-medium text-sm leading-tight mb-1">{listing.title}</h3>
                <p className="text-xs text-gray-500">★ {listing.rating.toFixed(2)} ({listing.review_count} reviews)</p>
              </div>
            </div>
            
            <div className="py-6 border-b border-gray-200 space-y-4">
              <h3 className="font-medium text-lg">Price details</h3>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">{formatPrice(listing.price_per_night)} × {nights} nights</span>
                <span>{formatPrice(nightlyTotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 underline">Cleaning fee</span>
                <span>{formatPrice(cleaningFee)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 underline">Airbnb service fee</span>
                <span>{formatPrice(serviceFee)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 underline">Taxes</span>
                <span>{formatPrice(tax)}</span>
              </div>
            </div>

            <div className="pt-6 flex justify-between font-semibold text-lg">
              <span>Total (INR)</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutNewPage() {
  return (
    <Suspense fallback={<div className="p-8">Loading checkout...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}
