import type { Availability, TrustBadge } from "@/types";
import { AVAILABILITY_OPTIONS, TRUST_BADGES } from "@/utils/constants";

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(dateString);
}

export function formatAvailability(availability: Availability): string {
  const opt = AVAILABILITY_OPTIONS.find(a => a.value === availability);
  return opt?.label || availability;
}

export function getAvailabilityColor(availability: Availability): string {
  switch (availability) {
    case "now": return "bg-green-100 text-green-700";
    case "this-week": return "bg-blue-100 text-blue-700";
    case "this-month": return "bg-amber-100 text-amber-700";
    case "busy": return "bg-slate-100 text-slate-700";
  }
}

export function getTrustBadgeStyle(badge: TrustBadge): string {
  const tb = TRUST_BADGES.find(b => b.id === badge);
  return tb?.color || "bg-slate-100 text-slate-700";
}

export function getTrustBadgeIcon(badge: TrustBadge): string {
  const tb = TRUST_BADGES.find(b => b.id === badge);
  return tb?.icon || "✨";
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map(n => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function getAvatarColor(name: string): string {
  const colors = [
    "bg-primary-100 text-primary-700",
    "bg-accent-100 text-accent-700",
    "bg-green-100 text-green-700",
    "bg-amber-100 text-amber-700",
    "bg-purple-100 text-purple-700",
    "bg-pink-100 text-pink-700",
    "bg-blue-100 text-blue-700",
    "bg-indigo-100 text-indigo-700",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export function truncate(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen - 3) + "...";
}

export function classNames(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function debounce<T extends (...args: unknown[]) => unknown>(fn: T, ms: number): T {
  let timeoutId: ReturnType<typeof setTimeout>;
  return ((...args: unknown[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), ms);
  }) as T;
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function isValidCollegeEmail(email: string, domain = "@skillbridge.edu"): boolean {
  return email.toLowerCase().endsWith(domain.toLowerCase());
}

export function generateShareToken(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export function calculateAverageRating(ratings: number[]): number {
  if (ratings.length === 0) return 0;
  const sum = ratings.reduce((a, b) => a + b, 0);
  return Math.round((sum / ratings.length) * 10) / 10;
}