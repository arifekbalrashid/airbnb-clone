"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { getListings } from "@/lib/api";
import { ListingCard as ListingCardType } from "@/types";
import { formatPrice } from "@/utils/formatters";

export default function ExperiencesPage() {
  const { currentUser, openLoginModal } = useAuth();
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [experiences, setExperiences] = useState<ListingCardType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await getListings({ property_type: "experience", limit: 50 });
        setExperiences(res.data);
      } catch (e) {
        console.error("Failed to load experiences:", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const toggleWishlist = (id: number) => {
    if (!currentUser) {
      openLoginModal();
      return;
    }
    if (wishlist.includes(id)) {
      setWishlist(wishlist.filter(w => w !== id));
    } else {
      setWishlist([...wishlist, id]);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header section */}
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold mb-1">Airbnb Originals</h2>
          <p className="text-gray-500">Hosted by the world&apos;s most interesting people</p>
        </div>
      </div>

      {/* Grid */}
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
            <Link href={`/listing/${exp.id}`} key={exp.id} className="group cursor-pointer flex flex-col h-full">
              <div className="relative aspect-square w-full overflow-hidden rounded-xl mb-3">
                <Image 
                  src={exp.images?.[0]?.image_url || "https://picsum.photos/seed/exp/800/800"} 
                  alt={exp.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                
                {exp.is_original && (
                  <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
                    <svg className="w-3 h-3 text-black" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2l2.4 7.4h7.6l-6.1 4.5 2.3 7.3-6.2-4.6-6.2 4.6 2.3-7.3-6.1-4.5h7.6z"/>
                    </svg>
                    <span className="text-xs font-bold text-gray-900">Original</span>
                  </div>
                )}
                
                <button 
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWishlist(exp.id); }}
                  className="absolute top-3 right-3 p-1 rounded-full hover:scale-110 transition-transform z-10"
                >
                  <svg 
                    className={`w-6 h-6 ${wishlist.includes(exp.id) ? "fill-[#FF385C] text-[#FF385C]" : "fill-black/30 text-white"}`} 
                    stroke="currentColor" 
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>
              </div>
              
              <div className="flex flex-col flex-1">
                <h3 className="font-semibold text-[15px] leading-tight text-gray-900 line-clamp-2">{exp.title}</h3>
                <p className="text-[14px] text-gray-500 mt-0.5">{exp.location}</p>
                <div className="mt-auto pt-1 flex items-center gap-1 text-[14px]">
                  <span className="font-medium text-gray-900">From {formatPrice(exp.price_per_night)}</span>
                  <span className="text-gray-900">/ guest</span>
                  <span className="mx-1 text-gray-400">·</span>
                  <span className="flex items-center gap-1 text-gray-900">
                    <svg className="w-3 h-3 fill-current" viewBox="0 0 32 32"><path d="M15.094 1.579l-4.124 8.885-9.86 1.27a1 1 0 0 0-.542 1.736l7.293 6.565-1.965 9.852a1 1 0 0 0 1.483 1.061L16 25.951l8.625 4.997a1 1 0 0 0 1.482-1.06l-1.965-9.853 7.293-6.565a1 1 0 0 0-.541-1.735l-9.86-1.271-4.127-8.885a1 1 0 0 0-1.814 0z" fillRule="evenodd"></path></svg>
                    {exp.rating.toFixed(1)}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
