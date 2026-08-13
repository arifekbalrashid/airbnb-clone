"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { getHostBookings, getHostListings } from "@/lib/api";
import { HostBooking, ListingCard } from "@/types";

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

export default function HostCalendarPage() {
  const { currentUser, viewMode } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState<HostBooking[]>([]);
  const [listings, setListings] = useState<ListingCard[]>([]);
  const [loading, setLoading] = useState(true);

  const today = new Date();
  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  useEffect(() => {
    if (!currentUser || viewMode !== "host") {
      router.push("/");
      return;
    }
    async function load() {
      try {
        const [bRes, lRes] = await Promise.all([getHostBookings(), getHostListings()]);
        setBookings(bRes.data);
        setListings(lRes.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [currentUser, viewMode, router]);

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const monthName = new Date(year, month).toLocaleString("default", { month: "long", year: "numeric" });

  // Get bookings for a specific date
  function getBookingsForDate(dateStr: string): HostBooking[] {
    const d = new Date(dateStr);
    return bookings.filter((b) => {
      if (b.status === "cancelled") return false;
      const ci = new Date(b.check_in);
      const co = new Date(b.check_out);
      return d >= ci && d < co;
    });
  }

  // Get status color for a day
  function getDayStatus(dateStr: string): "booked" | "checkout" | "checkin" | "empty" {
    const d = new Date(dateStr);
    const matchingBookings = bookings.filter((b) => {
      if (b.status === "cancelled") return false;
      const ci = new Date(b.check_in);
      const co = new Date(b.check_out);
      return d >= ci && d < co;
    });
    if (matchingBookings.length === 0) return "empty";
    const isCheckIn = matchingBookings.some((b) => new Date(b.check_in).toDateString() === d.toDateString());
    const isCheckOut = matchingBookings.some((b) => {
      const co = new Date(b.check_out);
      co.setDate(co.getDate() - 1);
      return co.toDateString() === d.toDateString();
    });
    if (isCheckIn) return "checkin";
    if (isCheckOut) return "checkout";
    return "booked";
  }

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(year - 1); }
    else setMonth(month - 1);
  };

  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(year + 1); }
    else setMonth(month + 1);
  };

  const selectedBookings = selectedDate ? getBookingsForDate(selectedDate) : [];

  const statusColors = {
    booked: "bg-[#F7F7F7] text-black",
    checkin: "bg-[#E51E5B] text-white",
    checkout: "bg-[#FFB400] text-white",
    empty: "hover:bg-gray-50",
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-[#E51E5B] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-semibold mb-6">Calendar</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Calendar */}
        <div className="lg:col-span-2">
          {/* Legend */}
          <div className="flex items-center gap-4 mb-4 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-[#E51E5B]" />
              <span>Check-in</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-[#FFB400]" />
              <span>Check-out</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-[#F7F7F7] border border-gray-200" />
              <span>Booked</span>
            </div>
          </div>

          {/* Month navigation */}
          <div className="flex items-center justify-between mb-6">
            <button onClick={prevMonth} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
            </button>
            <h2 className="text-lg font-medium">{monthName}</h2>
            <button onClick={nextMonth} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 text-center text-xs font-medium text-gray-400 mb-2 border-b border-gray-100 pb-2">
            <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7">
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="h-20 border border-gray-50" />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              const status = getDayStatus(dateStr);
              const dayBookings = getBookingsForDate(dateStr);
              const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;
              const isSelected = selectedDate === dateStr;

              return (
                <div
                  key={day}
                  onClick={() => setSelectedDate(dateStr)}
                  className={`h-20 border border-gray-50 p-1 cursor-pointer transition-all relative ${
                    isSelected ? "ring-2 ring-black ring-inset" : ""
                  } ${statusColors[status]}`}
                >
                  <span className={`text-xs font-medium ${isToday ? "bg-black text-white w-6 h-6 rounded-full flex items-center justify-center" : ""}`}>
                    {day}
                  </span>
                  {dayBookings.length > 0 && (
                    <div className="mt-0.5">
                      {dayBookings.slice(0, 2).map((b) => (
                        <div key={b.id} className="text-[10px] truncate leading-tight opacity-80">
                          {b.guest_name?.split(" ")[0]}
                        </div>
                      ))}
                      {dayBookings.length > 2 && (
                        <div className="text-[10px] opacity-60">+{dayBookings.length - 2} more</div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right sidebar: selected date details */}
        <div className="lg:col-span-1">
          <div className="sticky top-28 bg-white border border-gray-200 rounded-2xl p-6">
            {selectedDate ? (
              <>
                <h3 className="font-semibold text-lg mb-1">
                  {new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  })}
                </h3>
                {selectedBookings.length === 0 ? (
                  <div className="mt-4 text-sm text-gray-400">
                    <p>No reservations on this date.</p>
                    <p className="mt-2">All your listings are available.</p>
                  </div>
                ) : (
                  <div className="mt-4 space-y-4">
                    <p className="text-sm text-gray-500">{selectedBookings.length} reservation{selectedBookings.length !== 1 ? "s" : ""}</p>
                    {selectedBookings.map((b) => (
                      <div key={b.id} className="border border-gray-100 rounded-xl p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-full bg-[#E51E5B] text-white flex items-center justify-center text-sm font-bold">
                            {b.guest_name?.charAt(0) || "?"}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{b.guest_name}</p>
                            <p className="text-xs text-gray-400">{b.guests} guest{b.guests !== 1 ? "s" : ""}</p>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-2 truncate">{b.listing_title}</p>
                        <div className="flex items-center text-xs text-gray-400 gap-2">
                          <span>{new Date(b.check_in).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                          <span>→</span>
                          <span>{new Date(b.check_out).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                        </div>
                        <div className="mt-2 flex items-center justify-between">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            b.status === "confirmed" ? "bg-green-50 text-green-600" :
                            b.status === "cancelled" ? "bg-red-50 text-red-600" :
                            "bg-gray-50 text-gray-600"
                          }`}>
                            {b.status}
                          </span>
                          <span className="text-sm font-semibold">₹{b.total_price.toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8">
                <svg className="w-12 h-12 mx-auto text-gray-200 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-sm text-gray-400">Click on a date to see reservations</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
