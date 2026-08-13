"use client";

import { useState } from "react";
import { postReview } from "@/lib/api";
import { useToast } from "@/context/ToastContext";

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  listingId: number;
  bookingId: number;
  listingTitle: string;
  onSuccess: () => void;
}

export default function ReviewModal({
  isOpen,
  onClose,
  listingId,
  bookingId,
  listingTitle,
  onSuccess,
}: ReviewModalProps) {
  const { showToast } = useToast();
  const [rating, setRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) {
      showToast("Please select a rating", "error");
      return;
    }
    if (comment.trim().length < 10) {
      showToast("Review must be at least 10 characters long", "error");
      return;
    }

    setLoading(true);
    try {
      await postReview(listingId, { booking_id: bookingId, rating, comment });
      showToast("Review posted successfully!");
      onSuccess();
      onClose();
    } catch (e: any) {
      showToast(e.message || "Failed to post review", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold">Write a Review</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6">
            <p className="text-sm text-gray-500 mb-2">How was your stay at</p>
            <p className="font-medium text-lg">{listingTitle}?</p>
          </div>

          <div className="mb-6 flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className="focus:outline-none transition-transform hover:scale-110"
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                onClick={() => setRating(star)}
              >
                <svg
                  className={`w-10 h-10 ${
                    (hoveredRating || rating) >= star ? "text-yellow-400" : "text-gray-200"
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </button>
            ))}
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Share your experience
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What did you love? What could be improved?"
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-black resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary-hover text-white py-3 rounded-xl font-medium transition-colors disabled:opacity-50"
          >
            {loading ? "Submitting..." : "Submit Review"}
          </button>
        </form>
      </div>
    </div>
  );
}
