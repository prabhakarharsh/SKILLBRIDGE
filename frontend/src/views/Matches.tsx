"use client";

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "@/utils/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import { MatchCard, MatchCardSkeleton } from "@/components/cards/MatchCard";
import { ArrowLeft, Filter, Users, Target, CheckCircle2, Sparkles, ShieldCheck } from "lucide-react";
import { matchService } from "@/services/matchService";
import { needService } from "@/services/needService";
import { userService } from "@/services/userService";
import { Navbar } from "@/components/layout/Navbar";
import type { Need } from "@/types";

export function Matches() {
  const { needId } = useParams<{ needId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [need, setNeed] = useState<Need | null>(null);
  const [matches, setMatches] = useState<Array<{ match: any; provider: any }>>([]);
  const [loading, setLoading] = useState(true);
  const [findingMatches, setFindingMatches] = useState(false);
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);

  useEffect(() => {
    if (needId) {
      loadData();
    }
  }, [needId]);

  const loadData = async () => {
    if (!needId || !user) return;
    setLoading(true);
    try {
      const [needData, matchData] = await Promise.all([
        needService.getNeed(needId),
        matchService.getMatchesForNeed(needId),
      ]);
      setNeed(needData);
      
      // Get provider details for each match
      const matchesWithProviders = await Promise.all(
        matchData.map(async m => {
          const provider = await userService.getUser(m.providerId);
          return { match: m, provider };
        })
      );
      
      // Sort by score descending
      matchesWithProviders.sort((a, b) => b.match.score - a.match.score);
      setMatches(matchesWithProviders);
    } catch (e) {
      console.error("Failed to load matches:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleFindMatches = async () => {
    if (!needId) return;
    setFindingMatches(true);
    try {
      const newMatches = await matchService.findMatches(needId);
      showToast(`Radar locked on ${newMatches.length} verified peers!`);
      loadData();
    } catch (e) {
      showToast("Radar scanning failed", "error");
    } finally {
      setFindingMatches(false);
    }
  };

  const handleSelectMatch = (matchId: string) => {
    setSelectedMatchId(matchId);
    navigate(`/room/${matchId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fefce8] pixel-pattern font-headline text-black antialiased">
        <Navbar />
        <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
          <div className="mb-6 bg-white rounded-3xl border-4 border-black p-6 brutal-shadow animate-pulse">
            <div className="h-6 w-48 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 w-96 bg-gray-200 rounded"></div>
          </div>
          <MatchCardSkeleton count={3} />
        </main>
      </div>
    );
  }

  if (!need) {
    return (
      <div className="min-h-screen bg-[#fefce8] pixel-pattern font-headline text-black antialiased flex items-center justify-center p-4">
        <Navbar />
        <div className="max-w-md w-full bg-white rounded-3xl border-4 border-black p-8 text-center brutal-shadow">
          <div className="w-16 h-16 rounded-2xl bg-brutal-pink border-3 border-black mx-auto mb-4 flex items-center justify-center text-3xl">
            ⚠️
          </div>
          <h2 className="font-display font-black text-2xl uppercase tracking-tight text-black mb-2">Quest Not Found</h2>
          <p className="font-mono text-sm text-black/70 mb-6">This quest blueprint may have been archived or removed from the syndicate radar.</p>
          <button
            onClick={() => navigate("/dashboard")}
            className="brutal-btn w-full px-5 py-3 rounded-2xl bg-brutal-yellow border-3 border-black font-display font-black text-sm uppercase"
          >
            Return to Terminal
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fefce8] pixel-pattern font-headline text-black antialiased">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        {/* Back Link */}
        <button 
          onClick={() => navigate("/dashboard")} 
          className="mb-6 inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border-2 border-black font-mono font-bold text-xs uppercase brutal-shadow-sm hover:-translate-y-0.5 transition-transform"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit Radar to Terminal</span>
        </button>

        {/* Quest Blueprint Banner (Bento Header) */}
        <div className="bg-white rounded-3xl border-4 border-black p-6 md:p-8 brutal-shadow mb-8 relative overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-xl bg-brutal-yellow border-2 border-black font-mono font-black text-xs uppercase">
                {need.mode === "learn" ? "⚡ FAST FIX (30M)" : "🛡️ SQUAD CO-BUILD"}
              </span>
              <span className="px-3 py-1 rounded-xl bg-brutal-mint border-2 border-black font-mono font-black text-xs uppercase flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping"></span>
                <span>STATUS: {need.status.toUpperCase()}</span>
              </span>
            </div>
            <div className="font-mono font-black text-xs uppercase text-black/60 bg-black/5 px-3 py-1 rounded-xl border border-black/20">
              QUEST ID: #{need.id.slice(0, 8)}
            </div>
          </div>

          <h1 className="font-display font-black text-2xl md:text-3xl text-black uppercase tracking-tight mb-2">
            {need.title}
          </h1>
          <p className="font-headline text-base text-black/80 mb-4 max-w-3xl">
            {need.description}
          </p>

          <div className="flex flex-wrap items-center gap-2 pt-2 border-t-2 border-black/10">
            <span className="text-xs font-mono font-black uppercase text-black/60 mr-2">Target Skills:</span>
            {need.requiredSkills.map((skill, i) => (
              <span key={i} className="bg-brutal-purple/30 border-2 border-black font-mono font-bold text-xs px-2.5 py-1 rounded-xl">
                #{skill}
              </span>
            ))}
          </div>
        </div>

        {/* Radar Match Headings & Scan CTA */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-black text-brutal-yellow flex items-center justify-center font-display font-black text-base">
                02
              </span>
              <h2 className="font-display font-black text-xl md:text-2xl uppercase tracking-tight text-black">
                Radar Match Results ({matches.length})
              </h2>
            </div>
            <p className="text-xs font-mono font-bold text-black/60 mt-1">
              Ranked by verified skills, instant availability, academic rating & campus proximity
            </p>
          </div>

          {need.status === "open" && (
            <button
              onClick={handleFindMatches}
              disabled={findingMatches}
              className="brutal-btn px-4 py-2.5 rounded-xl bg-brutal-blue border-3 border-black font-display font-black text-xs uppercase flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              <span>{findingMatches ? "SCANNING RADAR..." : "REFRESH RADAR"}</span>
            </button>
          )}
        </div>

        {/* Matches Stream or Empty State */}
        {matches.length === 0 ? (
          <div className="bg-white rounded-3xl border-4 border-black p-8 text-center brutal-shadow">
            <div className="w-16 h-16 rounded-2xl bg-brutal-yellow border-3 border-black mx-auto mb-4 flex items-center justify-center text-3xl">
              📡
            </div>
            <h3 className="font-display font-black text-xl uppercase tracking-tight text-black mb-2">No Active Peer Signals</h3>
            <p className="font-mono text-sm text-black/70 max-w-md mx-auto mb-6">
              Our campus syndicate radar is currently searching for students matching these exact parameters.
            </p>
            <button
              onClick={handleFindMatches}
              disabled={findingMatches}
              className="brutal-btn px-6 py-3 rounded-2xl bg-brutal-yellow border-3 border-black font-display font-black text-sm uppercase inline-flex items-center gap-2"
            >
              <span>{findingMatches ? "SCANNING FREQUENCIES..." : "FORCE SCAN NOW ⚡"}</span>
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {matches.map(({ match, provider }, index) => (
              <MatchCard
                key={match.id}
                match={match}
                provider={provider}
                onSelect={() => handleSelectMatch(match.id)}
                isSelected={selectedMatchId === match.id}
                showReasonDetail={true}
              />
            ))}
          </div>
        )}

        {/* Protocol Bento Info Card */}
        <div className="mt-12 bg-brutal-mint rounded-3xl border-4 border-black p-6 md:p-8 brutal-shadow">
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheck className="w-6 h-6 text-black" />
            <h3 className="font-display font-black text-lg uppercase tracking-tight text-black">
              Zero-Cash Syndicate Security Protocol
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
            <div className="bg-white/80 p-3.5 rounded-2xl border-2 border-black">
              <div className="font-black text-black mb-1">01. 2-KEY GATE</div>
              <p className="text-black/80">No collaboration begins until both peers physically turn their cryptographic keys in the live room.</p>
            </div>
            <div className="bg-white/80 p-3.5 rounded-2xl border-2 border-black">
              <div className="font-black text-black mb-1">02. TIME-LOCKED ESCROW</div>
              <p className="text-black/80">SkillCredits remain locked in zero-cash escrow until deliverables pass peer sign-off.</p>
            </div>
            <div className="bg-white/80 p-3.5 rounded-2xl border-2 border-black">
              <div className="font-black text-black mb-1">03. MINTED CREDENTIAL</div>
              <p className="text-black/80">Completion mints a verifiable campus project card stamped with cryptographic proof.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}