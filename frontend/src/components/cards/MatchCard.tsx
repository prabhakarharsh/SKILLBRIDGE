import React from "react";
import { Match, User } from "@/types";
import { Avatar } from "@/components/ui/Avatar";
import { classNames } from "@/utils/helpers";

interface MatchCardProps {
  match: Match;
  provider: User;
  onSelect: () => void;
  isSelected?: boolean;
  showReasonDetail?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export function MatchCard({ match, provider, onSelect, isSelected, showReasonDetail = true, className, style }: MatchCardProps) {
  // Calculate simulated breakdown weights based on match score
  const skillScore = Math.min(50, Math.round((match.score / 100) * 50));
  const availScore = provider.availability === "now" ? 25 : provider.availability === "this-week" ? 20 : 15;
  const ratingScore = Math.min(15, Math.round((provider.rating / 5) * 15));
  const affinityScore = Math.max(5, match.score - skillScore - (availScore - 15) - ratingScore);

  return (
    <div 
      onClick={onSelect}
      style={style}
      className={classNames(
        "bg-white rounded-3xl border-4 border-black p-6 brutal-shadow transition-all cursor-pointer relative overflow-hidden",
        isSelected ? "ring-4 ring-black bg-[#fffdf0] -translate-y-1" : "hover:-translate-y-1 hover:brutal-shadow-lg",
        className
      )}
    >
      {/* Top Banner Ribbon */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-4 border-b-3 border-black">
        <div className="flex items-center gap-3">
          <Avatar name={provider.name} size="lg" verified={provider.isVerified} />
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display font-black text-xl text-black uppercase tracking-tight">{provider.name}</h3>
              {provider.isVerified && (
                <span className="bg-brutal-mint border-2 border-black font-mono font-black text-[10px] uppercase px-2 py-0.5 rounded-md">
                  VERIFIED
                </span>
              )}
            </div>
            <p className="text-xs font-mono font-bold text-black/70">
              {provider.branch} • YEAR {provider.year} • ★ {provider.rating.toFixed(1)}
            </p>
          </div>
        </div>

        {/* Big Radar Power Score */}
        <div className="flex items-center gap-2 bg-brutal-yellow border-3 border-black px-3.5 py-1.5 rounded-2xl brutal-shadow-sm">
          <span className="text-lg">⚡</span>
          <div className="text-right">
            <div className="font-mono font-black text-xl leading-none text-black">{match.score}%</div>
            <div className="text-[9px] font-mono font-black uppercase text-black/70">RADAR MATCH</div>
          </div>
        </div>
      </div>

      {/* Breakdown Power Bars */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4 bg-brutal-purple/20 p-3 rounded-2xl border-2 border-black">
        <div>
          <div className="flex justify-between text-[10px] font-mono font-black uppercase mb-1">
            <span>Skill Match</span>
            <span>{skillScore}/50</span>
          </div>
          <div className="h-2 w-full bg-white rounded-full border border-black overflow-hidden">
            <div className="h-full bg-black rounded-full" style={{ width: `${(skillScore / 50) * 100}%` }}></div>
          </div>
        </div>
        <div>
          <div className="flex justify-between text-[10px] font-mono font-black uppercase mb-1">
            <span>Availability</span>
            <span>{availScore}/25</span>
          </div>
          <div className="h-2 w-full bg-white rounded-full border border-black overflow-hidden">
            <div className="h-full bg-brutal-mint rounded-full" style={{ width: `${(availScore / 25) * 100}%` }}></div>
          </div>
        </div>
        <div>
          <div className="flex justify-between text-[10px] font-mono font-black uppercase mb-1">
            <span>Rating</span>
            <span>{ratingScore}/15</span>
          </div>
          <div className="h-2 w-full bg-white rounded-full border border-black overflow-hidden">
            <div className="h-full bg-brutal-yellow rounded-full" style={{ width: `${(ratingScore / 15) * 100}%` }}></div>
          </div>
        </div>
        <div>
          <div className="flex justify-between text-[10px] font-mono font-black uppercase mb-1">
            <span>Affinity</span>
            <span>{affinityScore}/10</span>
          </div>
          <div className="h-2 w-full bg-white rounded-full border border-black overflow-hidden">
            <div className="h-full bg-brutal-pink rounded-full" style={{ width: `${(affinityScore / 10) * 100}%` }}></div>
          </div>
        </div>
      </div>

      {/* Skills Dock */}
      <div className="mb-4">
        <div className="text-[10px] font-mono font-black uppercase text-black/60 mb-1.5">VERIFIED SKILLS DECK:</div>
        <div className="flex flex-wrap gap-1.5">
          {provider.skills.map((skill, i) => (
            <span key={i} className="bg-white border-2 border-black font-mono font-bold text-xs px-2.5 py-1 rounded-xl brutal-shadow-sm">
              #{skill}
            </span>
          ))}
        </div>
      </div>

      {/* Match Reasons */}
      {showReasonDetail && match.reasons.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {match.reasons.map((reason, i) => (
            <span key={i} className="bg-brutal-blue/30 border-2 border-black font-mono text-xs px-2.5 py-1 rounded-xl flex items-center gap-1.5">
              <span>🎯</span>
              <span className="font-black">{reason.label}:</span>
              <span>{reason.detail}</span>
            </span>
          ))}
        </div>
      )}

      {/* Action CTA */}
      <div className="pt-2">
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onSelect(); }}
          className="brutal-btn w-full bg-brutal-yellow hover:bg-brutal-yellow-dark border-3 border-black font-display font-black text-sm uppercase px-4 py-3 rounded-2xl flex items-center justify-center gap-2"
        >
          <span>ENGAGE SQUAD & OPEN 2-KEY GATE</span>
          <span className="text-base">⚡</span>
        </button>
      </div>
    </div>
  );
}

export function MatchCardSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-3xl border-4 border-black p-6 brutal-shadow animate-pulse space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gray-200 border-3 border-black"></div>
              <div className="space-y-2">
                <div className="h-4 w-32 bg-gray-200 rounded"></div>
                <div className="h-3 w-48 bg-gray-200 rounded"></div>
              </div>
            </div>
            <div className="w-20 h-8 rounded-xl bg-gray-200 border-2 border-black"></div>
          </div>
          <div className="h-10 bg-gray-100 rounded-xl border border-black"></div>
          <div className="h-10 bg-gray-200 rounded-2xl border-3 border-black"></div>
        </div>
      ))}
    </div>
  );
}