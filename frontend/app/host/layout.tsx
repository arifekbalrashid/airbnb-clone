"use client";

import ProtectedRoute from "@/components/ProtectedRoute";

export default function HostLayout({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}
