"use client";

import { useState, useEffect } from "react";
import { Link, useNavigate } from "@/utils/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge, SkillTag } from "@/components/ui/Badge";
import { Target, Users, CreditCard, Clock, BookOpen, Plus, ArrowRight, CheckCircle2, ExternalLink } from "lucide-react";
import { creditService } from "@/services/creditService";
import { consentService } from "@/services/consentService";
import { needService } from "@/services/needService";
import { projectService } from "@/services/projectService";
import { formatRelativeTime } from "@/utils/helpers";
import { Navbar } from "@/components/layout/Navbar";
import type { Need, Collaboration, ProjectCard } from "@/types";

export function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [credits, setCredits] = useState(0);
  const [activeCollabs, setActiveCollabs] = useState<Collaboration[]>([]);
  const [myNeeds, setMyNeeds] = useState<Need[]>([]);
  const [recentProjects, setRecentProjects] = useState<ProjectCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [balance, collabs, needs, projects] = await Promise.all([
        creditService.getBalance(user.id),
        consentService.getActiveCollaborations(user.id),
        needService.getUserNeeds(user.id),
        projectService.getUserProjectCards(user.id),
      ]);
      setCredits(balance);
      setActiveCollabs(collabs);
      setMyNeeds(needs);
      setRecentProjects(projects.slice(0, 3));
    } catch (e) {
      console.error("Failed to load dashboard:", e);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#fefce8] pixel-pattern flex items-center justify-center">
        <div className="w-12 h-12 rounded-2xl bg-black text-brutal-yellow flex items-center justify-center font-display font-black text-2xl animate-bounce border-3 border-black brutal-shadow">
          ⚡
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#fefce8] pixel-pattern font-headline text-black antialiased selection:bg-black selection:text-brutal-yellow">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8 flex flex-col gap-8">
        {/* Top Hero Bento Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 bg-brutal-yellow rounded-3xl border-4 border-black p-6 md:p-8 brutal-shadow relative overflow-hidden flex flex-col justify-between gap-6">
            <div className="flex flex-col gap-2 relative z-10">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-xl bg-black text-brutal-yellow font-display font-black text-xs uppercase tracking-wider brutal-shadow-sm">
                  Player Terminal
                </span>
                <span className="bg-white border-2 border-black px-2.5 py-0.5 rounded-full text-xs font-mono font-bold">
                  CAMPUS SYNDICATE
                </span>
              </div>
              <h1 className="font-display font-black text-3xl sm:text-5xl text-black uppercase tracking-tight leading-none mt-2">
                Welcome back, {user.name.split(" ")[0]}! 👋
              </h1>
              <p className="font-headline font-semibold text-black/80 text-sm sm:text-base max-w-xl">
                Ready to level up your academic karma? Summon peer mentors or squad up for hackathon raids with zero cash.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-3 pt-2 relative z-10">
              <Link to="/post-need?mode=learn">
                <button className="brutal-btn px-5 py-3 rounded-2xl bg-black text-brutal-yellow font-display font-black text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2 hover:bg-brutal-electric hover:text-white border-3 border-black">
                  <span>⚡ Post Quick Quest (30 Min)</span>
                </button>
              </Link>
              <Link to="/post-need?mode=buddy">
                <button className="brutal-btn px-5 py-3 rounded-2xl bg-white text-black font-display font-black text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2 hover:bg-brutal-purple border-3 border-black">
                  <span>🤝 Squad Co-Build Raid</span>
                </button>
              </Link>
            </div>
          </div>

          {/* Right Vault Card */}
          <div className="lg:col-span-4 bg-brutal-purple rounded-3xl border-4 border-black p-6 brutal-shadow flex flex-col justify-between gap-4">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-xl bg-black text-white font-display font-black text-xs uppercase">
                  Safe-Deposit Vault
                </span>
                <span className="text-2xl animate-bounce">🪙</span>
              </div>
              <span className="font-display font-black text-2xl text-black uppercase tracking-tight">
                Zero-Cash Ledger
              </span>

              <div className="p-4 rounded-2xl bg-white border-3 border-black brutal-shadow-sm flex flex-col gap-2 font-mono text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-black/70">Current Vault:</span>
                  <span className="font-black text-base text-black font-mono">
                    {credits} CR
                  </span>
                </div>
                <div className="flex items-center justify-between text-emerald-600 font-bold">
                  <span>Peer Mentorship:</span>
                  <span>+1 CR per 30m</span>
                </div>
                <div className="flex items-center justify-between text-emerald-600 font-bold">
                  <span>Complete Raid:</span>
                  <span>+3 CR Minted</span>
                </div>
              </div>
            </div>

            <Link to="/rewards">
              <button className="w-full brutal-btn py-2.5 rounded-xl bg-brutal-yellow border-2 border-black font-display font-black text-xs uppercase flex items-center justify-center gap-2">
                <span>Spend in Loot Store</span>
                <span>🛍️</span>
              </button>
            </Link>
          </div>
        </div>

        {/* Quest Mode Bento Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Mode 1: Fast Fix */}
          <Link to="/post-need?mode=learn">
            <div className="bg-white rounded-3xl border-4 border-black p-6 md:p-8 brutal-shadow flex flex-col justify-between gap-6 hover:-translate-y-1 transition-transform group">
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="w-14 h-14 rounded-2xl bg-brutal-yellow border-3 border-black flex items-center justify-center text-3xl brutal-shadow-sm group-hover:scale-105 transition-transform">
                    ⚡
                  </div>
                  <span className="px-3 py-1 rounded-xl bg-black text-brutal-yellow font-display font-black text-xs uppercase">
                    Learn Mode
                  </span>
                </div>
                <div>
                  <h3 className="font-display font-black text-2xl text-black uppercase tracking-tight mb-1">
                    30-Min Fast Fix
                  </h3>
                  <p className="font-headline font-semibold text-xs sm:text-sm text-black/70">
                    Get unstuck immediately with verified campus wizards. CSS layouts, SQL bugs, or code sanity checks.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 text-xs font-mono font-bold">
                  <span className="px-2.5 py-1 rounded-lg bg-brutal-mint border border-black">⏱️ 30m Micro-Block</span>
                  <span className="px-2.5 py-1 rounded-lg bg-brutal-blue border border-black">🎯 1 CR Stake</span>
                  <span className="px-2.5 py-1 rounded-lg bg-brutal-purple border border-black">🧙 Mentors Earn +1 CR</span>
                </div>
              </div>

              <button className="brutal-btn w-full py-3.5 rounded-2xl bg-black text-brutal-yellow font-display font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 group-hover:bg-brutal-electric group-hover:text-white border-3 border-black">
                <span>POST A FAST FIX QUEST</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </Link>

          {/* Mode 2: Squad Co-Build */}
          <Link to="/post-need?mode=buddy">
            <div className="bg-white rounded-3xl border-4 border-black p-6 md:p-8 brutal-shadow flex flex-col justify-between gap-6 hover:-translate-y-1 transition-transform group">
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="w-14 h-14 rounded-2xl bg-brutal-purple border-3 border-black flex items-center justify-center text-3xl brutal-shadow-sm group-hover:scale-105 transition-transform">
                    🤝
                  </div>
                  <span className="px-3 py-1 rounded-xl bg-black text-brutal-purple font-display font-black text-xs uppercase">
                    Buddy Mode
                  </span>
                </div>
                <div>
                  <h3 className="font-display font-black text-2xl text-black uppercase tracking-tight mb-1">
                    Squad Co-Build Raid
                  </h3>
                  <p className="font-headline font-semibold text-xs sm:text-sm text-black/70">
                    Multi-day project sprint or hackathon co-pilot. Formalize roles, deliverables, and mint permanent credentials.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 text-xs font-mono font-bold">
                  <span className="px-2.5 py-1 rounded-lg bg-brutal-pink border border-black">🎮 Deep Co-Build</span>
                  <span className="px-2.5 py-1 rounded-lg bg-brutal-yellow border border-black">📜 Smart Agreement</span>
                  <span className="px-2.5 py-1 rounded-lg bg-brutal-mint border border-black">🏆 Complete = +3 CR</span>
                </div>
              </div>

              <button className="brutal-btn w-full py-3.5 rounded-2xl bg-black text-brutal-purple font-display font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 group-hover:bg-brutal-electric group-hover:text-white border-3 border-black">
                <span>RECRUIT SQUAD CO-BUILDER</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </Link>
        </div>

        {/* Active Collaborations Section */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-brutal-mint border-2 border-black flex items-center justify-center font-display font-black text-xs">
                📡
              </span>
              <h2 className="font-display font-black text-2xl text-black uppercase tracking-tight">
                Active Quests &amp; Consent Gates
              </h2>
            </div>
            {activeCollabs.length > 0 && (
              <span className="font-mono text-xs font-bold bg-black text-white px-3 py-1 rounded-xl">
                {activeCollabs.length} LIVE
              </span>
            )}
          </div>

          {loading ? (
            <div className="p-8 text-center font-mono font-bold text-xs bg-white rounded-3xl border-4 border-black brutal-shadow animate-pulse">
              SCANNING CAMPUS LEDGER...
            </div>
          ) : activeCollabs.length === 0 ? (
            <div className="bg-white rounded-3xl border-4 border-black p-8 text-center brutal-shadow flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gray-100 border-3 border-black flex items-center justify-center text-3xl">
                🔒
              </div>
              <div>
                <h3 className="font-display font-black text-lg text-black uppercase">
                  No Active Quests In Progress
                </h3>
                <p className="font-headline font-semibold text-xs text-black/60 max-w-sm mx-auto mt-1">
                  Launch a quest or accept a match on the radar to enter the 2-key anti-ghosting gate.
                </p>
              </div>
              <Link to="/post-need">
                <button className="brutal-btn px-6 py-2.5 rounded-xl bg-brutal-yellow border-2 border-black font-display font-black text-xs uppercase flex items-center gap-2">
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>Launch First Quest</span>
                </button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeCollabs.map((collab) => (
                <div
                  key={collab.id}
                  className="bg-white rounded-3xl border-4 border-black p-5 brutal-shadow flex flex-col justify-between gap-4"
                >
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-lg bg-brutal-mint border border-black font-display font-black text-[11px] uppercase">
                        {collab.status === "pending-consent" ? "Awaiting Consent" : "Active Session"}
                      </span>
                      <span className="font-mono text-xs text-black/60">
                        {formatRelativeTime(collab.createdAt)}
                      </span>
                    </div>
                    <span className="font-display font-black text-base text-black uppercase truncate">
                      Quest #{collab.id.slice(0, 8)}
                    </span>
                    <span className="font-mono text-xs text-black/70">
                      👥 {collab.participants.length} Collaborators bound
                    </span>
                  </div>

                  <Link to={`/room/${collab.matchId}`}>
                    <button className="brutal-btn w-full py-2.5 rounded-xl bg-black text-brutal-yellow font-display font-black text-xs uppercase flex items-center justify-center gap-1.5">
                      <span>Enter 2-Key Room</span>
                      <span>🔑</span>
                    </button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* My Needs Stream */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-brutal-pink border-2 border-black flex items-center justify-center font-display font-black text-xs">
                📋
              </span>
              <h2 className="font-display font-black text-2xl text-black uppercase tracking-tight">
                My Posted Blueprints
              </h2>
            </div>
            <Link to="/post-need">
              <button className="brutal-btn px-4 py-2 rounded-xl bg-white border-2 border-black font-display font-black text-xs uppercase hover:bg-brutal-yellow">
                + New Blueprint
              </button>
            </Link>
          </div>

          {myNeeds.length === 0 ? (
            <div className="bg-white rounded-3xl border-4 border-black p-6 text-center brutal-shadow font-headline font-semibold text-xs text-black/60">
              You haven&apos;t posted any blueprints yet. Click &quot;+ New Blueprint&quot; above to begin!
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {myNeeds.slice(0, 5).map((need) => (
                <div
                  key={need.id}
                  className="bg-white rounded-2xl border-3 border-black p-4 brutal-shadow flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex flex-col gap-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-display font-black text-sm text-black uppercase truncate">
                        {need.title}
                      </span>
                      <span className="px-2 py-0.5 rounded-lg bg-brutal-yellow border border-black font-mono text-[10px] font-black uppercase">
                        {need.mode.toUpperCase()}
                      </span>
                      <span className="px-2 py-0.5 rounded-lg bg-gray-100 border border-black font-mono text-[10px] font-bold uppercase">
                        {need.status}
                      </span>
                    </div>
                    <p className="text-xs font-headline font-medium text-black/70 truncate max-w-2xl">
                      {need.description}
                    </p>
                    <div className="flex flex-wrap gap-1 pt-1">
                      {need.requiredSkills.slice(0, 4).map((skill, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-md bg-gray-100 border border-black text-[10px] font-mono font-bold">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <Link to={`/matches/${need.id}`} className="self-start sm:self-center">
                    <button className="brutal-btn px-4 py-2 rounded-xl bg-black text-brutal-yellow font-display font-black text-xs uppercase flex items-center gap-1.5 whitespace-nowrap">
                      <span>Radar Matches</span>
                      <span>🚀</span>
                    </button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Recent Verified Project Proofs */}
        {recentProjects.length > 0 && (
          <section className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-brutal-yellow border-2 border-black flex items-center justify-center font-display font-black text-xs">
                  🎓
                </span>
                <h2 className="font-display font-black text-2xl text-black uppercase tracking-tight">
                  Minted Project Credentials
                </h2>
              </div>
              <Link to="/credits">
                <button className="brutal-btn px-4 py-2 rounded-xl bg-white border-2 border-black font-display font-black text-xs uppercase hover:bg-brutal-mint">
                  View All Proofs
                </button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recentProjects.map((project) => (
                <Link key={project.id} to={`/project-card/${project.id}`}>
                  <div className="bg-white rounded-3xl border-4 border-black p-5 brutal-shadow hover:-translate-y-1 transition-transform flex flex-col justify-between gap-4">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded-lg bg-brutal-mint border border-black font-mono text-[10px] font-bold uppercase">
                          SEALED PROOF
                        </span>
                        <span className="font-mono text-xs text-black/60">
                          {formatRelativeTime(project.endDate)}
                        </span>
                      </div>
                      <h4 className="font-display font-black text-base text-black uppercase truncate">
                        {project.title}
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {project.skillsUsed.slice(0, 3).map((s, i) => (
                          <span key={i} className="px-2 py-0.5 rounded-md bg-brutal-yellow border border-black text-[10px] font-display font-black">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="pt-2 border-t-2 border-black/10 flex items-center justify-between text-xs font-mono font-bold">
                      <span>👥 {project.participants.length} contributors</span>
                      <span className="text-emerald-600 font-black">+3 CR</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}