"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getHostBookings } from "@/lib/api";
import { HostBooking } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { formatDate } from "@/utils/formatters";

type TabType = "checking_out" | "currently_hosting" | "arriving_soon" | "upcoming" | "pending_review";

export default function HostDashboard() {
  const { currentUser } = useAuth();
  const [bookings, setBookings] = useState<HostBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>("checking_out");

  useEffect(() => {
    getHostBookings()
      .then((res) => setBookings(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Filter bookings (simplified logic for demonstration)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const filteredBookings = bookings.filter(b => {
    const checkIn = new Date(b.check_in);
    const checkOut = new Date(b.check_out);
    
    if (activeTab === "pending_review") {
      return checkOut < today && checkOut >= new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    }
    if (activeTab === "checking_out") {
      return checkOut.getTime() === today.getTime() || checkOut.getTime() === today.getTime() + 86400000;
    }
    if (activeTab === "currently_hosting") {
      return checkIn <= today && checkOut > today;
    }
    if (activeTab === "arriving_soon") {
      return checkIn.getTime() === today.getTime() || checkIn.getTime() === today.getTime() + 86400000;
    }
    if (activeTab === "upcoming") {
      return checkIn > new Date(today.getTime() + 86400000);
    }
    return false;
  });

  const getEmptyStateMessage = () => {
    switch (activeTab) {
      case "checking_out": return "You don't have any guests checking out today or tomorrow.";
      case "currently_hosting": return "You don't have any guests staying with you right now.";
      case "arriving_soon": return "You don't have any guests arriving today or tomorrow.";
      case "upcoming": return "You don't have any upcoming reservations at the moment.";
      case "pending_review": return "You don't have any guests to review right now.";
      default: return "No reservations to show.";
    }
  };

  const tabs: { id: TabType, label: string }[] = [
    { id: "checking_out", label: "Checking out" },
    { id: "currently_hosting", label: "Currently hosting" },
    { id: "arriving_soon", label: "Arriving soon" },
    { id: "upcoming", label: "Upcoming" },
    { id: "pending_review", label: "Pending review" },
  ];

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-8" />
        <div className="h-64 bg-gray-200 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      {/* Header */}
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-3xl font-semibold tracking-tight">Welcome back, {currentUser?.name?.split(' ')[0] || 'Host'}</h1>
      </div>

      {/* Your reservations section */}
      <div className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-[22px] font-semibold">Your reservations</h2>
          <Link href="/host/bookings" className="text-sm font-semibold underline hover:text-gray-600">
            All reservations ({bookings.length})
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex gap-6 overflow-x-auto mb-6 border-b border-gray-200 hide-scrollbar">
          {tabs.map((tab) => {
            const count = bookings.filter(b => {
              const checkIn = new Date(b.check_in);
              const checkOut = new Date(b.check_out);
              if (tab.id === "pending_review") return checkOut < today && checkOut >= new Date(today.getTime() - 7 * 86400000);
              if (tab.id === "checking_out") return checkOut.getTime() === today.getTime() || checkOut.getTime() === today.getTime() + 86400000;
              if (tab.id === "currently_hosting") return checkIn <= today && checkOut > today;
              if (tab.id === "arriving_soon") return checkIn.getTime() === today.getTime() || checkIn.getTime() === today.getTime() + 86400000;
              if (tab.id === "upcoming") return checkIn > new Date(today.getTime() + 86400000);
              return false;
            }).length;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
                  activeTab === tab.id
                    ? "border-black text-black"
                    : "border-transparent text-gray-500 hover:text-black hover:border-gray-300"
                }`}
              >
                {tab.label} ({count})
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="bg-gray-50/50 rounded-xl p-8 flex flex-col items-center justify-center min-h-[250px] border border-gray-100">
          {filteredBookings.length === 0 ? (
            <div className="text-center">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              </div>
              <p className="text-gray-500 text-sm">{getEmptyStateMessage()}</p>
            </div>
          ) : (
            <div className="w-full">
              {filteredBookings.map((b) => (
                <div key={b.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-3 flex items-center justify-between hover:shadow-md transition-shadow cursor-pointer">
                  <div>
                    <p className="font-semibold text-[15px]">{b.guest_name}</p>
                    <p className="text-sm text-gray-500 mt-1">{formatDate(b.check_in)} - {formatDate(b.check_out)} · {b.listing_title}</p>
                  </div>
                  <div className={`text-xs font-semibold px-3 py-1.5 rounded-full ${
                      b.status === "confirmed" ? "bg-green-50 text-green-700" :
                      b.status === "cancelled" ? "bg-red-50 text-red-700" :
                      "bg-gray-100 text-gray-700"
                    }`}>
                    {b.status.charAt(0).toUpperCase() + b.status.slice(1)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
