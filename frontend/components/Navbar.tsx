"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import LoginModal from "./LoginModal";
import CurrencyModal from "./CurrencyModal";

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

function toDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function formatDateShort(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function isSameDay(d1: Date, d2: Date): boolean {
  return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
}

function isInRange(day: Date, start: Date | null, end: Date | null): boolean {
  if (!start || !end) return false;
  return day > start && day < end;
}

function getNightCount(checkIn: string, checkOut: string): number {
  if (!checkIn || !checkOut) return 0;
  const a = new Date(checkIn + 'T00:00:00');
  const b = new Date(checkOut + 'T00:00:00');
  return Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}



export default function Navbar() {
  const { currentUser, logout, viewMode, setViewMode, openLoginModal } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isCurrencyModalOpen, setIsCurrencyModalOpen] = useState(false);

  const [searchWhere, setSearchWhere] = useState("");
  const [checkIn, setCheckIn] = useState<string | null>(null);
  const [checkOut, setCheckOut] = useState<string | null>(null);
  const [searchWho, setSearchWho] = useState("");
  const [activeSearchTab, setActiveSearchTab] = useState<"where" | "when" | "who" | null>(null);
  const [searchExpanded, setSearchExpanded] = useState(false);

  const today = new Date();
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [calYear, setCalYear] = useState(today.getFullYear());

  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const isExplorePage = ["/", "/homes", "/experiences", "/services"].includes(pathname);

  // Sync search fields from URL params on the search page
  useEffect(() => {
    if (pathname === "/search") {
      setSearchWhere(searchParams.get("location") || "");
      setCheckIn(searchParams.get("check_in") || null);
      setCheckOut(searchParams.get("check_out") || null);
      setSearchWho(searchParams.get("guests") || "");
    }
  }, [pathname, searchParams]);

  // Sync viewMode with the current URL path
  useEffect(() => {
    if (pathname.startsWith("/host")) {
      if (currentUser?.role === "host") {
        setViewMode("host");
      }
    } else {
      setViewMode("guest");
    }
  }, [pathname, currentUser?.role, setViewMode]);

  // On explore pages, search bar is always expanded at top, collapses on scroll
  // Uses passive scroll listener for 60fps performance
  useEffect(() => {
    if (!isExplorePage) {
      setSearchExpanded(false);
      setActiveSearchTab(null);
      return;
    }

    setSearchExpanded(window.scrollY < 1);
    setActiveSearchTab(null);

    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setSearchExpanded(window.scrollY < 1);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname, isExplorePage]);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const openHostLogin = () => {
    openLoginModal("host");
  };

  const openGeneralLogin = () => {
    openLoginModal();
  };

  const switchToTravelling = () => {
    setViewMode("guest");
    router.push("/");
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchWhere) params.set("location", searchWhere);
    if (checkIn) params.set("check_in", checkIn);
    if (checkOut) params.set("check_out", checkOut);
    
    if (searchWho) {
      if (pathname === '/services') {
        params.set("service_type", searchWho);
      } else {
        params.set("guests", searchWho.replace(/[^0-9]/g, ""));
      }
    }
    
    if (pathname === '/services' || pathname === '/experiences') {
      router.push(`${pathname}?${params.toString()}`);
    } else {
      router.push(`/search?${params.toString()}`);
    }
    
    setSearchExpanded(false);
    setActiveSearchTab(null);
  };

  const handleDayClick = (year: number, month: number, day: number) => {
    const clicked = new Date(year, month, day);
    const clickedStr = toDateStr(clicked);
    if (!checkIn || (checkIn && checkOut)) {
      // Start new selection
      setCheckIn(clickedStr);
      setCheckOut(null);
    } else {
      // Set checkout
      const startDate = new Date(checkIn + 'T00:00:00');
      if (clicked <= startDate) {
        setCheckIn(clickedStr);
        setCheckOut(null);
      } else {
        setCheckOut(clickedStr);
        setActiveSearchTab(null);
      }
    }
  };

  const getDateDisplay = () => {
    if (checkIn && checkOut) {
      return `${formatDateShort(checkIn)} – ${formatDateShort(checkOut)}`;
    }
    if (checkIn) return formatDateShort(checkIn);
    return '';
  };

  const dateDisplay = getDateDisplay();
  const nightCount = checkIn && checkOut ? getNightCount(checkIn, checkOut) : 0;

  const expandSearch = () => {
    setSearchExpanded(true);
  };

  const collapseSearch = () => {
    if (!isExplorePage) {
      setSearchExpanded(false);
      setActiveSearchTab(null);
    }
  };

  const navLinkClasses = (path: string) => {
    const isActive = pathname === path || (pathname?.startsWith(path) && path !== "/host");
    const isTodayActive = path === "/host" && pathname === "/host";
    return `text-sm font-medium px-4 py-2 rounded-full transition-colors ${isActive || isTodayActive ? "text-black" : "text-gray-500 hover:text-black hover:bg-gray-50"
      }`;
  };

  // === HOST VIEW ===
  if (viewMode === "host" && currentUser?.role === "host") {
    return (
      <>
        <nav className="sticky top-0 z-40 bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-20 relative">
            {/* Left: Logo */}
            <Link href="/host" className="text-[#FF385C] font-bold text-2xl tracking-tight flex items-center gap-2 shrink-0">
              <span className="text-[#FF385C]">airbnb</span>
            </Link>

            {/* Center: Host Navigation Tabs */}
            <div className="absolute left-1/2 -translate-x-1/2 hidden md:flex items-center gap-1 h-full">
              <Link href="/host" className={navLinkClasses("/host")}>Today</Link>
              <Link href="/host/calendar" className={navLinkClasses("/host/calendar")}>Calendar</Link>
              <Link href="/host/listings" className={navLinkClasses("/host/listings")}>Listings</Link>
              <Link href="/host/messages" className={navLinkClasses("/host/messages")}>Messages</Link>
            </div>

            {/* Right: Actions (matching traveller style) */}
            <div className="flex items-center justify-end gap-2 shrink-0">
              <button onClick={switchToTravelling} className="hidden sm:block text-sm font-medium px-4 py-2 hover:bg-gray-50 rounded-full transition-colors">
                Switch to travelling
              </button>

              <button
                onClick={() => setIsCurrencyModalOpen(true)}
                className="p-2 hover:bg-gray-50 rounded-full transition-colors hidden sm:flex items-center justify-center"
              >
                <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
              </button>

              <div className="relative ml-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#E51E5B] text-white flex items-center justify-center text-xs font-bold">
                    {currentUser.name.charAt(0).toUpperCase()}
                  </div>
                  <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="w-10 h-10 flex items-center justify-center border border-gray-200 rounded-full hover:shadow-md transition-shadow bg-white"
                  >
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>
                </div>

                {menuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                    <div className="absolute right-0 top-14 w-60 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-semibold">{currentUser.name}</p>
                        <p className="text-xs text-gray-500">{currentUser.email}</p>
                      </div>
                      <Link href="/host/listings" onClick={() => setMenuOpen(false)} className="block px-4 py-3 text-sm hover:bg-gray-50">
                        Manage listings
                      </Link>
                      <Link href="/host/bookings" onClick={() => setMenuOpen(false)} className="block px-4 py-3 text-sm hover:bg-gray-50">
                        Reservations
                      </Link>
                      <div className="border-t border-gray-100 my-1"></div>
                      <button onClick={() => { switchToTravelling(); setMenuOpen(false); }} className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50">
                        Switch to travelling
                      </button>
                      <div className="border-t border-gray-100 my-1"></div>
                      <button onClick={handleLogout} className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50">Log out</button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </nav>

        <CurrencyModal
          isOpen={isCurrencyModalOpen}
          onClose={() => setIsCurrencyModalOpen(false)}
        />
      </>
    );
  }

  // === TRAVELLER VIEW ===
  return (
    <>
      <nav className="sticky top-0 z-40 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Top Row: Logo + compact pill or empty center + right actions */}
          <div className="flex items-center justify-between h-20 relative">
            {/* Left: Logo */}
            <Link href="/" className="text-[#FF385C] font-bold text-2xl tracking-tight flex items-center gap-2 shrink-0">
              <span className="text-[#FF385C]">airbnb</span>
            </Link>

            {/* Center: Tabs & Compact Pill — absolutely centered on page */}
            <div className="absolute left-1/2 -translate-x-1/2 flex justify-center items-center h-full">
              
              {/* Navigation Tabs — fade out fast, slide up slightly */}
              <div 
                style={{
                  willChange: 'transform, opacity',
                  transition: searchExpanded
                    ? 'opacity 250ms cubic-bezier(0.2,0,0,1), transform 250ms cubic-bezier(0.2,0,0,1)'
                    : 'opacity 150ms cubic-bezier(0.2,0,0,1), transform 150ms cubic-bezier(0.2,0,0,1)',
                  opacity: searchExpanded ? 1 : 0,
                  transform: searchExpanded ? 'translateY(0)' : 'translateY(-8px)',
                  pointerEvents: searchExpanded ? 'auto' : 'none',
                }}
                className="absolute flex items-center gap-6"
              >
                <Link href="/" className={`flex items-center gap-2 group py-3 border-b-[3px] ${pathname === '/' ? 'border-black text-black' : 'border-transparent text-gray-500 hover:text-black hover:border-gray-300'} transition-colors`}>
                  <span className="text-4xl leading-none">🌍</span>
                  <span className="text-[15px] font-semibold whitespace-nowrap">All</span>
                </Link>

                <Link href="/homes" className={`flex items-center gap-2 group py-3 border-b-[3px] ${pathname === '/homes' ? 'border-black text-black' : 'border-transparent text-gray-500 hover:text-black hover:border-gray-300'} transition-colors`}>
                  <span className="text-4xl leading-none">🏡</span>
                  <span className="text-[15px] font-semibold whitespace-nowrap">Homes</span>
                </Link>

                <Link href="/experiences" className={`flex items-center gap-2 group py-3 border-b-[3px] ${pathname === '/experiences' ? 'border-black text-black' : 'border-transparent text-gray-500 hover:text-black hover:border-gray-300'} transition-colors`}>
                  <span className="text-4xl leading-none">🎈</span>
                  <span className="text-[15px] font-semibold whitespace-nowrap">Experiences</span>
                </Link>

                <Link href="/services" className={`flex items-center gap-2 group py-3 border-b-[3px] ${pathname === '/services' ? 'border-black text-black' : 'border-transparent text-gray-500 hover:text-black hover:border-gray-300'} transition-colors`}>
                  <span className="text-4xl leading-none">🛎️</span>
                  <span className="text-[15px] font-semibold whitespace-nowrap">Services</span>
                </Link>
              </div>

              {/* Compact Search Pill — fades in after tabs disappear */}
              <div
                style={{
                  willChange: 'transform, opacity',
                  transition: !searchExpanded
                    ? 'opacity 200ms cubic-bezier(0.2,0,0,1) 100ms, transform 200ms cubic-bezier(0.2,0,0,1) 100ms'
                    : 'opacity 150ms cubic-bezier(0.2,0,0,1), transform 150ms cubic-bezier(0.2,0,0,1)',
                  opacity: !searchExpanded ? 1 : 0,
                  transform: !searchExpanded ? 'scale(1) translateY(0)' : 'scale(0.92) translateY(12px)',
                  pointerEvents: !searchExpanded ? 'auto' : 'none',
                }}
                className="absolute"
              >
                <button
                  onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); setSearchExpanded(true); }}
                  className="hidden md:flex items-center border border-gray-300 rounded-full py-2 px-2 shadow-sm hover:shadow-md transition-shadow cursor-pointer bg-white h-12"
                >
                  <div className="text-sm font-medium px-4 whitespace-nowrap">
                    {searchWhere || "Anywhere"}
                  </div>
                  <div className="w-[1px] h-6 bg-gray-300"></div>
                  <div className="text-sm font-medium px-4 whitespace-nowrap">
                    {dateDisplay || "Anytime"}
                  </div>
                  <div className="w-[1px] h-6 bg-gray-300"></div>
                  <div className="text-sm text-gray-500 pl-4 pr-1 flex items-center gap-3 whitespace-nowrap">
                    {searchWho ? `${searchWho} guest${searchWho !== "1" ? "s" : ""}` : (pathname === '/services' ? 'Add service' : 'Add guests')}
                    <div className="bg-[#FF385C] p-2 rounded-full text-white">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center justify-end gap-2 shrink-0">
              {currentUser?.role === "host" ? (
                <button
                  onClick={() => { setViewMode("host"); router.push("/host"); }}
                  className="hidden sm:block text-sm font-medium px-4 py-2 hover:bg-gray-50 rounded-full transition-colors"
                >
                  Switch to hosting
                </button>
              ) : (
                <button
                  onClick={openHostLogin}
                  className="hidden sm:block text-sm font-medium px-4 py-2 hover:bg-gray-50 rounded-full transition-colors"
                >
                  Become a host
                </button>
              )}

              <button
                onClick={() => setIsCurrencyModalOpen(true)}
                className="p-2 hover:bg-gray-50 rounded-full transition-colors hidden sm:flex items-center justify-center"
              >
                <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
              </button>

              <div className="relative ml-2">
                {currentUser ? (
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#E51E5B] text-white flex items-center justify-center text-xs font-bold">
                      {currentUser.name.charAt(0).toUpperCase()}
                    </div>
                    <button
                      onClick={() => setMenuOpen(!menuOpen)}
                      className="w-10 h-10 flex items-center justify-center border border-gray-200 rounded-full hover:shadow-md transition-shadow bg-white"
                    >
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="flex items-center gap-3 border border-gray-200 rounded-full py-2 px-3 hover:shadow-md transition-shadow bg-white"
                  >
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                    <div className="w-8 h-8 rounded-full bg-gray-500 text-white flex items-center justify-center text-xs font-bold overflow-hidden">
                      <svg className="w-8 h-8 text-white mt-2" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 12a5 5 0 110-10 5 5 0 010 10zm0 2c-5.33 0-10 2.67-10 8v2h20v-2c0-5.33-4.67-8-10-8z" />
                      </svg>
                    </div>
                  </button>
                )}

                {menuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                    <div className="absolute right-0 top-14 w-60 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                      {!currentUser ? (
                        <>
                          <button onClick={openGeneralLogin} className="w-full text-left px-4 py-3 text-sm font-semibold hover:bg-gray-50">Sign up</button>
                          <button onClick={openGeneralLogin} className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50">Log in</button>
                          <div className="border-t border-gray-100 my-1"></div>
                          <button onClick={openHostLogin} className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50">Airbnb your home</button>
                        </>
                      ) : (
                        <>
                          <div className="px-4 py-3 border-b border-gray-100">
                            <p className="text-sm font-semibold">{currentUser.name}</p>
                            <p className="text-xs text-gray-500">{currentUser.email}</p>
                          </div>
                          <Link href="/messages" onClick={() => setMenuOpen(false)} className="block px-4 py-3 text-sm hover:bg-gray-50">Messages</Link>
                          <Link href="/trips" onClick={() => setMenuOpen(false)} className="block px-4 py-3 text-sm hover:bg-gray-50">Trips</Link>
                          <Link href="/wishlist" onClick={() => setMenuOpen(false)} className="block px-4 py-3 text-sm hover:bg-gray-50">Wishlists</Link>
                          <div className="border-t border-gray-100 my-1"></div>
                          {currentUser.role === "host" && (
                            <button onClick={() => { setViewMode("host"); router.push("/host"); setMenuOpen(false); }} className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50">
                              Switch to hosting
                            </button>
                          )}
                          <div className="border-t border-gray-100 my-1"></div>
                          <button onClick={handleLogout} className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50">Log out</button>
                        </>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Expanded Search Bar — smooth height collapse with scale morphing */}
          <div 
            style={{
              willChange: 'height, opacity, transform',
              transition: searchExpanded
                ? 'height 300ms cubic-bezier(0.2,0,0,1), opacity 250ms cubic-bezier(0.2,0,0,1) 50ms, transform 300ms cubic-bezier(0.2,0,0,1)'
                : 'height 250ms cubic-bezier(0.2,0,0,1), opacity 150ms cubic-bezier(0.2,0,0,1), transform 250ms cubic-bezier(0.2,0,0,1)',
              height: searchExpanded ? '88px' : '0px',
              opacity: searchExpanded ? 1 : 0,
              transform: searchExpanded ? 'scaleY(1) translateY(0)' : 'scaleY(0.65) translateY(-20px)',
              transformOrigin: 'top center',
              pointerEvents: searchExpanded ? 'auto' : 'none',
            }}
            className="hidden md:flex justify-center w-full relative"
          >
            <div className={`absolute top-2 flex items-center border border-gray-200 rounded-full shadow-md hover:shadow-lg transition-shadow w-full max-w-[850px] ${activeSearchTab ? "bg-gray-100" : "bg-white"}`}>

                {/* Where */}
                <div
                  onClick={() => setActiveSearchTab("where")}
                  className={`flex-[1.5] px-8 py-3 rounded-full transition-colors cursor-pointer flex flex-col justify-center h-16 ${activeSearchTab === "where" ? "bg-white shadow-lg" : "hover:bg-gray-200"}`}
                >
                  <label className="text-xs font-bold text-black tracking-wide cursor-pointer">Where</label>
                  <input
                    type="text"
                    placeholder="Search destinations"
                    value={searchWhere}
                    onChange={(e) => setSearchWhere(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    className="w-full bg-transparent border-none p-0 text-sm text-gray-600 focus:outline-none focus:ring-0 placeholder-gray-400 truncate"
                  />
                </div>
                
                {/* Divider */}
                <div className="w-[1px] h-8 bg-gray-200 shrink-0"></div>

                {/* When */}
                <div
                  onClick={() => setActiveSearchTab("when")}
                  className={`flex-1 px-6 py-3 rounded-full transition-colors cursor-pointer flex flex-col justify-center h-16 ${activeSearchTab === "when" ? "bg-white shadow-lg" : "hover:bg-gray-200"}`}
                >
                  <label className="text-xs font-bold text-black tracking-wide cursor-pointer">When</label>
                  <div className="text-sm text-gray-600 truncate">
                    {dateDisplay || <span className="text-gray-400">Add dates</span>}
                  </div>
                </div>

                {/* Divider */}
                <div className="w-[1px] h-8 bg-gray-200 shrink-0"></div>

                {/* Who / Type of service */}
                <div
                  onClick={() => setActiveSearchTab("who")}
                  className={`flex-[1.2] pl-6 pr-2 py-2 rounded-full transition-colors cursor-pointer flex items-center justify-between h-16 ${activeSearchTab === "who" ? "bg-white shadow-lg" : "hover:bg-gray-200"}`}
                >
                  <div className="flex flex-col justify-center w-full">
                    <label className="text-xs font-bold text-black tracking-wide cursor-pointer">{pathname === '/services' ? 'Type of service' : 'Who'}</label>
                    <input
                      type="text"
                      placeholder={pathname === '/services' ? 'Add service' : 'Add guests'}
                      value={searchWho}
                      onChange={(e) => setSearchWho(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                      className="w-full bg-transparent border-none p-0 text-sm text-gray-600 focus:outline-none focus:ring-0 placeholder-gray-400 truncate"
                    />
                  </div>

                  {/* Search Button */}
                  <button
                    onClick={(e) => { e.stopPropagation(); handleSearch(); }}
                    className="ml-2 w-12 h-12 rounded-full bg-[#FF385C] hover:bg-[#D70466] flex items-center justify-center shrink-0 transition-all duration-300"
                  >
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </button>
                </div>
              </div>

          {/* Date Picker Dropdown */}
              {activeSearchTab === "when" && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setActiveSearchTab(null)} />
                  <div className="absolute top-[80px] left-1/2 -translate-x-1/2 w-[850px] bg-white rounded-[32px] shadow-[0_10px_40px_rgba(0,0,0,0.1)] p-8 z-50 border border-gray-200">
                    <div className="flex justify-center mb-6">
                      <div className="bg-gray-100 rounded-full p-1 flex items-center gap-1">
                        <button className="px-6 py-2 bg-white rounded-full text-sm font-medium shadow-sm">Dates</button>
                        <button className="px-6 py-2 text-gray-500 rounded-full text-sm font-medium hover:text-black transition-colors">Flexible</button>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 mb-4">
                      <button
                        onClick={() => { if (calMonth === 0) { setCalMonth(11); setCalYear(calYear - 1); } else { setCalMonth(calMonth - 1); } }}
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                      </button>
                      <div className="flex-1" />
                      <button
                        onClick={() => { if (calMonth === 11) { setCalMonth(0); setCalYear(calYear + 1); } else { setCalMonth(calMonth + 1); } }}
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                      </button>
                    </div>

                    <div className="flex gap-8">
                      {[0, 1].map((offset) => {
                        const m = calMonth + offset;
                        const y = m > 11 ? calYear + 1 : calYear;
                        const mo = m % 12;
                        const checkInDate = checkIn ? new Date(checkIn + 'T00:00:00') : null;
                        const checkOutDate = checkOut ? new Date(checkOut + 'T00:00:00') : null;

                        return (
                          <div key={offset} className="flex-1">
                            <div className="text-center font-medium mb-4">
                              {new Date(y, mo).toLocaleString('default', { month: 'long', year: 'numeric' })}
                            </div>
                            <div className="grid grid-cols-7 text-center text-xs text-gray-400 mb-2 font-medium">
                              <div>S</div><div>M</div><div>T</div><div>W</div><div>T</div><div>F</div><div>S</div>
                            </div>
                            <div className="grid grid-cols-7 text-center text-sm gap-y-1">
                              {Array.from({ length: getFirstDayOfMonth(y, mo) }).map((_, i) => (
                                <div key={`e${offset}-${i}`} />
                              ))}
                              {Array.from({ length: getDaysInMonth(y, mo) }).map((_, i) => {
                                const thisDay = new Date(y, mo, i + 1);
                                const isStart = checkInDate && isSameDay(thisDay, checkInDate);
                                const isEnd = checkOutDate && isSameDay(thisDay, checkOutDate);
                                const inRange = isInRange(thisDay, checkInDate, checkOutDate);

                                let cls = 'w-10 h-10 mx-auto flex items-center justify-center cursor-pointer font-medium transition-colors ';
                                if (isStart || isEnd) {
                                  cls += 'bg-black text-white rounded-full';
                                } else if (inRange) {
                                  cls += 'bg-gray-100 text-black';
                                } else {
                                  cls += 'rounded-full hover:border hover:border-black';
                                }

                                return (
                                  <div
                                    key={`d${offset}-${i}`}
                                    onClick={() => handleDayClick(y, mo, i + 1)}
                                    className={cls}
                                  >
                                    {i + 1}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Night count + clear */}
                    {checkIn && checkOut && (
                      <div className="mt-4 flex items-center justify-between">
                        <span className="text-sm text-gray-600">{nightCount} night{nightCount !== 1 ? 's' : ''} selected</span>
                        <button
                          onClick={() => { setCheckIn(null); setCheckOut(null); }}
                          className="text-sm font-medium underline hover:text-black"
                        >Clear dates</button>
                      </div>
                    )}

                    <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
                      <button className="border border-black px-4 py-2 rounded-full text-xs font-medium shrink-0">Exact dates</button>
                      <button className="border border-gray-200 px-4 py-2 rounded-full text-xs font-medium hover:border-black shrink-0">± 1 day</button>
                      <button className="border border-gray-200 px-4 py-2 rounded-full text-xs font-medium hover:border-black shrink-0">± 2 days</button>
                      <button className="border border-gray-200 px-4 py-2 rounded-full text-xs font-medium hover:border-black shrink-0">± 3 days</button>
                      <button className="border border-gray-200 px-4 py-2 rounded-full text-xs font-medium hover:border-black shrink-0">± 7 days</button>
                      <button className="border border-gray-200 px-4 py-2 rounded-full text-xs font-medium hover:border-black shrink-0">± 14 days</button>
                    </div>
                  </div>
                </>
              )}

              {/* Service Type / Who Dropdown */}
              {activeSearchTab === "who" && pathname === '/services' && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setActiveSearchTab(null)} />
                  <div className="absolute top-[80px] right-0 w-[450px] bg-white rounded-[32px] shadow-[0_10px_40px_rgba(0,0,0,0.1)] p-8 z-50 border border-gray-200">
                    <div className="flex flex-wrap gap-3 justify-center">
                      {[
                        { name: "Photography", icon: "M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" },
                        { name: "Chefs", icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" },
                        { name: "Massage", icon: "M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
                        { name: "Prepared meals", icon: "M21 15a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10z" },
                        { name: "Training", icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
                        { name: "Make-up", icon: "M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" },
                        { name: "Hair", icon: "M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243zm0-5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z" },
                        { name: "Spa treatments", icon: "M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" },
                        { name: "Catering", icon: "M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" },
                      ].map((service) => (
                        <button
                          key={service.name}
                          onClick={(e) => { e.stopPropagation(); setSearchWho(service.name); setActiveSearchTab(null); }}
                          className={`flex items-center gap-2 px-5 py-2.5 rounded-full border border-gray-300 hover:border-black transition-colors ${searchWho === service.name ? 'border-black bg-gray-50' : 'bg-white'}`}
                        >
                          <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d={service.icon} />
                          </svg>
                          <span className="text-[14px] text-gray-700 whitespace-nowrap">{service.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

          {/* Backdrop to collapse the expanded search bar on non-home pages */}
          {searchExpanded && !isExplorePage && activeSearchTab === null && (
            <div className="fixed inset-0 z-[-1]" onClick={collapseSearch} />
          )}
        </div>
      </nav>

      <CurrencyModal
        isOpen={isCurrencyModalOpen}
        onClose={() => setIsCurrencyModalOpen(false)}
      />
    </>
  );
}
