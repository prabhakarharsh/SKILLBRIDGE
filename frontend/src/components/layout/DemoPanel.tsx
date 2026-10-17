"use client";

import { useDemoPanel, useIsDev } from "@/hooks/useDemoPanel";
import { creditService } from "@/services/creditService";
import { seedMockData } from "@/data/mockData";
import { X, RotateCcw, Zap, Trash2, CreditCard, Users, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { classNames } from "@/utils/helpers";

export function DemoPanel() {
  const isDev = useIsDev();
  const { demoState, setSimulatedConsent, setImpersonation, resetAllData, getMockUsers } = useDemoPanel();
  const { user, refreshUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Listen for custom trigger from Navbar Cheat Panel button
    const handleToggle = () => setIsOpen(prev => !prev);
    window.addEventListener("toggle-cheat-panel", handleToggle);
    return () => window.removeEventListener("toggle-cheat-panel", handleToggle);
  }, []);

  if (!mounted || !isDev) return null;

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleReset = async () => {
    try {
      resetAllData();
      seedMockData();
      await refreshUser();
      showToast("Syndicate data reset & re-seeded!");
    } catch (e) {
      showToast("Reset failed", "error");
    }
  };

  const handleAddCredits = async () => {
    if (!user) return;
    try {
      await creditService.addCredits(user.id, "teach-session");
      const balance = await creditService.getBalance(user.id);
      showToast(`Added 1 credit. Vault balance: ${balance} CR`);
    } catch (e) {
      showToast("Failed to add credits", "error");
    }
  };

  const handleSpendCredit = async () => {
    if (!user) return;
    try {
      await creditService.spendCredits(user.id, "request-help");
      const balance = await creditService.getBalance(user.id);
      showToast(`Spent 1 credit. Vault balance: ${balance} CR`);
    } catch (e) {
      showToast("Failed to spend credit", "error");
    }
  };

  const handleImpersonate = (userId: string) => {
    setImpersonation(userId);
    showToast(`Impersonating player ${userId.slice(0, 8)}...`);
  };

  const handleStopImpersonate = () => {
    setImpersonation(null);
    showToast("Returned to default player");
  };

  const mockUsers = getMockUsers();

  return (
    <>
      {/* Hidden button with target id for Navbar fallback */}
      <button
        id="demo-panel-toggle-btn"
        className="sr-only"
        onClick={() => setIsOpen(prev => !prev)}
        aria-hidden="true"
      >
        Toggle
      </button>

      {/* Floating Cheat Panel Quick Pill (Bottom Right) */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-40 brutal-btn bg-brutal-pink border-3 border-black px-3.5 py-2 rounded-2xl font-display font-black text-xs uppercase flex items-center gap-2 shadow-2xl hover:scale-105"
      >
        <span>🕹️</span>
        <span className="hidden sm:inline">Cheat Panel</span>
      </button>

      {/* Toast notification inside panel */}
      {toast && (
        <div className="fixed bottom-16 right-4 z-50 bg-black text-brutal-yellow border-2 border-black px-4 py-2 rounded-xl font-mono text-xs font-black brutal-shadow">
          {toast.message}
        </div>
      )}

      {/* Slide-out Drawer */}
      <div
        className={classNames(
          "fixed top-0 right-0 z-50 h-screen w-80 bg-[#fefce8] pixel-pattern border-l-4 border-black brutal-shadow-lg",
          "flex flex-col transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-white border-b-3 border-black flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xl">🕹️</span>
            <div>
              <h3 className="font-display font-black text-sm uppercase tracking-tight text-black">
                Arcade Cheat Panel
              </h3>
              <p className="font-mono text-[10px] text-black/60 font-bold">DEV & DEMO SIMULATOR</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="w-8 h-8 rounded-xl bg-white hover:bg-gray-100 border-2 border-black flex items-center justify-center font-bold text-black"
            aria-label="Close cheat panel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable controls */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Active Player */}
          <div className="p-4 bg-white rounded-2xl border-3 border-black brutal-shadow-sm">
            <div className="text-[10px] font-mono font-black uppercase text-black/60 mb-1">
              ACTIVE PLAYER PROFILE:
            </div>
            <div className="font-display font-black text-sm uppercase text-black">
              {user?.name || "Anonymous Player"}
            </div>
            <div className="font-mono text-xs text-black/70 font-medium truncate">
              {user?.email || "Not logged in"}
            </div>
            {demoState.currentImpersonation && (
              <div className="mt-2 text-[10px] font-mono font-black bg-brutal-yellow px-2 py-0.5 rounded border border-black inline-block">
                IMPERSONATING: #{demoState.currentImpersonation.slice(0, 8)}
              </div>
            )}
          </div>

          {/* 2-Key Consent Simulator */}
          <div className="p-4 bg-white rounded-2xl border-3 border-black brutal-shadow-sm">
            <div className="text-[10px] font-mono font-black uppercase text-black/60 mb-2">
              SIMULATE PEER KEY (GATE 03):
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {(["pending", "accepted", "rejected"] as const).map(state => (
                <button
                  key={state}
                  type="button"
                  onClick={() => setSimulatedConsent(state)}
                  className={classNames(
                    "py-1.5 px-2 rounded-xl border-2 border-black font-mono font-black text-[10px] uppercase transition-all",
                    demoState.simulatedPartnerConsent === state
                      ? "bg-black text-white"
                      : "bg-white hover:bg-gray-100 text-black"
                  )}
                >
                  {state}
                </button>
              ))}
            </div>
            <p className="font-mono text-[10px] text-black/60 mt-2 font-bold">
              Current Peer State: <span className="text-black uppercase">{demoState.simulatedPartnerConsent}</span>
            </p>
          </div>

          {/* Coin Vault Cheats */}
          <div className="p-4 bg-white rounded-2xl border-3 border-black brutal-shadow-sm">
            <div className="text-[10px] font-mono font-black uppercase text-black/60 mb-2">
              VAULT COIN CHEATS:
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleAddCredits}
                className="brutal-btn p-2 rounded-xl bg-brutal-mint border-2 border-black font-display font-black text-xs uppercase flex items-center justify-center gap-1"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>+1 Credit</span>
              </button>
              <button
                type="button"
                onClick={handleSpendCredit}
                className="brutal-btn p-2 rounded-xl bg-brutal-pink border-2 border-black font-display font-black text-xs uppercase flex items-center justify-center gap-1"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>-1 Credit</span>
              </button>
            </div>
          </div>

          {/* Player Switcher */}
          <div className="p-4 bg-white rounded-2xl border-3 border-black brutal-shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="text-[10px] font-mono font-black uppercase text-black/60">
                SWITCH MOCK PLAYER:
              </div>
              {demoState.currentImpersonation && (
                <button
                  type="button"
                  onClick={handleStopImpersonate}
                  className="font-mono text-[10px] font-bold text-red-600 underline"
                >
                  Reset
                </button>
              )}
            </div>
            <div className="space-y-1.5 max-h-36 overflow-y-auto">
              {mockUsers.map(u => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => handleImpersonate(u.id)}
                  className={classNames(
                    "w-full text-left p-2 rounded-xl border font-mono text-xs flex items-center justify-between",
                    demoState.currentImpersonation === u.id
                      ? "bg-black text-white border-black font-bold"
                      : "bg-gray-50 hover:bg-gray-100 border-black/20 text-black font-medium"
                  )}
                >
                  <span className="truncate">{u.name}</span>
                  <span className="text-[10px] opacity-75">#{u.id.slice(0, 5)}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Reset Factory Seed */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleReset}
              className="brutal-btn w-full p-3 rounded-2xl bg-white hover:bg-red-50 border-3 border-black font-display font-black text-xs uppercase text-red-600 flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>RESET & RESEED ALL DATA</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
