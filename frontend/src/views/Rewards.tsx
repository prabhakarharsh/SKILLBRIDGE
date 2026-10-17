"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import { ArrowLeft, Gift, CheckCircle2, Lock, AlertCircle, Loader2, Sparkles } from "lucide-react";
import { creditService } from "@/services/creditService";
import { storage, generateId, nowISO } from "@/utils/storage";
import { REWARDS } from "@/utils/constants";
import type { Reward } from "@/types";
import { Navbar } from "@/components/layout/Navbar";
import { useNavigate } from "@/utils/navigation";

export function Rewards() {
  const { user, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [balance, setBalance] = useState(0);
  const [rewards, setRewards] = useState<Reward[]>([...REWARDS] as unknown as Reward[]);
  const [redemptions, setRedemptions] = useState<Array<any>>([]);
  const [loading, setLoading] = useState(true);
  const [redeemingId, setRedeemingId] = useState<string | null>(null);

  useEffect(() => {
    if (user) loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const bal = await creditService.getBalance(user.id);
      setBalance(bal);

      // Load redemptions from localStorage
      const redemptionsData = (storage.get("skillbridge_redemptions", []) as any[]).filter((r: any) => r.userId === user.id);
      setRedemptions(redemptionsData.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (e) {
      console.error("Failed to load rewards:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleRedeem = async (reward: Reward) => {
    if (!user) return;
    if (balance < reward.cost) {
      showToast(`Need ${reward.cost} SkillCredits (Current balance: ${balance})`, "error");
      return;
    }

    setRedeemingId(reward.id);
    try {
      await creditService.processRedeemReward(user.id, reward.id, reward.cost);
      
      // Record redemption with mock coupon voucher
      const voucherCode = `VOUCH-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      const redemption = {
        id: generateId("redemption"),
        userId: user.id,
        rewardId: reward.id,
        rewardName: reward.name,
        cost: reward.cost,
        voucherCode,
        createdAt: nowISO(),
      };
      const currentRedemptions = (storage.get("skillbridge_redemptions", []) as any[]);
      storage.set("skillbridge_redemptions", [...currentRedemptions, redemption]);

      showToast(`Redeemed ${reward.name}! Voucher code: ${voucherCode}`);
      loadData();
    } catch (e) {
      showToast("Redemption failed", "error");
    } finally {
      setRedeemingId(null);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#fefce8] pixel-pattern font-headline text-black antialiased flex items-center justify-center">
        <Navbar />
        <div className="bg-white rounded-3xl border-4 border-black p-8 text-center brutal-shadow animate-pulse">
          <div className="font-display font-black text-lg uppercase">OPENING CAMPUS LOOT STORE...</div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const rewardIcons: Record<string, string> = {
    food: "🍔",
    academic: "📜",
    event: "🎪",
    priority: "🔑",
  };

  return (
    <div className="min-h-screen bg-[#fefce8] pixel-pattern font-headline text-black antialiased">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-24 pb-16">
        {/* Header Bento */}
        <div className="bg-white rounded-3xl border-4 border-black p-6 md:p-8 brutal-shadow mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-8 h-8 rounded-xl bg-black text-brutal-yellow flex items-center justify-center font-display font-black text-base">
                  05
                </span>
                <span className="px-3 py-1 rounded-xl bg-brutal-pink border-2 border-black font-mono font-black text-xs uppercase">
                  ZERO-CASH CAMPUS PERKS
                </span>
              </div>
              <h1 className="font-display font-black text-2xl md:text-3xl uppercase tracking-tight text-black mb-1">
                Campus Syndicate Loot Store
              </h1>
              <p className="font-mono text-xs font-bold text-black/70">
                Redeem verified SkillCredits for campus meals, faculty letters, lab access & event passes.
              </p>
            </div>

            {/* Live Coin Balance Pill */}
            <div className="flex items-center gap-3 bg-brutal-yellow border-3 border-black px-5 py-3 rounded-2xl brutal-shadow">
              <span className="text-2xl animate-bounce">🪙</span>
              <div>
                <div className="text-[10px] font-mono font-black uppercase text-black/70">AVAILABLE CREDITS</div>
                <div className="font-display font-black text-2xl leading-none text-black">{balance} CR</div>
              </div>
            </div>
          </div>
        </div>

        {/* Loot Grid */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            <Gift className="w-5 h-5 text-black" />
            <h2 className="font-display font-black text-xl uppercase tracking-tight text-black">
              Available Syndicate Perks
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rewards.map(reward => {
              const canAfford = balance >= reward.cost;
              return (
                <div 
                  key={reward.id}
                  className="bg-white rounded-3xl border-4 border-black p-6 brutal-shadow flex flex-col justify-between hover:-translate-y-1 transition-all"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="w-14 h-14 rounded-2xl bg-brutal-yellow border-3 border-black flex items-center justify-center text-3xl brutal-shadow-sm">
                        {rewardIcons[reward.category] || "🎁"}
                      </div>
                      <div className="bg-black text-brutal-yellow border-2 border-black font-mono font-black text-sm px-3 py-1 rounded-xl">
                        {reward.cost} CR
                      </div>
                    </div>

                    <h3 className="font-display font-black text-lg uppercase text-black mb-1">
                      {reward.name}
                    </h3>
                    <p className="font-mono text-xs text-black/70 font-medium mb-4">
                      {reward.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t-2 border-black">
                    <button
                      type="button"
                      disabled={!canAfford || redeemingId === reward.id}
                      onClick={() => handleRedeem(reward)}
                      className={`brutal-btn w-full font-display font-black text-xs uppercase py-3 rounded-2xl border-3 border-black flex items-center justify-center gap-1.5 transition-all ${
                        canAfford 
                          ? "bg-brutal-yellow hover:bg-brutal-yellow-dark text-black" 
                          : "bg-gray-200 text-gray-500 cursor-not-allowed opacity-75"
                      }`}
                    >
                      {redeemingId === reward.id ? (
                        <span>MINTING VOUCHER...</span>
                      ) : canAfford ? (
                        <>
                          <span>REDEEM PERK</span>
                          <Sparkles className="w-3.5 h-3.5" />
                        </>
                      ) : (
                        <>
                          <Lock className="w-3.5 h-3.5" />
                          <span>NEED {reward.cost - balance} MORE CR</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* My Redemptions Table */}
        <div className="bg-white rounded-3xl border-4 border-black p-6 md:p-8 brutal-shadow">
          <div className="flex items-center gap-2 mb-4">
            <Gift className="w-5 h-5 text-black" />
            <h3 className="font-display font-black text-xl uppercase tracking-tight text-black">
              Claimed Vouchers & Redemptions
            </h3>
          </div>

          {redemptions.length === 0 ? (
            <div className="text-center py-8 font-mono text-sm text-black/60">
              No loot claimed yet. Help campus peers to earn credits and claim campus perks!
            </div>
          ) : (
            <div className="space-y-3">
              {redemptions.map((redemption: any) => (
                <div 
                  key={redemption.id}
                  className="p-4 rounded-2xl bg-[#fffdf0] border-2 border-black flex flex-wrap items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-brutal-mint border-2 border-black flex items-center justify-center text-lg">
                      🎟️
                    </div>
                    <div>
                      <div className="font-display font-black text-sm uppercase text-black">
                        {redemption.rewardName}
                      </div>
                      <div className="font-mono text-xs text-black/60 font-bold">
                        VOUCHER: <span className="text-black bg-brutal-yellow px-1.5 py-0.5 rounded border border-black">{redemption.voucherCode || "ACTIVE"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-xs text-black/60">
                      {new Date(redemption.createdAt).toLocaleDateString()}
                    </span>
                    <span className="bg-black text-brutal-yellow border-2 border-black font-mono font-black text-xs px-2.5 py-1 rounded-xl">
                      -{redemption.cost} CR
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}