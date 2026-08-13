"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { getListing, getAvailability, getListingReviews, createBooking, getWishlistIds, sendMessage } from "@/lib/api";
import { Listing, BookedRange, Review } from "@/types";
import { formatDate, capitalize } from "@/utils/formatters";
import { useCurrency } from "@/context/CurrencyContext";
import WishlistButton from "@/components/WishlistButton";
import { useToast } from "@/context/ToastContext";
import { useAuth } from "@/context/AuthContext";
import ListingMapWrapper from "@/components/ListingMapWrapper";

export default function ListingDetailPage() {
  const { formatPrice } = useCurrency();
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  const { currentUser, openLoginModal } = useAuth();

  const [listing, setListing] = useState<Listing | null>(null);
  const [bookedRanges, setBookedRanges] = useState<BookedRange[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [wishlistIds, setWishlistIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Booking state - pre-fill from URL params if available
  const [checkIn, setCheckIn] = useState(searchParams.get("check_in") || "");
  const [checkOut, setCheckOut] = useState(searchParams.get("check_out") || "");
  const [guests, setGuests] = useState(parseInt(searchParams.get("guests") || "1") || 1);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [showPhotosModal, setShowPhotosModal] = useState(false);
  
  const handleMessageHost = async () => {
    if (!currentUser) {
      openLoginModal();
      return;
    }
    if (!listing?.host) return;

    try {
      await sendMessage({
        recipient_id: listing.host.id,
        listing_id: listing.id,
        content: `Hi ${listing.host.name}! I'm interested in your listing "${listing.title}". I'd love to know more!`,
      });
      router.push("/messages");
    } catch (e) {
      console.error("Failed to send message:", e);
      showToast("Failed to send message. Please try again.");
    }
  };

  useEffect(() => {
    async function load() {
      try {
        const [listingRes, availRes, reviewsRes, wishRes] = await Promise.all([
          getListing(parseInt(id)),
          getAvailability(parseInt(id)),
          getListingReviews(parseInt(id)),
          getWishlistIds(),
        ]);
        setListing(listingRes.data);
        setBookedRanges(availRes.booked_ranges);
        setReviews(reviewsRes.data);
        setWishlistIds(wishRes.data);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Failed to load listing");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  // Calculate price breakdown (mirrors backend formula for display)
  const nights = checkIn && checkOut
    ? Math.max(0, Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000))
    : 0;
  const nightlyTotal = listing ? listing.price_per_night * nights : 0;
  const cleaningFee = listing ? Math.round(listing.price_per_night * 0.10) : 0;
  const serviceFee = Math.round(nightlyTotal * 0.12);
  const tax = Math.round(nightlyTotal * 0.08);
  const total = nightlyTotal + cleaningFee + serviceFee + tax;

  // Check if a date is in a booked range
  function isDateBooked(dateStr: string): boolean {
    const d = new Date(dateStr);
    return bookedRanges.some((r) => {
      const start = new Date(r.check_in);
      const end = new Date(r.check_out);
      return d >= start && d < end;
    });
  }

  // Get min check-in date (today)
  const today = new Date().toISOString().split("T")[0];

  function handleReserve() {
    if (!checkIn || !checkOut || !listing) return;
    
    // Redirect to the new checkout page with query parameters instead of booking instantly
    const query = new URLSearchParams({
      listingId: listing.id.toString(),
      checkIn,
      checkOut,
      guests: guests.toString(),
    });
    router.push(`/checkout/new?${query.toString()}`);
  }

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-2/3 mb-4" />
        <div className="grid grid-cols-2 gap-2 mb-8">
          <div className="aspect-[4/3] bg-gray-200 rounded-xl" />
          <div className="grid grid-cols-2 gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-square bg-gray-200 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 text-center">
        <p className="text-lg font-medium">{error || "Listing not found"}</p>
        <button onClick={() => router.back()} className="mt-4 text-primary text-sm hover:underline">
          Go back
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
      {/* Title */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h1 className="text-2xl font-semibold">{listing.title}</h1>
          <p className="text-sm text-gray-400 mt-1">
            {listing.location}, {listing.city} · ★ {listing.rating.toFixed(2)} · {listing.review_count} reviews
          </p>
        </div>
        <WishlistButton listingId={listing.id} isWishlisted={wishlistIds.includes(listing.id)} />
      </div>

      {/* Image gallery */}
      <div className="relative mb-8 md:h-[450px]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 h-full rounded-2xl overflow-hidden group">
          {/* Main Image */}
          <div className="w-full h-full cursor-pointer overflow-hidden relative" onClick={() => setShowPhotosModal(true)}>
            <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none hover:bg-transparent"></div>
            <img
              src={listing.images[0]?.image_url || "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=1200&h=800&fit=crop"}
              alt={listing.title}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
            />
          </div>
          {/* Grid Images */}
          <div className="hidden md:grid grid-cols-2 gap-2 h-full">
            {[1, 2, 3, 4].map((index) => {
              const imgUrl = listing.images[index]?.image_url || `https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1200&h=800&fit=crop&sig=${listing.id}-${index}`;
              return (
                <div key={index} className="w-full h-full relative cursor-pointer overflow-hidden group/item" onClick={() => setShowPhotosModal(true)}>
                  <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 group-hover/item:bg-transparent transition-opacity z-10 pointer-events-none"></div>
                  <img
                    src={imgUrl}
                    alt={listing.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Show all photos button */}
        <button onClick={() => setShowPhotosModal(true)} className="absolute bottom-6 right-6 bg-white px-4 py-1.5 rounded-lg font-semibold text-sm shadow-[0_2px_4px_rgba(0,0,0,0.18)] border border-gray-900 flex items-center gap-2 hover:bg-gray-100 transition-colors z-20">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 32 32"><path d="M14 7h14v2H14V7zm0 8h14v2H14v-2zm0 8h14v2H14v-2zM4 7h6v2H4V7zm0 8h6v2H4v-2zm0 8h6v2H4v-2z"></path></svg>
          Show all photos
        </button>
      </div>

      {/* Content + Booking card */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left: listing info */}
        <div className="flex-1 min-w-0">
          {/* Host + property info */}
          <div className="border-b border-gray-100 pb-6 mb-6">
            <h2 className="text-xl font-medium">
              {capitalize(listing.property_type)} hosted by {listing.host?.name || "Host"}
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              {listing.property_type === "experience" || listing.property_type === "service" ? (
                <>{listing.max_guests} guest{listing.max_guests > 1 ? "s" : ""} max · {listing.location}</>
              ) : (
                <>{listing.max_guests} guest{listing.max_guests > 1 ? "s" : ""} · {listing.bedrooms} bedroom{listing.bedrooms > 1 ? "s" : ""} · {listing.beds} bed{listing.beds > 1 ? "s" : ""} · {listing.bathrooms} bathroom{listing.bathrooms > 1 ? "s" : ""}</>
              )}
            </p>
          </div>

          {/* Description */}
          <div className="border-b border-gray-100 pb-6 mb-6">
            <p className="text-sm text-gray-500 leading-relaxed">{listing.description}</p>
          </div>

          {/* Amenities */}
          {listing.amenities.length > 0 && (
            <div className="border-b border-gray-100 pb-6 mb-6">
              <h3 className="text-lg font-medium mb-4">What this place offers</h3>
              <div className="grid grid-cols-2 gap-3">
                {listing.amenities.map((a) => (
                  <div key={a.id} className="flex items-center gap-2 text-sm text-gray-500">
                    <span className="text-base">
                      {a.icon === "wifi" ? "📶" : a.icon === "pool" ? "🏊" : a.icon === "kitchen" ? "🍳" :
                       a.icon === "ac" ? "❄️" : a.icon === "parking" ? "🅿️" : a.icon === "washer" ? "🧺" :
                       a.icon === "tv" ? "📺" : a.icon === "workspace" ? "💻" : a.icon === "hot_tub" ? "♨️" :
                       a.icon === "gym" ? "🏋️" : a.icon === "beach" ? "🏖️" : a.icon === "mountain" ? "⛰️" : "✓"}
                    </span>
                    {a.name}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Map placeholder */}
          <div className="border-b border-gray-100 pb-6 mb-8">
            <h3 className="text-lg font-medium mb-4">Where you&apos;ll be</h3>
            <p className="mb-4 text-gray-500">📍 {listing.location}, {listing.city}, {listing.country}</p>
            <div className="w-full">
              <ListingMapWrapper listings={[listing as any]} className="w-full h-96 rounded-2xl overflow-hidden shadow-sm border border-gray-200 z-0 relative" />
            </div>
          </div>

        </div>

        {/* Right: booking card */}
        <div className="lg:w-[380px] shrink-0">
          <div className="sticky top-20 border border-gray-200 rounded-xl p-6 shadow-lg">
            <p className="text-xl font-semibold mb-4">
              {formatPrice(listing.price_per_night)}
              <span className="text-base font-normal text-gray-400">
                {listing.property_type === "experience" || listing.property_type === "service" ? " / person" : " night"}
              </span>
            </p>

            <div className="border border-gray-200 rounded-xl mb-4 overflow-hidden">
              <div className="grid grid-cols-2 border-b border-gray-200">
                <div className="p-3 border-r border-gray-200">
                  <label className="block text-[10px] font-bold uppercase">Check-in</label>
                  <input
                    type="date"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    min={today}
                    className="w-full text-sm mt-0.5 focus:outline-none"
                  />
                </div>
                <div className="p-3">
                  <label className="block text-[10px] font-bold uppercase">Checkout</label>
                  <input
                    type="date"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    min={checkIn || today}
                    className="w-full text-sm mt-0.5 focus:outline-none"
                  />
                </div>
              </div>
              <div className="p-3">
                <label className="block text-[10px] font-bold uppercase">Guests</label>
                <select
                  value={guests}
                  onChange={(e) => setGuests(parseInt(e.target.value))}
                  className="w-full text-sm mt-0.5 focus:outline-none"
                >
                  {Array.from({ length: listing.max_guests }, (_, i) => i + 1).map((n) => (
                    <option key={n} value={n}>
                      {n} guest{n > 1 ? "s" : ""}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={handleReserve}
              disabled={!checkIn || !checkOut || nights <= 0 || bookingLoading}
              className="w-full py-3 bg-primary text-white rounded-lg font-medium text-sm hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {bookingLoading ? "Reserving..." : "Reserve"}
            </button>
            {!checkIn || !checkOut ? (
              <p className="text-xs text-center text-gray-400 mt-2">Select dates to see price</p>
            ) : null}

            {nights > 0 && (
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">{formatPrice(listing.price_per_night)} × {nights} night{nights > 1 ? "s" : ""}</span>
                  <span>{formatPrice(nightlyTotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Cleaning fee</span>
                  <span>{formatPrice(cleaningFee)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Service fee</span>
                  <span>{formatPrice(serviceFee)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Taxes</span>
                  <span>{formatPrice(tax)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-200 font-semibold">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>
            )}

            {/* Booked dates info */}
            {bookedRanges.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-400 mb-1">Unavailable dates:</p>
                {bookedRanges.map((r, i) => (
                  <p key={i} className="text-xs text-gray-400">
                    {formatDate(r.check_in)} → {formatDate(r.check_out)}
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reviews Section - Full width below the 2-column layout */}
      <div className="mt-8 pt-8 border-t border-gray-200">
        <h3 className="text-2xl font-semibold mb-6 flex items-center gap-2">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 32 32"><path d="M15.094 1.579l-4.124 8.885-9.86 1.27a1 1 0 0 0-.542 1.736l7.293 6.565-1.965 9.852a1 1 0 0 0 1.483 1.061L16 25.951l8.625 4.997a1 1 0 0 0 1.482-1.06l-1.965-9.853 7.293-6.565a1 1 0 0 0-.541-1.735l-9.86-1.271-4.127-8.885a1 1 0 0 0-1.814 0z" fillRule="evenodd"></path></svg>
          {listing.rating.toFixed(2)} · {listing.review_count} review{listing.review_count !== 1 ? "s" : ""}
        </h3>
        
        {reviews.length === 0 ? (
          <p className="text-sm text-gray-400">No reviews yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
            {reviews.map((review) => (
              <div key={review.id} className="pb-4">
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold">
                    {review.user_name?.charAt(0) || "?"}
                  </div>
                  <div>
                    <p className="text-base font-semibold">{review.user_name}</p>
                    <p className="text-sm text-gray-500">{formatDate(review.created_at)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className={`w-3 h-3 ${i < review.rating ? "text-black" : "text-gray-200"}`} fill="currentColor" viewBox="0 0 32 32"><path d="M15.094 1.579l-4.124 8.885-9.86 1.27a1 1 0 0 0-.542 1.736l7.293 6.565-1.965 9.852a1 1 0 0 0 1.483 1.061L16 25.951l8.625 4.997a1 1 0 0 0 1.482-1.06l-1.965-9.853 7.293-6.565a1 1 0 0 0-.541-1.735l-9.86-1.271-4.127-8.885a1 1 0 0 0-1.814 0z" fillRule="evenodd"></path></svg>
                    ))}
                  </div>
                  <span className="text-sm font-semibold">· {review.rating === 5 ? "Excellent" : "Good"}</span>
                </div>
                <p className="text-base text-gray-800 leading-relaxed">{review.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Meet your host (Below the 2-column layout) */}
      <div className="mt-8 pt-8 border-t border-gray-200">
        <h2 className="text-2xl font-semibold mb-8">Meet your host</h2>
        
        <div className="flex flex-col md:flex-row gap-12">
          {/* Left Column: Host Card */}
          <div className="w-full md:w-[350px] shrink-0">
            <div className="bg-white rounded-3xl p-6 shadow-[0_6px_20px_rgba(0,0,0,0.08)] flex items-center justify-between border border-gray-100 mb-6">
              <div className="flex flex-col items-center flex-1">
                <div className="relative mb-2">
                  <div className="w-24 h-24 rounded-full bg-gray-200 overflow-hidden">
                    <img src={listing.host?.avatar_url || "https://i.pravatar.cc/150?u=a042581f4e29026704d"} alt={listing.host?.name || "Host"} className="w-full h-full object-cover" />
                  </div>
                  <div className="absolute bottom-0 right-0 bg-[#E51D53] text-white w-7 h-7 rounded-full flex items-center justify-center border-2 border-white">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                  </div>
                </div>
                <h3 className="text-2xl font-bold">{listing.host?.name || "Host"}</h3>
                <div className="flex items-center gap-1 text-gray-600 mt-1">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 32 32" fill="currentColor"><path d="M16 28c7.732 0 14-6.268 14-14S23.732 2 16 2 2 8.268 2 16s6.268 14 14 14zm0-2c-6.627 0-12-5.373-12-12S9.373 4 16 4s12 5.373 12 12-5.373 12-12 12zM14 11h4v11h-4V11zm2-4a2 2 0 100 4 2 2 0 000-4z"/></svg>
                  <span className="text-sm font-medium">Superhost</span>
                </div>
              </div>
              
              <div className="flex flex-col gap-4 pl-6 border-l border-gray-200">
                <div>
                  <p className="text-xl font-bold">{listing.review_count}</p>
                  <p className="text-xs font-semibold text-gray-500">Reviews</p>
                </div>
                <div className="w-full h-px bg-gray-200"></div>
                <div>
                  <div className="flex items-center gap-1">
                    <p className="text-xl font-bold">{listing.rating.toFixed(2)}</p>
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 32 32"><path d="M15.094 1.579l-4.124 8.885-9.86 1.27a1 1 0 0 0-.542 1.736l7.293 6.565-1.965 9.852a1 1 0 0 0 1.483 1.061L16 25.951l8.625 4.997a1 1 0 0 0 1.482-1.06l-1.965-9.853 7.293-6.565a1 1 0 0 0-.541-1.735l-9.86-1.271-4.127-8.885a1 1 0 0 0-1.814 0z" fillRule="evenodd"></path></svg>
                  </div>
                  <p className="text-xs font-semibold text-gray-500">Rating</p>
                </div>
                <div className="w-full h-px bg-gray-200"></div>
                <div>
                  <p className="text-xl font-bold">4</p>
                  <p className="text-xs font-semibold text-gray-500">Years hosting</p>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <svg className="w-6 h-6 text-gray-700 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <p className="text-[15px] text-gray-800">Lives in {listing.city}, India</p>
            </div>
          </div>

          {/* Right Column: Host Info */}
          <div className="flex-1">
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-3">{listing.host?.name || "Host"} is a Superhost</h3>
              <p className="text-gray-800 text-[15px] leading-relaxed">
                Superhosts are experienced, highly rated hosts who are committed to providing great stays for guests.
              </p>
            </div>

            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4">Host details</h3>
              <div className="space-y-1">
                <p className="text-[15px] text-gray-800">Response rate: 100%</p>
                <p className="text-[15px] text-gray-800">Responds within an hour</p>
              </div>
            </div>

            <button 
              onClick={handleMessageHost}
              className="bg-gray-900 text-white font-semibold text-[15px] px-6 py-3 rounded-lg hover:bg-black transition-colors mb-6"
            >
              Message host
            </button>

            <div className="flex items-center gap-3 border-t border-gray-200 pt-6">
              <svg className="w-8 h-8 text-pink-500 shrink-0" viewBox="0 0 32 32" fill="currentColor"><path d="M26 2H6a2 2 0 00-2 2v20a2 2 0 002 2h4.5l5.5 6 5.5-6H26a2 2 0 002-2V4a2 2 0 00-2-2zM16 21.6L12.7 18H6V4h20v14h-6.7L16 21.6zM15 14h2v2h-2v-2zm0-6h2v4h-2V8z"></path></svg>
              <p className="text-xs text-gray-500">
                To help protect your payment, always use Airbnb to send money and communicate with hosts.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Photos Modal */}
      {showPhotosModal && (
        <div className="fixed inset-0 bg-white z-[9999] overflow-y-auto flex flex-col">
          <div className="sticky top-0 bg-white px-6 py-4 flex items-center justify-between z-10">
            <button onClick={() => setShowPhotosModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors flex items-center justify-center">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 32 32"><path d="M20 28a2 2 0 0 1-1.41-.59l-11-11a2 2 0 0 1 0-2.82l11-11a2 2 0 1 1 2.82 2.82L11.83 15l9.59 9.59A2 2 0 0 1 20 28z"></path></svg>
            </button>
            <div className="flex gap-4">
               <button className="flex items-center gap-2 text-sm font-semibold hover:underline">
                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                 Share
               </button>
               <button className="flex items-center gap-2 text-sm font-semibold hover:underline">
                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                 Save
               </button>
            </div>
          </div>
          
          <div className="max-w-7xl mx-auto w-full pb-16 px-4 md:px-10 flex flex-col mt-4">
            <h2 className="text-[26px] font-semibold mb-8">Photo tour</h2>
            
            {/* Thumbnail grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-16">
              {listing.images.map((img, i) => (
                <div key={img.id} className="cursor-pointer group">
                  <div className="aspect-[4/3] rounded-lg overflow-hidden mb-2">
                    <img src={img.image_url} alt={img.caption || `Thumbnail ${i + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                  <p className="text-[15px] text-gray-800">{img.caption || `Photo ${i + 1}`}</p>
                </div>
              ))}
            </div>

            {/* Large photos */}
            <div className="flex flex-col gap-12 max-w-5xl">
              {listing.images.map((img, i) => (
                <div key={img.id} className="flex flex-col md:flex-row gap-6 md:gap-12 w-full">
                  <div className="md:w-1/4 shrink-0">
                    <h3 className="text-[22px] font-semibold sticky top-24">{img.caption || `Photo ${i + 1}`}</h3>
                  </div>
                  <div className="flex-1">
                    <img src={img.image_url} alt={img.caption || `Large ${i + 1}`} className="w-full h-auto object-cover rounded-xl shadow-sm" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
