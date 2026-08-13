"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useGoogleLogin } from "@react-oauth/google";
import { useRouter } from "next/navigation";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  roleFilter?: "guest" | "host";
}

export default function LoginModal({ isOpen, onClose, roleFilter }: LoginModalProps) {
  const { login, register, googleLogin } = useAuth();
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"guest" | "host">(roleFilter || "guest");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setName("");
    setEmail("");
    setPassword("");
    setError("");
    setRole(roleFilter || "guest");
  };

  const switchMode = (newMode: "login" | "signup") => {
    setMode(newMode);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (mode === "login") {
        const user = await login(email, password);
        if (roleFilter && user.role !== roleFilter) {
          setError(
            roleFilter === "host"
              ? "This account is not a host account. Please use a host email or sign up as a host."
              : "This account is a host account. Please use a guest email."
          );
          setLoading(false);
          return;
        }
      } else {
        if (!name.trim()) {
          setError("Please enter your name.");
          setLoading(false);
          return;
        }
        await register(name, email, password, roleFilter || role);
      }
      resetForm();
      onClose();

      const loggedInRole = mode === "login" ? roleFilter || "guest" : (roleFilter || role);
      if (loggedInRole === "host" || roleFilter === "host") {
        router.push("/host");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (tokenResponse: any) => {
    setLoading(true);
    setError("");
    try {
      const user = await googleLogin(tokenResponse.access_token, roleFilter || role);
      if (roleFilter && user.role !== roleFilter) {
        setError(
          roleFilter === "host"
            ? "This account is not a host account."
            : "This account is a host account."
        );
        setLoading(false);
        return;
      }
      resetForm();
      onClose();

      if (user.role === "host") {
        router.push("/host");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Google login failed");
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: () => setError("Google login failed"),
  });

  const title = mode === "login" ? "Log in" : "Sign up";
  const subtitle = mode === "login"
    ? "Welcome back to Airbnb"
    : roleFilter === "host"
      ? "Create your host account"
      : "Welcome to Airbnb";

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pt-24">
      {/* Custom travel posters background */}
      <div 
        className="absolute inset-0 bg-cover bg-center" 
        style={{ backgroundImage: 'url(/host-bg.png)' }} 
      />
      {/* Dark overlay for readability and to capture clicks */}
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      
      {/* White Header Bar */}
      <div className="absolute top-0 left-0 right-0 h-20 bg-white z-10 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-full flex items-center">
          <div className="text-[#FF385C] font-bold text-2xl tracking-tight flex items-center gap-2 shrink-0 cursor-pointer" onClick={onClose}>
            <span className="text-[#FF385C]">airbnb</span>
          </div>
        </div>
      </div>

      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-[fadeInScale_0.2s_ease-out]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <h2 className="text-lg font-semibold text-center flex-1 pr-8">{title}</h2>
        </div>

        {/* Body */}
        <div className="p-6">
          <h3 className="text-xl font-medium mb-6">{subtitle}</h3>

          <form onSubmit={handleSubmit} className="space-y-0">
            {/* Name field (sign up only) */}
            {mode === "signup" && (
              <div className="relative border border-gray-300 rounded-t-lg focus-within:border-black focus-within:z-10 transition-colors">
                <label className="absolute left-4 top-2 text-[10px] font-medium text-gray-500 pointer-events-none">
                  Full name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  required
                  className="w-full px-4 pt-6 pb-2 text-sm rounded-t-lg bg-transparent focus:outline-none"
                />
              </div>
            )}

            {/* Email field */}
            <div className={`relative border border-gray-300 focus-within:border-black focus-within:z-10 transition-colors ${mode === "login" ? "rounded-t-lg" : "border-t-0"}`}>
              <label className="absolute left-4 top-2 text-[10px] font-medium text-gray-500 pointer-events-none">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className={`w-full px-4 pt-6 pb-2 text-sm bg-transparent focus:outline-none ${mode === "login" ? "rounded-t-lg" : ""}`}
              />
            </div>

            {/* Password field */}
            <div className="relative border border-gray-300 rounded-b-lg border-t-0 focus-within:border-black focus-within:z-10 transition-colors">
              <label className="absolute left-4 top-2 text-[10px] font-medium text-gray-500 pointer-events-none">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === "signup" ? "Create a password (min 6 chars)" : "Enter your password"}
                required
                minLength={mode === "signup" ? 6 : undefined}
                className="w-full px-4 pt-6 pb-2 text-sm rounded-b-lg bg-transparent focus:outline-none"
              />
            </div>

            {/* Role selector (sign up only, when no roleFilter) */}
            {mode === "signup" && !roleFilter && (
              <div className="pt-4">
                <p className="text-xs font-medium text-gray-500 mb-2">I want to:</p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole("guest")}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                      role === "guest"
                        ? "border-black bg-gray-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <span className="text-sm font-medium">Travel</span>
                    <span className="text-[10px] text-gray-400">Find places to stay</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole("host")}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                      role === "host"
                        ? "border-black bg-gray-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    <span className="text-sm font-medium">Host</span>
                    <span className="text-[10px] text-gray-400">List your property</span>
                  </button>
                </div>
              </div>
            )}

            {/* Error message */}
            {error && (
              <div className="!mt-4 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600">
                {error}
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="!mt-5 w-full py-3 bg-[#E51E5B] hover:bg-[#D70466] text-white rounded-lg font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (mode === "login" ? "Logging in..." : "Creating account...") : "Continue"}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-5">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400">or</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Social login buttons */}
          <div className="space-y-3">
            <button 
              type="button" 
              onClick={() => loginWithGoogle()} 
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 py-3 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>
          </div>

          {/* Toggle login/signup */}
          <div className="mt-5 text-center">
            {mode === "login" ? (
              <p className="text-sm text-gray-500">
                Don&apos;t have an account?{" "}
                <button onClick={() => switchMode("signup")} className="text-[#E51E5B] font-medium hover:underline">
                  Sign up
                </button>
              </p>
            ) : (
              <p className="text-sm text-gray-500">
                Already have an account?{" "}
                <button onClick={() => switchMode("login")} className="text-[#E51E5B] font-medium hover:underline">
                  Log in
                </button>
              </p>
            )}
          </div>

          {/* Demo hint */}
          {mode === "login" && (
            <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <p className="text-xs text-gray-500 font-medium mb-3 text-center">Fast Login</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEmail("priya@example.com");
                    setPassword("password123");
                  }}
                  className="flex-1 bg-white border border-gray-300 py-2 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  Demo Traveler
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEmail("vikram@example.com");
                    setPassword("password123");
                  }}
                  className="flex-1 bg-white border border-gray-300 py-2 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  Demo Host
                </button>
              </div>
              <div className="mt-3 text-xs text-gray-500 text-center space-y-1">
                <p><span className="font-medium">Traveler:</span> priya@example.com</p>
                <p><span className="font-medium">Host:</span> vikram@example.com</p>
                <p><span className="font-medium">Password:</span> password123</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
