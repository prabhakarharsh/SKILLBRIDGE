"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import type { User } from "@/types";
import { authService } from "@/services/authService";
import { storage } from "@/utils/storage";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signup: (email: string, password: string) => Promise<{ user: User | null; error?: string }>;
  login: (email: string, password: string) => Promise<{ user: User | null; error?: string }>;
  verifyOTP: (email: string, code: string) => Promise<{ user: User | null; error?: string }>;
  logout: () => Promise<void>;
  completeProfile: (data: {
    name: string;
    branch: string;
    year: number;
    skills: string[];
    availability: string;
    bio: string;
  }) => Promise<{ user: User | null; error?: string }>;
  updateProfile: (data: Partial<User>) => Promise<User | null>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const currentUser = await authService.getCurrentUser();
    setUser(currentUser);
    setLoading(false);
  }, []);

  useEffect(() => {
    refreshUser();
    const handleAuthChange = () => refreshUser();
    window.addEventListener("auth-user-changed", handleAuthChange);
    window.addEventListener("storage", handleAuthChange);
    return () => {
      window.removeEventListener("auth-user-changed", handleAuthChange);
      window.removeEventListener("storage", handleAuthChange);
    };
  }, [refreshUser]);

  const signup = async (email: string, password: string) => {
    const result = await authService.signup(email, password);
    if (result.user) {
      setUser(result.user);
    }
    return result;
  };

  const login = async (email: string, password: string) => {
    const result = await authService.login(email, password);
    if (result.user) {
      setUser(result.user);
    }
    return result;
  };

  const verifyOTP = async (email: string, code: string) => {
    const result = await authService.verifyOTP(email, code);
    if (result.user) {
      setUser(result.user);
    }
    return result;
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  const completeProfile = async (data: {
    name: string;
    branch: string;
    year: number;
    skills: string[];
    availability: string;
    bio: string;
  }) => {
    const userId = storage.getCurrentUserId();
    if (!userId) return { user: null, error: "Not logged in" };
    
    const result = await authService.completeProfile(userId, data);
    if (result.user) {
      setUser(result.user);
    }
    return result;
  };

  const updateProfile = async (data: Partial<User>) => {
    const userId = storage.getCurrentUserId();
    if (!userId) return null;
    
    const updated = await authService.updateProfile(userId, data);
    if (updated) setUser(updated);
    return updated;
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      signup,
      login,
      verifyOTP,
      logout,
      completeProfile,
      updateProfile,
      refreshUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}