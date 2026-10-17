"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { storage, type DemoState } from "@/utils/storage";
import { getUsers } from "@/utils/storage";

interface DemoContextType {
  demoState: DemoState;
  setSimulatedConsent: (consent: "pending" | "accepted" | "rejected") => void;
  setImpersonation: (userId: string | null) => void;
  resetAllData: () => void;
  getMockUsers: () => Array<{ id: string; name: string }>;
}

const DemoContext = createContext<DemoContextType | null>(null);

export function DemoProvider({ children }: { children: ReactNode }) {
  const [demoState, setDemoState] = useState<DemoState>({ 
    simulatedPartnerConsent: "pending", 
    currentImpersonation: null 
  });

  useEffect(() => {
    const saved = storage.getDemoState();
    setDemoState(saved);
  }, []);

  const setSimulatedConsent = useCallback((consent: "pending" | "accepted" | "rejected") => {
    setDemoState(prev => {
      const next = { ...prev, simulatedPartnerConsent: consent };
      storage.saveDemoState(next);
      return next;
    });
  }, []);

  const setImpersonation = useCallback((userId: string | null) => {
    setDemoState(prev => {
      const next = { ...prev, currentImpersonation: userId };
      storage.saveDemoState(next);
      return next;
    });

    if (userId) {
      storage.setCurrentUserId(userId);
      storage.setAuthToken(`token_${userId}`);
    } else {
      const users = getUsers();
      if (users.length > 0) {
        storage.setCurrentUserId(users[0].id);
        storage.setAuthToken("token_default");
      }
    }

    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("auth-user-changed"));
    }
  }, []);

  const resetAllData = useCallback(() => {
    storage.resetAllData();
    setDemoState({ simulatedPartnerConsent: "pending", currentImpersonation: null });
    window.location.reload();
  }, []);

  const getMockUsers = useCallback(() => {
    return getUsers().map(u => ({ id: u.id, name: u.name }));
  }, []);

  return (
    <DemoContext.Provider value={{
      demoState,
      setSimulatedConsent,
      setImpersonation,
      resetAllData,
      getMockUsers,
    }}>
      {children}
    </DemoContext.Provider>
  );
}

export function useDemoPanel() {
  const context = useContext(DemoContext);
  if (!context) {
    throw new Error("useDemoPanel must be used within a DemoProvider");
  }
  return context;
}

// Helper to check if we're in development
export function useIsDev(): boolean {
  return typeof process !== "undefined" && process.env.NODE_ENV !== "production";
}