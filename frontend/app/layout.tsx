import type { Metadata } from "next";
import { Nunito_Sans } from "next/font/google";
import "./globals.css";
import { Suspense } from "react";
import Navbar from "@/components/Navbar";
import { AuthProvider } from "@/context/AuthContext";
import { CurrencyProvider } from "@/context/CurrencyContext";
import { ToastProvider } from "@/context/ToastContext";
import { GoogleOAuthProvider } from "@react-oauth/google";

const nunitoSans = Nunito_Sans({
  variable: "--font-nunito-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Airbnb Clone",
  description: "Book unique homes and experiences around India",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${nunitoSans.variable} antialiased`}>
      <body className="min-h-screen flex flex-col">
        <GoogleOAuthProvider clientId="640979592402-v1vd97715cvvm9a09u9s878jo1agouep.apps.googleusercontent.com">
          <AuthProvider>
            <CurrencyProvider>
              <ToastProvider>
                <Suspense fallback={null}>
                  <Navbar />
                </Suspense>
                <main className="flex-1">{children}</main>
              </ToastProvider>
            </CurrencyProvider>
          </AuthProvider>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
