"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { ArrowLeft, Plus, Minus, Clock, Award, BookOpen, Users, RotateCcw, ShieldCheck, Coins } from "lucide-react";
import { creditService } from "@/services/creditService";
import { formatRelativeTime, classNames } from "@/utils/helpers";
import { Navbar } from "@/components/layout/Navbar";
import { useNavigate } from "@/utils/navigation";

export function Credits() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [balance, setBalance] = useState(0);
  const [history, setHistory] = useState<Array<any>>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "history" | "rules">("overview");

  useEffect(() => {
    if (user) loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [bal, hist, st] = await Promise.all([
        creditService.getBalance(user.id),
        creditService.getFormattedHistory(user.id),
        creditService.getStats(user.id),
      ]);
      setBalance(bal);
      setHistory(hist);
      setStats(st);
    } catch (e) {
      console.error("Failed to load credits:", e);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#fefce8] pixel-pattern font-headline text-black antialiased flex items-center justify-center">
        <Navbar />
        <div className="bg-white rounded-3xl border-4 border-black p-8 text-center brutal-shadow animate-pulse">
          <div className="font-display font-black text-lg uppercase">ACCESSING ZERO-CASH VAULT...</div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#fefce8] pixel-pattern font-headline text-black antialiased">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-24 pb-16">
        {/* Navigation & Title */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-black text-brutal-yellow flex items-center justify-center font-display font-black text-base">
                05
              </span>
              <h1 className="font-display font-black text-2xl md:text-3xl uppercase tracking-tight text-black">
                Zero-Cash Syndicate Vault
              </h1>
            </div>
            <p className="font-mono text-xs font-bold text-black/70 mt-1">
              Zero real money. Earn SkillCredits by peer teaching & co-building; spend on campus loot & perks.
            </p>
          </div>

          <button
            onClick={() => navigate("/rewards")}
            className="brutal-btn px-4 py-2.5 rounded-2xl bg-brutal-mint border-3 border-black font-display font-black text-xs uppercase flex items-center gap-2"
          >
            <span>GO TO LOOT STORE</span>
            <span className="text-base">🎁</span>
          </button>
        </div>

        {/* Big Bouncy Vault Ledger Card */}
        <div className="bg-brutal-yellow rounded-3xl border-4 border-black p-6 md:p-8 brutal-shadow mb-8 relative overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-black text-brutal-yellow border-2 border-black font-mono font-black text-xs uppercase px-2.5 py-0.5 rounded-lg">
                  LIVE VAULT BALANCE
                </span>
                <span className="font-mono text-xs font-bold text-black/70">
                  SECURED BY MIT SYNDICATE
                </span>
              </div>
              <div className="flex items-baseline gap-3">
                <span className="text-5xl md:text-6xl font-display font-black tracking-tight text-black">
                  {balance}
                </span>
                <span className="font-mono font-black text-xl uppercase text-black">
                  SKILLCREDITS 🪙
                </span>
              </div>
              <p className="font-mono text-xs font-bold text-black/70 mt-2">
                Equivalent to {balance} peer teaching hours or verified co-build sprint deliverables.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <div className="bg-white p-3.5 rounded-2xl border-3 border-black font-mono text-xs font-bold">
                <span className="text-black/60">SMART ESCROW STATUS: </span>
                <span className="text-emerald-700 font-black">ACTIVE & SYNCHRONIZED</span>
              </div>
              <div className="bg-white p-3.5 rounded-2xl border-3 border-black font-mono text-xs font-bold">
                <span className="text-black/60">ACCOUNT HOLDER: </span>
                <span className="text-black font-black uppercase">{user.name}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex gap-2 mb-6 bg-white p-2 rounded-2xl border-3 border-black brutal-shadow-sm max-w-md">
          {[
            { id: "overview", label: "01. Ledger Stats", icon: Coins },
            { id: "history", label: "02. History Log", icon: Clock },
            { id: "rules", label: "03. Vault Rules", icon: ShieldCheck },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={classNames(
                "flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl font-display font-black text-xs uppercase transition-all",
                activeTab === tab.id
                  ? "bg-black text-white"
                  : "text-black hover:bg-black/10"
              )}
            >
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab 1: Overview Stats */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Total Earned */}
            <div className="bg-white rounded-3xl border-4 border-black p-6 brutal-shadow">
              <div className="flex items-center justify-between pb-3 mb-4 border-b-2 border-black">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-brutal-mint border-2 border-black flex items-center justify-center font-bold">
                    +
                  </div>
                  <h3 className="font-display font-black text-lg uppercase text-black">Total Earned</h3>
                </div>
                <div className="font-mono font-black text-2xl text-emerald-700">
                  +{stats?.totalEarned || 0} CR
                </div>
              </div>
              <div className="space-y-3 font-mono text-xs">
                <div className="flex justify-between items-center p-2.5 rounded-xl bg-gray-50 border border-black">
                  <span>Peer Teaching Sessions (30m)</span>
                  <span className="font-black text-black">{stats?.teachSessions || 0} completed</span>
                </div>
                <div className="flex justify-between items-center p-2.5 rounded-xl bg-gray-50 border border-black">
                  <span>Co-Build Projects Minted</span>
                  <span className="font-black text-black">{stats?.projectsCompleted || 0} projects</span>
                </div>
              </div>
            </div>

            {/* Total Spent */}
            <div className="bg-white rounded-3xl border-4 border-black p-6 brutal-shadow">
              <div className="flex items-center justify-between pb-3 mb-4 border-b-2 border-black">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-brutal-pink border-2 border-black flex items-center justify-center font-bold">
                    -
                  </div>
                  <h3 className="font-display font-black text-lg uppercase text-black">Total Spent</h3>
                </div>
                <div className="font-mono font-black text-2xl text-red-600">
                  -{stats?.totalSpent || 0} CR
                </div>
              </div>
              <div className="space-y-3 font-mono text-xs">
                <div className="flex justify-between items-center p-2.5 rounded-xl bg-gray-50 border border-black">
                  <span>Help Quests Requested</span>
                  <span className="font-black text-black">{stats?.helpRequests || 0} requests</span>
                </div>
                <div className="flex justify-between items-center p-2.5 rounded-xl bg-gray-50 border border-black">
                  <span>Campus Perks Redeemed</span>
                  <span className="font-black text-black">{stats?.rewardsRedeemed || 0} perks</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: History Log */}
        {activeTab === "history" && (
          <div className="bg-white rounded-3xl border-4 border-black p-6 md:p-8 brutal-shadow">
            <h3 className="font-display font-black text-xl uppercase tracking-tight text-black mb-4">
              Cryptographic Transaction Ledger
            </h3>
            {history.length === 0 ? (
              <div className="text-center py-8 font-mono text-sm text-black/60">
                No ledger transactions recorded yet.
              </div>
            ) : (
              <div className="space-y-3">
                {history.map((tx: any) => (
                  <div key={tx.id} className="p-3.5 rounded-2xl bg-[#fffdf0] border-2 border-black flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={classNames(
                        "w-9 h-9 rounded-xl border-2 border-black flex items-center justify-center font-mono font-black text-sm",
                        tx.type === "earn" ? "bg-brutal-mint text-black" : "bg-brutal-pink text-black"
                      )}>
                        {tx.type === "earn" ? "+" : "-"}
                      </div>
                      <div>
                        <div className="font-display font-black text-sm uppercase text-black">{tx.description || tx.reason}</div>
                        <div className="font-mono text-[10px] text-black/60 font-bold">{tx.date}</div>
                      </div>
                    </div>
                    <div className={classNames(
                      "font-mono font-black text-sm px-3 py-1 rounded-xl border-2 border-black",
                      tx.type === "earn" ? "bg-brutal-mint" : "bg-brutal-pink"
                    )}>
                      {tx.formattedAmount}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Vault Rules */}
        {activeTab === "rules" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-brutal-mint rounded-3xl border-4 border-black p-6 brutal-shadow">
              <h3 className="font-display font-black text-lg uppercase text-black mb-3">
                ⚡ HOW TO EARN SKILLCREDITS
              </h3>
              <ul className="space-y-2.5 font-mono text-xs text-black/90">
                <li className="flex items-center gap-2 bg-white/80 p-2.5 rounded-xl border border-black">
                  <span>🟢</span>
                  <span><strong>+1 CR:</strong> Teach a 30-minute Fast Fix peer session.</span>
                </li>
                <li className="flex items-center gap-2 bg-white/80 p-2.5 rounded-xl border border-black">
                  <span>🟢</span>
                  <span><strong>+3 CR:</strong> Complete & sign off on a Squad Co-Build project.</span>
                </li>
                <li className="flex items-center gap-2 bg-white/80 p-2.5 rounded-xl border border-black">
                  <span>🟢</span>
                  <span><strong>+5 CR:</strong> Dean's honor roll peer mentorship bonus.</span>
                </li>
              </ul>
            </div>

            <div className="bg-brutal-purple/30 rounded-3xl border-4 border-black p-6 brutal-shadow">
              <h3 className="font-display font-black text-lg uppercase text-black mb-3">
                🎁 HOW TO SPEND SKILLCREDITS
              </h3>
              <ul className="space-y-2.5 font-mono text-xs text-black/90">
                <li className="flex items-center gap-2 bg-white/80 p-2.5 rounded-xl border border-black">
                  <span>🔴</span>
                  <span><strong>-1 CR:</strong> Post a fast-fix quest (held in zero-cash escrow).</span>
                </li>
                <li className="flex items-center gap-2 bg-white/80 p-2.5 rounded-xl border border-black">
                  <span>🔴</span>
                  <span><strong>-5 CR:</strong> Redeem campus canteen lunch vouchers.</span>
                </li>
                <li className="flex items-center gap-2 bg-white/80 p-2.5 rounded-xl border border-black">
                  <span>🔴</span>
                  <span><strong>-10 CR:</strong> Unlock verified faculty recommendation letter pass.</span>
                </li>
              </ul>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}