"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getListings, getWishlistIds } from "@/lib/api";
import { ListingCard as ListingCardType } from "@/types";
import ListingCard from "@/components/ListingCard";
import { formatPrice } from "@/utils/formatters";

export default function HomePage() {
  const router = useRouter();
  const [listings, setListings] = useState<ListingCardType[]>([]);
  const [experiences, setExperiences] = useState<ListingCardType[]>([]);
  const [services, setServices] = useState<ListingCardType[]>([]);
  const [wishlistIds, setWishlistIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const [listingsRes, expRes, svcRes, wishRes] = await Promise.all([
          getListings({ limit: 20, sort_by: "rating_desc" }),
          getListings({ property_type: "experience", limit: 6, sort_by: "rating_desc" }),
          getListings({ property_type: "service", limit: 6, sort_by: "rating_desc" }),
          getWishlistIds(),
        ]);
        setListings(listingsRes.data);
        setExperiences(expRes.data);
        setServices(svcRes.data);
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

      {/* Experiences section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 border-t border-gray-100">
        <div className="flex justify-between items-end mb-6">
          <div>
            <h2 className="text-2xl font-bold mb-1">Discover experiences</h2>
            <p className="text-gray-500">Unique activities with local experts.</p>
          </div>
          <Link href="/experiences" className="text-sm font-semibold hover:underline">Show all</Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-square rounded-xl bg-gray-200" />
                <div className="mt-2 h-4 bg-gray-200 rounded w-3/4" />
                <div className="mt-1 h-4 bg-gray-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {experiences.map((exp) => (
              <Link href={`/listing/${exp.id}`} key={exp.id} className="group cursor-pointer">
                <div className="relative aspect-square rounded-xl overflow-hidden mb-3">
                  <Image src={exp.images?.[0]?.image_url || "https://picsum.photos/seed/exp/800/800"} alt={exp.title} fill className="object-cover group-hover:scale-105 transition duration-300" />
                  {exp.is_original && (
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider">
                      Original
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1 text-sm mb-1">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg>
                  <span>{exp.rating}</span>
                  <span className="text-gray-500">· {exp.location}</span>
                </div>
                <div className="font-medium text-sm line-clamp-2 leading-tight mb-1">{exp.title}</div>
                <div className="font-semibold text-sm">From {formatPrice(exp.price_per_night)} <span className="font-normal text-gray-800">/ person</span></div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Services section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 border-t border-gray-100 mb-10">
        <div className="flex justify-between items-end mb-6">
          <div>
            <h2 className="text-2xl font-bold mb-1">Explore services</h2>
            <p className="text-gray-500">Find exactly what you need.</p>
          </div>
          <Link href="/services" className="text-sm font-semibold hover:underline">Show all</Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-square rounded-xl bg-gray-200" />
                <div className="mt-2 h-4 bg-gray-200 rounded w-3/4" />
                <div className="mt-1 h-4 bg-gray-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {services.map((service) => (
              <Link href={`/listing/${service.id}`} key={service.id} className="group cursor-pointer flex flex-col h-full">
                <div className="relative aspect-square w-full overflow-hidden rounded-xl mb-3">
                  <Image src={service.images?.[0]?.image_url || "https://picsum.photos/seed/svc/800/800"} alt={service.title} fill className="object-cover group-hover:scale-105 transition duration-300" />
                  {service.is_popular && (
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider">
                      Popular
                    </div>
                  )}
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-medium text-[15px] leading-snug line-clamp-2 mb-1">{service.title}</h3>
                    {service.rating > 0 && (
                      <div className="flex items-center gap-1 text-[13px] text-gray-700 mb-2">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg>
                        <span className="font-semibold">{service.rating.toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                  <p className="text-sm mt-2">
                    <span className="font-semibold text-black">{formatPrice(service.price_per_night)}</span>
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
