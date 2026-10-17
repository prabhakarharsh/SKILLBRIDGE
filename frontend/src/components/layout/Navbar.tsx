"use client";

import { Link, useLocation } from "@/utils/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Menu, X, User, CreditCard, LogOut, LayoutDashboard, BookOpen, Award, Zap } from "lucide-react";
import { useState, useEffect } from "react";
import { creditService } from "@/services/creditService";

export function Navbar() {
  const { user, logout, loading } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [credits, setCredits] = useState(0);

  useEffect(() => {
    if (user) {
      creditService.getBalance(user.id).then(setCredits);
    }
  }, [user]);

  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/post-need", label: "Post Quest", icon: BookOpen },
    { path: "/credits", label: "Vault", icon: CreditCard },
    { path: "/rewards", label: "Loot Store", icon: Award },
    { path: "/arcade", label: "Arcade ⚡", icon: Zap },
  ];

  if (loading) {
    return (
      <header className="sticky top-0 left-0 right-0 z-40 bg-white border-b-4 border-black px-4 md:px-8 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 bg-brutal-yellow border-3 border-black px-3 py-1.5 rounded-xl brutal-shadow animate-pulse">
            <span className="w-8 h-8 rounded-lg bg-black text-brutal-yellow flex items-center justify-center font-display font-black text-lg">⚡</span>
            <span className="font-display font-black text-lg tracking-tight uppercase">SkillBridge</span>
          </div>
        </div>
      </header>
    );
  }

  if (!user) return null;

  return (
    <header className="sticky top-0 left-0 right-0 z-40 bg-white border-b-4 border-black px-4 md:px-8 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand / Retro Title */}
        <div className="flex items-center gap-4">
          <Link
            to="/dashboard"
            className="flex items-center gap-2 cursor-pointer bg-brutal-yellow border-3 border-black px-3 py-1.5 rounded-xl brutal-shadow transition-transform hover:-rotate-2"
          >
            <span className="w-8 h-8 rounded-lg bg-black text-brutal-yellow flex items-center justify-center font-display font-black text-lg">
              ⚡
            </span>
            <span className="font-display font-black text-lg sm:text-xl tracking-tight text-black uppercase">
              SkillBridge
            </span>
          </Link>
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-brutal-mint border-3 border-black brutal-shadow-sm sticker-rotate-right">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border border-black animate-ping" />
            <span className="text-xs font-black uppercase tracking-wider font-mono">
              CAMPUS SYNDICATE • 24 ONLINE
            </span>
          </div>
        </div>

        {/* Desktop Nav Pills */}
        <nav className="hidden lg:flex items-center gap-2 bg-brutal-purple/30 p-1.5 rounded-2xl border-3 border-black">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 py-1.5 rounded-xl font-display font-black text-xs uppercase transition-all flex items-center gap-1.5 ${
                  isActive
                    ? "bg-black text-white"
                    : "text-black hover:bg-black/10"
                }`}
              >
                <item.icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Side: Coin Vault & Player Avatar */}
        <div className="flex items-center gap-3">
          {/* Live Bouncy Coin Counter */}
          <Link
            to="/credits"
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-brutal-yellow border-3 border-black brutal-shadow font-display font-black text-sm hover:scale-105 transition-transform"
            title="SkillCredits Vault"
          >
            <span className="text-lg animate-bounce">🪙</span>
            <span className="font-mono text-sm sm:text-base tracking-tight font-black">
              {credits} SKILLCREDITS
            </span>
          </Link>

          {/* Cheat Panel Trigger */}
          <button
            type="button"
            onClick={() => {
              window.dispatchEvent(new CustomEvent("toggle-cheat-panel"));
            }}
            className="brutal-btn px-3 py-1.5 rounded-xl bg-brutal-pink border-3 border-black font-display font-black text-xs uppercase flex items-center gap-1.5"
            title="Open Arcade Cheat Panel"
          >
            <span>🕹️</span>
            <span className="hidden sm:inline">Cheat Panel</span>
          </button>

          {/* Profile Menu Trigger */}
          <div className="relative">
            <button
              onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              className="flex items-center gap-2 focus:outline-none"
              aria-expanded={profileMenuOpen}
              aria-haspopup="true"
            >
              <Avatar name={user.name} size="md" verified={user.isVerified} />
            </button>

            {profileMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setProfileMenuOpen(false)}
                />
                <div className="absolute right-0 top-full mt-3 w-64 bg-white rounded-3xl border-4 border-black brutal-shadow-lg p-4 z-50 animate-scale-in">
                  <div className="border-b-2 border-black pb-3 mb-3">
                    <p className="font-display font-black text-sm uppercase text-black">
                      {user.name}
                    </p>
                    <p className="font-mono text-xs text-black/60 truncate">
                      {user.email}
                    </p>
                    {user.isVerified && (
                      <Badge variant="primary" dot className="mt-2" size="sm">
                        Verified Student
                      </Badge>
                    )}
                  </div>
                  <div className="flex flex-col gap-1.5 font-display font-black text-xs uppercase">
                    <Link
                      to="/profile/me"
                      onClick={() => setProfileMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl border border-transparent hover:border-black hover:bg-brutal-yellow transition-colors"
                    >
                      <User className="w-4 h-4" />
                      Player Profile
                    </Link>
                    <Link
                      to="/credits"
                      onClick={() => setProfileMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl border border-transparent hover:border-black hover:bg-brutal-mint transition-colors"
                    >
                      <CreditCard className="w-4 h-4" />
                      Ledger &amp; Vault
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setProfileMenuOpen(false);
                      }}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl border border-transparent hover:border-black hover:bg-red-100 text-red-600 transition-colors w-full text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden brutal-btn p-2 rounded-xl bg-white border-3 border-black"
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 stroke-[3]" /> : <Menu className="w-5 h-5 stroke-[3]" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden mt-3 pt-3 border-t-3 border-black bg-white rounded-2xl p-4 brutal-shadow flex flex-col gap-2 font-display font-black text-xs uppercase">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border-2 border-black ${
                location.pathname === item.path
                  ? "bg-black text-white"
                  : "bg-white text-black hover:bg-brutal-yellow"
              }`}
            >
              <item.icon className="w-4 h-4" />
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}