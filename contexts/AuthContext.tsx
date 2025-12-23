"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import AuthLoading from "@/components/auth-loading";

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string) => void;
  logout: () => void;
  checkAuth: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const checkAuth = () => {
    if (typeof window === "undefined") return false;
    const token = localStorage.getItem("access_token");
    return !!token;
  };

  useEffect(() => {
    // Check authentication on mount and when pathname changes
    const token = localStorage.getItem("access_token");
    setIsAuthenticated(!!token);

    // Protect dashboard routes
    const isDashboardRoute = pathname?.startsWith("/dashboard");
    const isAuthRoute =
      pathname?.startsWith("/auth/signin") ||
      pathname?.startsWith("/auth/register");

    if (isDashboardRoute && !token) {
      // Not authenticated, redirect to login
      router.push("/auth/signin");
      setIsLoading(false);
    } else if (isAuthRoute && token) {
      // Already authenticated, redirect to dashboard
      router.push("/dashboard");
      setIsLoading(false);
    } else {
      // Good to go
      setIsLoading(false);
    }
  }, [pathname, router]);

  const login = (token: string) => {
    localStorage.setItem("access_token", token);
    setIsAuthenticated(true);
    router.push("/dashboard");
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    setIsAuthenticated(false);
    router.push("/auth/signin");
  };

  // Show loading screen while checking auth
  if (isLoading) {
    return <AuthLoading />;
  }

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, isLoading, login, logout, checkAuth }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
