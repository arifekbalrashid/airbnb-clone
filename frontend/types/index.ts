export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  avatar_url: string | null;
}

export interface ListingImage {
  id: number;
  image_url: string;
  caption: string | null;
  display_order: number;
}

export interface Amenity {
  id: number;
  name: string;
  icon: string | null;
}

export interface ListingCard {
  id: number;
  title: string;
  property_type: string;
  location: string;
  city: string;
  country: string;
  price_per_night: number;
  max_guests: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  rating: number;
  review_count: number;
  latitude: number | null;
  longitude: number | null;
  is_original: boolean;
  is_popular: boolean;
  images: ListingImage[];
}

export interface Listing extends ListingCard {
  host_id: number;
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string | null;
  amenities: Amenity[];
  host: {
    id: number;
    name: string;
    avatar_url: string | null;
  } | null;
}

export interface Booking {
  id: number;
  listing_id: number;
  guest_id: number;
  check_in: string;
  check_out: string;
  guests: number;
  nightly_price: number;
  nights: number;
  cleaning_fee: number;
  service_fee: number;
  tax: number;
  total_price: number;
  status: string;
  created_at: string;
  listing_title: string | null;
  listing_city: string | null;
  listing_image: string | null;
}

export interface Review {
  id: number;
  listing_id: number;
  user_id: number;
  rating: number;
  comment: string;
  created_at: string;
  user_name: string | null;
  user_avatar: string | null;
}

export interface WishlistItem {
  id: number;
  listing_id: number;
  created_at: string;
  listing: ListingCard;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface SearchFilters {
  location?: string;
  check_in?: string;
  check_out?: string;
  guests?: number;
  min_price?: number;
  max_price?: number;
  property_type?: string;
  amenities?: string;
  sort_by?: string;
  page?: number;
  limit?: number;
}

export interface HostStats {
  total_listings: number;
  total_bookings: number;
  upcoming_stays: number;
  total_revenue: number;
}

export interface HostBooking {
  id: number;
  listing_id: number;
  guest_id: number;
  guest_name: string | null;
  listing_title: string | null;
  check_in: string;
  check_out: string;
  guests: number;
  total_price: number;
  status: string;
  created_at: string;
}

export interface BookedRange {
  check_in: string;
  check_out: string;
}

export interface Conversation {
  other_user_id: number;
  other_user_name: string;
  other_user_avatar: string | null;
  listing_id: number;
  listing_title: string;
  last_message: string;
  last_message_time: string;
  unread_count: number;
}

export interface MessageItem {
  id: number;
  sender_id: number;
  sender_name: string;
  sender_avatar: string | null;
  recipient_id: number;
  recipient_name: string;
  recipient_avatar: string | null;
  listing_id: number;
  listing_title: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

export const PROPERTY_TYPES = [
  "apartment",
  "house",
  "villa",
  "hotel",
  "cabin",
  "guesthouse",
  "experience",
  "service",
] as const;

export const AMENITY_LIST = [
  { id: 1, name: "Wi-Fi", icon: "wifi" },
  { id: 2, name: "Pool", icon: "pool" },
  { id: 3, name: "Kitchen", icon: "kitchen" },
  { id: 4, name: "Air Conditioning", icon: "ac" },
  { id: 5, name: "Parking", icon: "parking" },
  { id: 6, name: "Washer", icon: "washer" },
  { id: 7, name: "TV", icon: "tv" },
  { id: 8, name: "Workspace", icon: "workspace" },
  { id: 9, name: "Hot Tub", icon: "hot_tub" },
  { id: 10, name: "Gym", icon: "gym" },
  { id: 11, name: "Beach Access", icon: "beach" },
  { id: 12, name: "Mountain View", icon: "mountain" },
] as const;

