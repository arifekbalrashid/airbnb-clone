"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { getListings, getWishlistIds } from "@/lib/api";
import { ListingCard as ListingCardType, PROPERTY_TYPES, AMENITY_LIST } from "@/types";
import ListingCard from "@/components/ListingCard";
import { Suspense } from "react";
import EmptyState from "@/components/EmptyState";
import ListingMapWrapper from "@/components/ListingMapWrapper";

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [listings, setListings] = useState<ListingCardType[]>([]);
  const [wishlistIds, setWishlistIds] = useState<number[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [showMap, setShowMap] = useState(true);
  const [hoveredListingId, setHoveredListingId] = useState<number | null>(null);

  // Read filters from URL
  const location = searchParams.get("location") || "";
  const checkIn = searchParams.get("check_in") || "";
  const checkOut = searchParams.get("check_out") || "";
  const guests = searchParams.get("guests") || "";
  const minPrice = searchParams.get("min_price") || "";
  const maxPrice = searchParams.get("max_price") || "";
  const propertyType = searchParams.get("property_type") || "";
  const amenities = searchParams.get("amenities") || "";
  const sortBy = searchParams.get("sort_by") || "";
  const page = parseInt(searchParams.get("page") || "1");

  // Local filter state for the filter panel
  const [filterLocation, setFilterLocation] = useState(location);
  const [filterMinPrice, setFilterMinPrice] = useState(minPrice);
  const [filterMaxPrice, setFilterMaxPrice] = useState(maxPrice);
  const [filterType, setFilterType] = useState(propertyType);
  const [filterAmenities, setFilterAmenities] = useState(amenities);
  const [filterSort, setFilterSort] = useState(sortBy);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const params: Record<string, string | number> = { page, limit: 20 };
        if (location) params.location = location;
        if (checkIn) params.check_in = checkIn;
        if (checkOut) params.check_out = checkOut;
        if (guests) params.guests = parseInt(guests);
        if (minPrice) params.min_price = parseFloat(minPrice);
        if (maxPrice) params.max_price = parseFloat(maxPrice);
        if (propertyType) params.property_type = propertyType;
        if (amenities) params.amenities = amenities;
        if (sortBy) params.sort_by = sortBy;

        const [res, wishRes] = await Promise.all([
          getListings(params),
          getWishlistIds(),
        ]);
        setListings(res.data);
        setTotal(res.total);
        setTotalPages(res.total_pages);
        setWishlistIds(wishRes.data);
      } catch (e) {
        console.error("Search error:", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [location, checkIn, checkOut, guests, minPrice, maxPrice, propertyType, amenities, sortBy, page]);

  function applyFilters() {
    const params = new URLSearchParams();
    if (filterLocation) params.set("location", filterLocation);
    if (filterMinPrice) params.set("min_price", filterMinPrice);
    if (filterMaxPrice) params.set("max_price", filterMaxPrice);
    if (filterType) params.set("property_type", filterType);
    if (filterAmenities) params.set("amenities", filterAmenities);
    if (filterSort) params.set("sort_by", filterSort);
    if (checkIn) params.set("check_in", checkIn);
    if (checkOut) params.set("check_out", checkOut);
    if (guests) params.set("guests", guests);
    router.push(`/search?${params.toString()}`);
    setShowFilters(false);
  }

  function clearFilters() {
    setFilterLocation("");
    setFilterMinPrice("");
    setFilterMaxPrice("");
    setFilterType("");
    setFilterAmenities("");
    setFilterSort("");
    router.push("/search");
    setShowFilters(false);
  }

  function goToPage(p: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(p));
    router.push(`/search?${params.toString()}`);
  }

  function toggleAmenity(id: number) {
    const current = filterAmenities ? filterAmenities.split(",").map(Number) : [];
    const updated = current.includes(id)
      ? current.filter((a) => a !== id)
      : [...current, id];
    setFilterAmenities(updated.join(","));
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Results header and filter toggle */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">
          {loading ? "Searching..." : (
            <>
              {`${total} stay${total !== 1 ? "s" : ""} found`}
              {location && ` in "${location}"`}
              {checkIn && checkOut && (() => {
                const a = new Date(checkIn + 'T00:00:00');
                const b = new Date(checkOut + 'T00:00:00');
                const nights = Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
                return nights > 0 ? <span className="text-gray-500 font-normal"> · {nights} night{nights !== 1 ? 's' : ''}</span> : null;
              })()}
            </>
          )}
        </h1>
        <div className="flex gap-2">
          <button
            onClick={() => setShowMap(!showMap)}
            className="hidden lg:flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            {showMap ? "Hide Map" : "Show Map"}
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
            Filters
          </button>
        </div>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="mb-6 p-4 border border-gray-200 rounded-xl bg-white">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Min Price</label>
              <input
                type="number"
                value={filterMinPrice}
                onChange={(e) => setFilterMinPrice(e.target.value)}
                placeholder="₹0"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Max Price</label>
              <input
                type="number"
                value={filterMaxPrice}
                onChange={(e) => setFilterMaxPrice(e.target.value)}
                placeholder="₹50,000"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Property Type</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">All types</option>
                {PROPERTY_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Sort By</label>
              <select
                value={filterSort}
                onChange={(e) => setFilterSort(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Default (Rating)</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating_desc">Top Rated</option>
                <option value="newest">Newest</option>
              </select>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-xs font-medium text-gray-500 mb-2">Amenities</label>
            <div className="flex flex-wrap gap-2">
              {AMENITY_LIST.map((a) => {
                const selected = filterAmenities.split(",").map(Number).includes(a.id);
                return (
                  <button
                    key={a.id}
                    onClick={() => toggleAmenity(a.id)}
                    className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${
                      selected
                        ? "bg-foreground text-white border-foreground"
                        : "border-gray-200 hover:border-gray-400"
                    }`}
                  >
                    {a.name}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <button
              onClick={applyFilters}
              className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-hover"
            >
              Apply Filters
            </button>
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-sm text-gray-500 hover:text-foreground"
            >
              Clear All
            </button>
          </div>
        </div>
      )}



      {/* Main Content Area */}
      <div className={`flex flex-col ${showMap ? 'lg:flex-row' : ''} gap-6 relative`}>
        
        {/* Left Side: Listings */}
        <div className={`w-full ${showMap ? 'lg:w-[55%] xl:w-[60%]' : ''}`}>
          {loading ? (
            <div className={`grid grid-cols-1 sm:grid-cols-2 ${showMap ? 'lg:grid-cols-2 xl:grid-cols-3' : 'md:grid-cols-3 lg:grid-cols-4'} gap-6`}>
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-square rounded-xl bg-gray-200" />
                  <div className="mt-2 h-4 bg-gray-200 rounded w-3/4" />
                  <div className="mt-1 h-4 bg-gray-200 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : listings.length === 0 ? (
            <EmptyState
              title="No stays found"
              description="Try adjusting your search or filters."
              icon="🔍"
            />
          ) : (
            <>
              <div className={`grid grid-cols-1 sm:grid-cols-2 ${showMap ? 'lg:grid-cols-2 xl:grid-cols-3' : 'md:grid-cols-3 lg:grid-cols-4'} gap-6`}>
                {listings.map((listing) => (
                  <div
                    key={listing.id}
                    onMouseEnter={() => setHoveredListingId(listing.id)}
                    onMouseLeave={() => setHoveredListingId(null)}
                  >
                    <ListingCard
                      listing={listing}
                      isWishlisted={wishlistIds.includes(listing.id)}
                    />
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => goToPage(p)}
                      className={`w-9 h-9 rounded-full text-sm font-medium transition-colors ${
                        p === page
                          ? "bg-foreground text-white"
                          : "border border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Right Side: Map */}
        {showMap && (
          <div className="hidden lg:block lg:w-[45%] xl:w-[40%]">
            <ListingMapWrapper listings={listings} hoveredListingId={hoveredListingId} />
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading search...</div>}>
      <SearchContent />
    </Suspense>
  );
}
