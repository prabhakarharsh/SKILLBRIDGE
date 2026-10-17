"use client";

import React, { useEffect } from "react";
import { AuthProvider } from "@/hooks/useAuth";
import { DemoProvider } from "@/hooks/useDemoPanel";
import { ToastProvider } from "@/hooks/useToast";
import { DemoPanel } from "@/components/layout/DemoPanel";
import { seedMockData } from "@/data/mockData";

function AppInitializer() {
  useEffect(() => {
    seedMockData();
  }, []);
  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <DemoProvider>
        <ToastProvider>
          <AppInitializer />
          {children}
          <DemoPanel />
        </ToastProvider>
      </DemoProvider>
    </AuthProvider>
  );
}
