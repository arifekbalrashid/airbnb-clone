"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User } from "@/types";
import { getCurrentUser, loginUser, registerUser, googleLogin as apiGoogleLogin } from "@/lib/api";
import LoginModal from "@/components/LoginModal";

type ViewMode = "guest" | "host";

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string, role: string) => Promise<User>;
  googleLogin: (token: string, role?: string) => Promise<User>;
  logout: () => void;
  openLoginModal: (roleFilter?: "guest" | "host") => void;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  loading: true,
  viewMode: "guest",
  setViewMode: () => {},
  login: async () => { throw new Error("Not initialized"); },
  register: async () => { throw new Error("Not initialized"); },
  googleLogin: async () => { throw new Error("Not initialized"); },
  logout: () => {},
  openLoginModal: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewModeState] = useState<ViewMode>("guest");
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginRoleFilter, setLoginRoleFilter] = useState<"guest" | "host" | undefined>(undefined);

  useEffect(() => {
    async function init() {
      try {
        const savedUserId = localStorage.getItem("currentUserId");
        if (savedUserId && savedUserId !== "0") {
          const meRes = await getCurrentUser();
          if (meRes.data) {
            setCurrentUser(meRes.data);
            const savedMode = localStorage.getItem("viewMode") as ViewMode;
            if (meRes.data.role === "host" && savedMode === "host") {
              setViewModeState("host");
            }
          }
        }
      } catch (e) {
        console.error("Failed to load user:", e);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  function setUserAndMode(user: User) {
    localStorage.setItem("currentUserId", String(user.id));
    setCurrentUser(user);
    if (user.role === "host") {
      setViewModeState("host");
      localStorage.setItem("viewMode", "host");
    } else {
      setViewModeState("guest");
      localStorage.setItem("viewMode", "guest");
    }
  }

  async function login(email: string, password: string): Promise<User> {
    const res = await loginUser(email, password);
    setUserAndMode(res.data);
    return res.data;
  }

  async function register(name: string, email: string, password: string, role: string): Promise<User> {
    const res = await registerUser(name, email, password, role);
    setUserAndMode(res.data);
    return res.data;
  }

  async function googleLogin(token: string, role?: string): Promise<User> {
    const res = await apiGoogleLogin(token, role);
    setUserAndMode(res.data);
    return res.data;
  }

  function logout() {
    localStorage.removeItem("currentUserId");
    localStorage.removeItem("viewMode");
    setCurrentUser(null);
    setViewModeState("guest");
  }

  function setViewMode(mode: ViewMode) {
    setViewModeState(mode);
    localStorage.setItem("viewMode", mode);
  }

  function openLoginModal(roleFilter?: "guest" | "host") {
    setLoginRoleFilter(roleFilter);
    setIsLoginModalOpen(true);
  }

  return (
    <AuthContext.Provider value={{ currentUser, loading, viewMode, setViewMode, login, register, googleLogin, logout, openLoginModal }}>
      {children}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        roleFilter={loginRoleFilter}
      />
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
