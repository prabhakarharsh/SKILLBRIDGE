"use client";

import { Link } from "@/utils/navigation";
import { ArrowRight, CheckCircle2, Users, Shield, Clock, Target, Sparkles, Key, Award, Flame } from "lucide-react";

const steps = [
  {
    number: "01",
    title: "Post Quest",
    desc: "Stake 1 SkillCredit for a 30-min fast fix or deep squad co-build.",
    icon: Target,
    color: "bg-brutal-yellow",
    badge: "MICRO-ESCROW",
  },
  {
    number: "02",
    title: "Radar Match",
    desc: "Smart algorithm scans campus peers with weighted multi-factor scores.",
    icon: Users,
    color: "bg-brutal-blue",
    badge: "94% TOP ALIGNMENT",
  },
  {
    number: "03",
    title: "2-Key Consent",
    desc: "Anti-ghosting dual physical keys. Both turn 'Go Ahead' to unlock sandbox.",
    icon: Key,
    color: "bg-brutal-purple",
    badge: "ZERO GHOSTING",
  },
  {
    number: "04",
    title: "Pair & Sign-Off",
    desc: "Live WebRTC terminal pairing with synchronized deliverable checklist.",
    icon: Clock,
    color: "bg-brutal-pink",
    badge: "PEER REVIEWED",
  },
  {
    number: "05",
    title: "Mint Proof & Loot",
    desc: "Collect cryptographically sealed project cards + earn +3 SkillCredits.",
    icon: Award,
    color: "bg-brutal-mint",
    badge: "+3 CR DEPOSITED",
  },
];

const features = [
  {
    icon: Shield,
    title: "Verified Campus Only",
    desc: "Authenticated college emails ensure trusted, dean-approved academic peers.",
    color: "bg-brutal-yellow",
    sticker: "100% VERIFIED",
  },
  {
    icon: Key,
    title: "Anti-Ghosting 2-Key Gate",
    desc: "No flake sessions. Both peers must synchronously arm mutual consent.",
    color: "bg-brutal-purple",
    sticker: "ZERO NO-SHOWS",
  },
  {
    icon: Award,
    title: "Minted Proof of Work",
    desc: "Shareable, downloadable Verified Project Cards with hashes for portfolios.",
    color: "bg-brutal-mint",
    sticker: "PORTFOLIO READY",
  },
  {
    icon: Sparkles,
    title: "Zero-Cash Karma Vault",
    desc: "Operates purely on academic karma and SkillCredits. No fiat currency.",
    color: "bg-brutal-pink",
    sticker: "NO FIAT CASH",
  },
];

export function Landing() {
  return (
    <div className="min-h-screen bg-[#fefce8] pixel-pattern font-headline text-black antialiased selection:bg-black selection:text-brutal-yellow">
      {/* Top Arcade Announcement Banner */}
      <div className="bg-brutal-yellow border-b-4 border-black px-4 py-2 text-center">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 font-display font-black text-xs uppercase tracking-wider">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border border-black animate-ping" />
          <span>CAMPUS PEER ARCADE ACTIVE • ZERO CASH • 100% PROOF OF WORK</span>
          <span className="hidden sm:inline bg-black text-brutal-yellow px-2 py-0.5 rounded border border-black text-[10px] font-mono ml-2">
            MIT PROTOCOL
          </span>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 md:py-24 px-4 md:px-8">
        <div className="max-w-5xl mx-auto text-center flex flex-col items-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-2xl bg-black text-brutal-yellow border-3 border-black brutal-shadow font-display font-black text-xs uppercase tracking-wider mb-6 animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>CAMPUS SYNDICATE PROTOCOL</span>
            <span className="text-white">⚡</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-display font-black text-black uppercase tracking-tight leading-none mb-6 animate-slide-in-top">
            SkillBridge <span className="bg-brutal-yellow px-3 py-0.5 rounded-2xl border-3 border-black brutal-shadow inline-block sticker-rotate-left">Arcade</span>
          </h1>

          {/* Value Prop */}
          <p className="text-base sm:text-xl md:text-2xl font-headline font-bold text-black/80 max-w-2xl mx-auto mb-10 leading-relaxed animate-slide-in-top" style={{ animationDelay: "100ms" }}>
            Verified campus peers. Zero ghosting. Micro-escrow karma economy with cryptographically minted proof of work.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14 w-full sm:w-auto animate-slide-in-top" style={{ animationDelay: "200ms" }}>
            <Link to="/auth?mode=signup" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-black text-brutal-yellow font-display font-black text-base uppercase tracking-wider brutal-btn flex items-center justify-center gap-2 hover:bg-brutal-electric hover:text-white border-3 border-black">
                <span>Spawn Player Account</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </Link>
            <Link to="/auth?mode=login" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white text-black font-display font-black text-base uppercase tracking-wider brutal-btn flex items-center justify-center gap-2 hover:bg-brutal-yellow border-3 border-black">
                <span>Sign In 🔑</span>
              </button>
            </Link>
          </div>

          {/* Trust Stickers */}
          <div className="flex flex-wrap items-center justify-center gap-3 font-mono text-xs font-black uppercase">
            <span className="px-3 py-1.5 rounded-xl bg-brutal-mint border-2 border-black brutal-shadow-sm flex items-center gap-1.5">
              <span>🛡️</span> College Email Gate
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-brutal-purple border-2 border-black brutal-shadow-sm flex items-center gap-1.5">
              <span>🚫💸</span> Zero Cash Ledger
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-brutal-pink border-2 border-black brutal-shadow-sm flex items-center gap-1.5">
              <span>🎓</span> Minted Project Cards
            </span>
          </div>
        </div>
      </section>

      {/* 5-Step Arcade Stepper Grid */}
      <section className="py-16 px-4 md:px-8 border-t-4 border-black bg-white">
        <div className="max-w-7xl mx-auto flex flex-col gap-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="px-3 py-1 rounded-xl bg-black text-brutal-yellow font-display font-black text-xs uppercase tracking-wider brutal-shadow-sm">
                Tactile Campus Pipeline
              </span>
              <h2 className="text-3xl sm:text-5xl font-display font-black text-black uppercase tracking-tight mt-2">
                The 5-Step Arcade Flow
              </h2>
            </div>
            <p className="font-headline font-bold text-xs sm:text-sm text-black/70 max-w-md">
              Whether you need a quick 30-min debug fix or a multi-day hackathon co-builder, every session executes this verifiable protocol.
            </p>
          </div>

          {/* 5 Bento Step Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.number}
                  className="bg-white rounded-3xl border-4 border-black p-5 brutal-shadow flex flex-col justify-between gap-4 hover:-translate-y-1 transition-transform relative"
                >
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <div className={`w-12 h-12 rounded-2xl ${step.color} border-3 border-black flex items-center justify-center font-display font-black text-lg brutal-shadow-sm`}>
                        {step.number}
                      </div>
                      <span className="px-2 py-0.5 rounded-lg bg-black text-white font-mono font-bold text-[10px] uppercase">
                        {step.badge}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Icon className="w-5 h-5 text-black" />
                      <h3 className="font-display font-black text-lg text-black uppercase">
                        {step.title}
                      </h3>
                    </div>

                    <p className="font-headline font-semibold text-xs text-black/70 leading-relaxed">
                      {step.desc}
                    </p>
                  </div>

                  <div className="pt-2 border-t-2 border-black/10 flex items-center gap-1 text-[11px] font-mono font-bold text-black/60">
                    <span>⚡ Guaranteed Sync</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Bento Grid */}
      <section className="py-16 px-4 md:px-8 border-t-4 border-black bg-[#fffdf0]">
        <div className="max-w-7xl mx-auto flex flex-col gap-10">
          <div className="text-center max-w-2xl mx-auto">
            <span className="px-3 py-1 rounded-xl bg-black text-brutal-mint font-display font-black text-xs uppercase tracking-wider brutal-shadow-sm">
              Syndicate Pillars
            </span>
            <h2 className="text-3xl sm:text-5xl font-display font-black text-black uppercase tracking-tight mt-2">
              Why Campus Students Love It
            </h2>
            <p className="font-headline font-bold text-xs sm:text-sm text-black/70 mt-2">
              Built specifically to eliminate flakes, ghosting, and messy money between classmates.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feat) => {
              const Icon = feat.icon;
              return (
                <div
                  key={feat.title}
                  className={`${feat.color} rounded-3xl border-4 border-black p-6 brutal-shadow flex flex-col justify-between gap-5`}
                >
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-white border-3 border-black flex items-center justify-center text-xl brutal-shadow-sm">
                        <Icon className="w-6 h-6 text-black" />
                      </div>
                      <span className="px-2.5 py-0.5 rounded-lg bg-black text-white font-mono text-[10px] font-bold uppercase">
                        {feat.sticker}
                      </span>
                    </div>

                    <h3 className="font-display font-black text-xl text-black uppercase leading-tight">
                      {feat.title}
                    </h3>

                    <p className="font-headline font-semibold text-xs text-black/80 leading-relaxed">
                      {feat.desc}
                    </p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white/70 border-2 border-black font-mono text-[11px] font-bold text-black">
                    ✓ Verified Academic Rule
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="py-20 px-4 md:px-8 border-t-4 border-black bg-brutal-yellow retro-stripe">
        <div className="max-w-4xl mx-auto bg-white rounded-3xl border-4 border-black p-8 md:p-12 brutal-shadow-lg text-center flex flex-col items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-black text-brutal-yellow flex items-center justify-center font-display font-black text-3xl brutal-shadow-sm">
            ⚡
          </div>

          <h2 className="text-3xl sm:text-5xl font-display font-black text-black uppercase tracking-tight leading-tight">
            Ready to Level Up Your Campus Karma?
          </h2>

          <p className="font-headline font-bold text-sm sm:text-base text-black/80 max-w-xl">
            Join verified students exchanging Python, React, UI/UX, and data algorithms. Get 10 welcome SkillCredits on registration.
          </p>

          <Link to="/auth?mode=signup">
            <button className="px-10 py-4 rounded-2xl bg-black text-brutal-yellow font-display font-black text-lg uppercase tracking-wider brutal-btn flex items-center gap-3 hover:bg-brutal-electric hover:text-white border-3 border-black">
              <span>GET STARTED FREE WITH COLLEGE EMAIL</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </Link>

          <span className="font-mono text-xs font-bold text-black/60">
            🔒 Hardcoded Demo OTP: <strong>123456</strong> for instant testing!
          </span>
        </div>
      </section>
    </div>
  );
}