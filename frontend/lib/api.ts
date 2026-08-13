import {
  SearchFilters,
  Listing,
  ListingCard,
  PaginatedResponse,
  Booking,
  BookedRange,
  User,
  Review,
  WishlistItem,
  HostStats,
  HostBooking,
  Conversation,
  MessageItem,
} from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const userId =
    typeof window !== "undefined"
      ? localStorage.getItem("currentUserId") || "1"
      : "1";

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "X-User-Id": userId,
      ...options.headers,
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(err.detail || `HTTP ${res.status}`);
  }

  if (res.status === 204) return null as T;
  return res.json();
}

// Listings
export async function getListings(
  filters: SearchFilters = {}
): Promise<PaginatedResponse<ListingCard>> {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, String(value));
    }
  });
  return request(`/api/listings?${params.toString()}`);
}

export async function getListing(id: number): Promise<{ data: Listing }> {
  return request(`/api/listings/${id}`);
}

export async function createListing(
  data: Record<string, unknown>
): Promise<{ data: Listing; message: string }> {
  return request("/api/listings", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateListing(
  id: number,
  data: Record<string, unknown>
): Promise<{ data: Listing; message: string }> {
  return request(`/api/listings/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteListing(id: number): Promise<void> {
  return request(`/api/listings/${id}`, { method: "DELETE" });
}

export async function getAvailability(
  id: number
): Promise<{ booked_ranges: BookedRange[] }> {
  return request(`/api/listings/${id}/availability`);
}

export async function getListingReviews(
  id: number
): Promise<{ data: Review[] }> {
  return request(`/api/listings/${id}/reviews`);
}

export async function createReview(
  listingId: number,
  data: { rating: number; comment: string; booking_id?: number }
): Promise<{ data: Review; message: string }> {
  return request(`/api/listings/${listingId}/reviews`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// Bookings
export async function createBooking(data: {
  listing_id: number;
  check_in: string;
  check_out: string;
  guests: number;
}): Promise<{ data: Booking; message: string }> {
  return request("/api/bookings", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getMyBookings(): Promise<{ data: Booking[] }> {
  return request("/api/bookings/my");
}

export async function getBooking(
  id: number
): Promise<{ data: Booking }> {
  return request(`/api/bookings/${id}`);
}

export async function cancelBooking(
  id: number
): Promise<{ data: Booking; message: string }> {
  return request(`/api/bookings/${id}/cancel`, { method: "POST" });
}

// Wishlist
export async function getWishlist(): Promise<{ data: WishlistItem[] }> {
  return request("/api/wishlist");
}

export async function getWishlistIds(): Promise<{ data: number[] }> {
  return request("/api/wishlist/ids");
}

export async function addToWishlist(listingId: number): Promise<void> {
  return request(`/api/wishlist/${listingId}`, { method: "POST" });
}

export async function removeFromWishlist(listingId: number): Promise<void> {
  return request(`/api/wishlist/${listingId}`, { method: "DELETE" });
}

// Users
export async function getUsers(): Promise<{ data: User[] }> {
  return request("/api/users");
}

export async function getCurrentUser(): Promise<{ data: User | null }> {
  return request("/api/users/me");
}

export async function loginUser(email: string, password: string): Promise<{ data: User }> {
  return request("/api/users/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function googleLogin(token: string, role: string = "guest"): Promise<{ data: User }> {
  return request("/api/users/google-login", {
    method: "POST",
    body: JSON.stringify({ token, role }),
  });
}

export async function registerUser(name: string, email: string, password: string, role: string): Promise<{ data: User }> {
  return request("/api/users/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password, role }),
  });
}

// Host
export async function getHostStats(): Promise<{ data: HostStats }> {
  return request("/api/host/stats");
}

export async function getHostListings(): Promise<{ data: ListingCard[] }> {
  return request("/api/host/listings");
}

export async function getHostBookings(): Promise<{ data: HostBooking[] }> {
  return request("/api/host/bookings");
}

export async function postReview(listingId: number, data: { booking_id: number; rating: number; comment: string }): Promise<{ data: any; message: string }> {
  return request(`/api/listings/${listingId}/reviews`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// Messages
export async function getConversations(): Promise<{ data: Conversation[] }> {
  return request("/api/messages/conversations");
}

export async function getConversationMessages(
  otherUserId: number,
  listingId: number
): Promise<{ data: MessageItem[] }> {
  return request(`/api/messages/conversation/${otherUserId}/${listingId}`);
}

export async function sendMessage(data: {
  recipient_id: number;
  listing_id: number;
  content: string;
}): Promise<{ data: MessageItem; message: string }> {
  return request("/api/messages", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
