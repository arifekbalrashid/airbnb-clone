"use client";

import { addToWishlist, removeFromWishlist } from "@/lib/api";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

interface Props {
  listingId: number;
  isWishlisted: boolean;
  onToggle?: () => void;
}

export default function WishlistButton({ listingId, isWishlisted, onToggle }: Props) {
  const [wishlisted, setWishlisted] = useState(isWishlisted);
  const [loading, setLoading] = useState(false);
  const { currentUser, openLoginModal } = useAuth();

  async function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    
    if (!currentUser) {
      openLoginModal();
      return;
    }

    if (loading) return;
    setLoading(true);
    try {
      if (wishlisted) {
        await removeFromWishlist(listingId);
      } else {
        await addToWishlist(listingId);
      }
      setWishlisted(!wishlisted);
      onToggle?.();
    } catch (err) {
      console.error("Wishlist error:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={toggle}
      className="p-1.5 rounded-full hover:scale-110 transition-transform"
      aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
    >
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill={wishlisted ? "#FF385C" : "rgba(0,0,0,0.5)"} stroke="white" strokeWidth={1.5}>
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
      </svg>
    </button>
  );
}
