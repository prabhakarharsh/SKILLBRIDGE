"use client";

import React, { useState, useEffect } from "react";
import { Link } from "@/utils/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import { creditService } from "@/services/creditService";
import { storage, generateId, nowISO, getUsers } from "@/utils/storage";
import { useDemoPanel } from "@/hooks/useDemoPanel";

interface ChatMessage {
  id: string;
  sender: "peer" | "user";
  senderName: string;
  time: string;
  avatar: string;
  text: string;
  isCode?: boolean;
}

export function SkillBridgeArcade() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { setImpersonation, getMockUsers } = useDemoPanel();

  const playerName = user?.name || "Alex Morgan";
  const playerInitials = playerName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  const isAlex = playerName.toLowerCase().includes("alex");

  // Core Stage & State
  const [stage, setStage] = useState<number>(1);
  const [userCredits, setUserCredits] = useState<number>(user?.credits ?? 12);
  const [currentMode, setCurrentMode] = useState<"learn" | "buddy">("learn");

  // Stage 1: Quest Form
  const [questTitle, setQuestTitle] = useState(
    "Fix Responsive Flexbox Container & Breakpoints on Mobile"
  );
  const [questDomain, setQuestDomain] = useState("cs301");
  const [questUrgency, setQuestUrgency] = useState("urgent");
  const [deliverable, setDeliverable] = useState(
    "Responsive layout without horizontal overflow on 375px mobile & 1440px desktop displays, confirmed with synchronous code review."
  );
  const [tags, setTags] = useState<Array<{ name: string; color: string; icon: string }>>([
    { name: "CSS Flexbox", color: "bg-brutal-yellow", icon: "🎨" },
    { name: "Tailwind CSS", color: "bg-brutal-mint", icon: "⚡" },
    { name: "React.js", color: "bg-brutal-blue", icon: "⚛️" },
  ]);
  const [customTagInput, setCustomTagInput] = useState("");

  // Stage 2: Peer Selection (Ensure peer is never the logged-in user)
  const [selectedPeer, setSelectedPeer] = useState<string>(isAlex ? "Sarah K." : "Alex M.");

  // Stage 3: Consent & Chat
  const [userConsented, setUserConsented] = useState<boolean>(false);
  const [peerConsented, setPeerConsented] = useState<boolean>(false);
  const [chatInput, setChatInput] = useState<string>("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  // Stage 4: Deliverables & Minting
  const [projectMinted, setProjectMinted] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // Stage 5: Loot Store & Feedback
  const [redeemModal, setRedeemModal] = useState<{
    open: boolean;
    name: string;
    cost: number;
  }>({ open: false, name: "", cost: 0 });
  const [awardedBadges, setAwardedBadges] = useState<string[]>([
    "RELIABLE & PUNCTUAL",
  ]);
  const [feedbackText, setFeedbackText] = useState(
    `${selectedPeer} explained CSS Flexbox container hierarchies clearly and helped diagnose the 375px mobile breakpoint bug in under 15 minutes.`
  );

  // Cheat Panel Drawer
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);

  // Synchronize credits and peer with logged-in user across Classic and Arcade
  useEffect(() => {
    if (user?.id) {
      creditService.getBalance(user.id).then((bal) => {
        if (bal !== undefined) {
          setUserCredits(bal);
        }
      });
      if (user.name.toLowerCase().includes("alex")) {
        setSelectedPeer("Sarah K.");
      } else {
        setSelectedPeer("Alex M.");
      }
    }
  }, [user]);

  useEffect(() => {
    setFeedbackText(
      `${selectedPeer} explained CSS Flexbox container hierarchies clearly and helped diagnose the 375px mobile breakpoint bug in under 15 minutes.`
    );
    const peerInitials = selectedPeer.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
    setChatMessages([
      {
        id: "1",
        sender: "peer",
        senderName: selectedPeer,
        time: "2:14 PM",
        avatar: peerInitials,
        text: "Yo! I inspected your CSS layout issue. You have an unconstrained min-width: max-content on the child item, which causes the horizontal viewport overflow on 375px screens!",
      },
      {
        id: "2",
        sender: "user",
        senderName: playerName,
        time: "2:15 PM",
        avatar: playerInitials,
        text: "That makes total sense! Can we hop into a 15-minute quick pairing to rewrite it with Tailwind responsive flex-col sm:flex-row classes together?",
      },
      {
        id: "3",
        sender: "peer",
        senderName: selectedPeer,
        time: "2:16 PM",
        avatar: peerInitials,
        text: "100%! I am turning my key in the consent gate now. Once you press 'Go Ahead', our session agreement and verified badge pipeline activate! 🚀",
      },
    ]);
  }, [selectedPeer, playerName, playerInitials]);

  const switchStage = (s: number) => {
    setStage(s);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Tag Handling
  const addTag = (name: string) => {
    if (!name.trim()) return;
    if (tags.some((t) => t.name.toLowerCase() === name.toLowerCase())) return;
    const colors = [
      "bg-brutal-yellow",
      "bg-brutal-mint",
      "bg-brutal-purple",
      "bg-brutal-pink",
      "bg-brutal-blue",
    ];
    const chosenColor = colors[tags.length % colors.length];
    setTags([...tags, { name: name.trim(), color: chosenColor, icon: "🏷️" }]);
    setCustomTagInput("");
  };

  const removeTag = (name: string) => {
    setTags(tags.filter((t) => t.name !== name));
  };

  // Stage 1 -> 2
  const submitQuest = () => {
    if (userCredits <= 0) {
      showToast("Insufficient credits to stake. Reset or earn credits!", "error");
      return;
    }
    const newBal = Math.max(0, userCredits - 1);
    setUserCredits(newBal);
    if (user?.id) {
      storage.addCreditTransaction({
        id: generateId("txn"),
        userId: user.id,
        amount: 1,
        type: "spent",
        reason: "request-help",
        referenceId: "quest-9804",
        createdAt: nowISO(),
      });
    }
    showToast("🚀 Campus Radar Active: Escrow 1 CR Staked!", "info");
    switchStage(2);
  };

  // Stage 2 -> 3
  const handleSelectPeer = (peerName: string) => {
    setSelectedPeer(peerName);
    switchStage(3);
  };

  // Stage 3: Chat message sending
  const sendChatMessage = () => {
    if (!chatInput.trim()) return;
    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: "user",
      senderName: "You",
      time: "Just now",
      avatar: "ME",
      text: chatInput.trim(),
    };
    setChatMessages((prev) => [...prev, newMsg]);
    setChatInput("");
  };

  // Stage 4: Minting
  const handleCompleteProject = () => {
    const newBal = userCredits + 3;
    setUserCredits(newBal);
    setProjectMinted(true);
    if (user?.id) {
      storage.addCreditTransaction({
        id: generateId("txn"),
        userId: user.id,
        amount: 3,
        type: "earned",
        reason: "complete-project",
        referenceId: "quest-9804",
        createdAt: nowISO(),
      });
      const u = storage.getUserById(user.id);
      if (u) {
        storage.saveUser({ ...u, credits: (u.credits || 0) + 3 });
      }
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("auth-user-changed"));
      }
    }
    showToast("🏆 Verified Project Proof Minted! +3 CR Deposited!", "success");
  };

  const handleCopyShareLink = () => {
    setCopiedLink(true);
    navigator.clipboard?.writeText(window.location.href);
    setTimeout(() => setCopiedLink(false), 2200);
  };

  // Stage 5: Redeem
  const handleConfirmRedeem = () => {
    if (userCredits < redeemModal.cost) {
      showToast(
        `⚠️ Not enough credits! You have ${userCredits} CR, need ${redeemModal.cost} CR.`,
        "error"
      );
      setRedeemModal({ open: false, name: "", cost: 0 });
      return;
    }
    const newBal = userCredits - redeemModal.cost;
    setUserCredits(newBal);
    if (user?.id) {
      storage.addCreditTransaction({
        id: generateId("txn"),
        userId: user.id,
        amount: redeemModal.cost,
        type: "spent",
        reason: "redeem-reward",
        referenceId: redeemModal.name,
        createdAt: nowISO(),
      });
      const u = storage.getUserById(user.id);
      if (u) {
        storage.saveUser({ ...u, credits: Math.max(0, (u.credits || 0) - redeemModal.cost) });
      }
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("auth-user-changed"));
      }
    }
    showToast(`🎉 Redeemed: ${redeemModal.name}! Pass unlocked!`, "success");
    setRedeemModal({ open: false, name: "", cost: 0 });
  };

  const toggleBadge = (badgeName: string) => {
    if (awardedBadges.includes(badgeName)) {
      setAwardedBadges(awardedBadges.filter((b) => b !== badgeName));
    } else {
      setAwardedBadges([...awardedBadges, badgeName]);
    }
  };

  const handleSubmitFeedback = () => {
    showToast(
      `🙌 Feedback recorded! Public trust badges & faculty comments locked into ${selectedPeer}'s verified record.`,
      "success"
    );
  };

  // Reset Demo Data
  const resetDemoData = () => {
    setUserCredits(12);
    setUserConsented(false);
    setPeerConsented(false);
    setProjectMinted(false);
    setCurrentMode("learn");
    setStage(1);
    showToast("↺ Demo state reset to initial values!", "info");
  };

  const bothConsented = userConsented && peerConsented;

  const peer1Name = isAlex ? "Sarah K." : "Alex M.";
  const peer1Role = isAlex ? "HCI Graduate · CSS Systems" : "CS Senior · CS 301 Lead Tutor";
  const peer1Initials = isAlex ? "SK" : "AM";
  const peer1Bg = isAlex ? "bg-brutal-purple" : "bg-brutal-yellow";

  const peer2Name = isAlex ? "Raj P." : "Sarah K.";
  const peer2Role = isAlex ? "ML Researcher · Python Specialist" : "HCI Graduate · CSS Systems";
  const peer2Initials = isAlex ? "RP" : "SK";
  const peer2Bg = isAlex ? "bg-brutal-mint" : "bg-brutal-purple";

  const peer3Name = isAlex ? "Kevin L." : "Marcus L.";
  const peer3Role = isAlex ? "Backend Engineer · Node & APIs" : "CS Sophomore · Open Source";
  const peer3Initials = isAlex ? "KL" : "ML";
  const peer3Bg = isAlex ? "bg-brutal-yellow" : "bg-brutal-blue";

  return (
    <div className="bg-[#fefce8] pixel-pattern font-headline text-black antialiased selection:bg-black selection:text-brutal-yellow min-h-screen">
      {/* ==========================================
          TOP RETRO ARCADE NAVIGATION BAR
         ========================================== */}
      <header className="sticky top-0 left-0 right-0 z-40 bg-white border-b-4 border-black px-4 md:px-8 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-4">
            <div
              className="flex items-center gap-2 cursor-pointer bg-brutal-yellow border-3 border-black px-3 py-1.5 rounded-xl brutal-shadow transition-transform hover:-rotate-2"
              onClick={() => switchStage(1)}
            >
              <span className="w-8 h-8 rounded-lg bg-black text-brutal-yellow flex items-center justify-center font-display font-black text-lg">
                ⚡
              </span>
              <span className="font-display font-black text-lg sm:text-xl tracking-tight text-black uppercase">
                SkillBridge Arcade
              </span>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-brutal-mint border-3 border-black brutal-shadow-sm sticker-rotate-right">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border border-black animate-ping" />
              <span className="text-xs font-black uppercase tracking-wider font-mono">
                CAMPUS SYNDICATE • 24 ONLINE
              </span>
            </div>
          </div>

          {/* Arcade Fast Stage Nav Pills */}
          <nav className="hidden lg:flex items-center gap-2 bg-brutal-purple/30 p-1.5 rounded-2xl border-3 border-black">
            {[
              { num: 1, label: "1. Quest Post" },
              { num: 2, label: "2. Radar" },
              { num: 3, label: "3. 2-Key Gate" },
              { num: 4, label: "4. Badge Card" },
              { num: 5, label: "5. Loot Vault" },
            ].map((p) => (
              <button
                key={p.num}
                className={`px-3 py-1 rounded-xl font-display font-black text-xs uppercase transition-all ${
                  stage === p.num
                    ? "bg-black text-white"
                    : "hover:bg-black/10 text-black"
                }`}
                onClick={() => switchStage(p.num)}
              >
                {p.label}
              </button>
            ))}
          </nav>

          {/* Coin Vault & Demo Panel */}
          <div className="flex items-center gap-3">
            {/* Live Bouncy Coin Counter */}
            <div
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-brutal-yellow border-3 border-black brutal-shadow font-display font-black text-sm hover:scale-105 transition-transform"
              title="SkillCredits Balance"
            >
              <span className="text-lg animate-bounce">🪙</span>
              <span className="font-mono text-base tracking-tight font-black">
                {userCredits} SKILLCREDITS
              </span>
            </div>

            {/* Standard App Link */}
            <Link
              to="/dashboard"
              className="hidden md:inline-flex brutal-btn px-3 py-1.5 rounded-xl bg-white border-3 border-black font-display font-black text-xs uppercase items-center gap-1.5"
            >
              <span>Classic UI</span>
            </Link>

            {/* Demo Cheat Drawer Toggle */}
            <button
              className="brutal-btn px-3 py-1.5 rounded-xl bg-brutal-pink border-3 border-black font-display font-black text-xs uppercase flex items-center gap-1.5"
              onClick={() => setDrawerOpen(!drawerOpen)}
              type="button"
            >
              <span className="text-sm">🎮</span>
              <span className="hidden sm:inline">Cheat Panel</span>
            </button>

            {/* Player Avatar */}
            <div
              className="w-10 h-10 rounded-xl bg-brutal-blue border-3 border-black brutal-shadow flex items-center justify-center font-display font-black text-sm cursor-pointer hover:rotate-6 transition-transform"
              onClick={() => switchStage(4)}
              title={`Player: ${playerName} (${userCredits} Credits)`}
            >
              {playerInitials}
            </div>
          </div>
        </div>
      </header>

      {/* ==========================================
          MAIN TACTILE BENTO PLAYGROUND
         ========================================== */}
      <main className="w-full max-w-7xl mx-auto px-4 md:px-8 py-8">
        {/* Arcade Bento Stage Switcher Stepper */}
        <div className="mb-8">
          <div className="bg-white rounded-3xl border-4 border-black p-4 brutal-shadow flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto py-1">
              {[
                { num: 1, label: "Post Quest", color: "hover:bg-brutal-yellow/50" },
                { num: 2, label: "Radar Match", color: "hover:bg-brutal-blue/50" },
                {
                  num: 3,
                  label: "2-Key Consent",
                  color: "hover:bg-brutal-purple/50",
                  pulse: true,
                },
                { num: 4, label: "Mint Credential", color: "hover:bg-brutal-pink/50" },
                { num: 5, label: "Loot Store", color: "hover:bg-brutal-mint/50" },
              ].map((step) => {
                const isActive = stage === step.num;
                return (
                  <button
                    key={step.num}
                    className={`stage-pill brutal-btn flex items-center gap-2 px-4 py-2 rounded-2xl border-3 border-black font-display font-black text-xs uppercase text-black ${
                      isActive ? "bg-brutal-yellow" : `bg-white ${step.color}`
                    }`}
                    onClick={() => switchStage(step.num)}
                  >
                    <span
                      className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-mono ${
                        isActive
                          ? "bg-black text-brutal-yellow"
                          : "bg-gray-200 text-black"
                      }`}
                    >
                      0{step.num}
                    </span>
                    <span>{step.label}</span>
                    {step.pulse && (
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border border-black animate-pulse" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Campus Guarantee Sticker */}
            <div className="hidden xl:flex items-center gap-2 bg-brutal-mint px-3.5 py-1.5 rounded-xl border-3 border-black sticker-rotate-left brutal-shadow-sm text-xs font-black font-mono">
              <span>🛡️</span> ZERO-CASH VAULT: SMART ESCROW ACTIVE
            </div>
          </div>
        </div>

        {/* ==========================================
            STAGE 1: POST A QUEST (TACTILE BENTO GRID)
           ========================================== */}
        {stage === 1 && (
          <section className="flex flex-col gap-6 animate-fade-in">
            {/* Hero Bento Top Banner */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-8 bg-brutal-yellow rounded-3xl border-4 border-black p-6 md:p-8 brutal-shadow relative overflow-hidden flex flex-col justify-between gap-6">
                <div className="flex flex-col gap-2 relative z-10">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-xl bg-black text-brutal-yellow font-display font-black text-xs uppercase tracking-wider brutal-shadow-sm">
                      Campus Arcade Protocol
                    </span>
                    <span className="bg-white border-2 border-black px-2.5 py-0.5 rounded-full text-xs font-mono font-bold">
                      100% Peer-to-Peer
                    </span>
                  </div>
                  <h1 className="font-display font-black text-3xl sm:text-5xl text-black uppercase tracking-tight leading-none mt-2">
                    Spawn a Peer Quest &amp; Level Up
                  </h1>
                  <p className="font-headline font-semibold text-black/80 text-sm sm:text-base max-w-xl">
                    Stuck on buggy CSS flexbox, complex SQL, or hackathon code? Stake
                    1 SkillCredit to summon verified campus peer wizards instantly.
                  </p>
                </div>

                {/* Quest Mode Arcade Toggle Bento */}
                <div className="flex flex-col gap-3 relative z-10 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="font-display font-black text-xs uppercase tracking-wider text-black">
                      SELECT QUEST SPEED:
                    </span>
                    <span className="font-mono text-xs font-bold text-black/70">
                      Physical Toggle Switch
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Mode 1: Fast Quest */}
                    <div
                      className={`cursor-pointer p-4 rounded-2xl border-4 border-black brutal-btn flex flex-col justify-between gap-3 relative group transition-all ${
                        currentMode === "learn"
                          ? "bg-white"
                          : "bg-white/70 opacity-90"
                      }`}
                      onClick={() => setCurrentMode("learn")}
                    >
                      <div className="flex items-center justify-between">
                        <div className="w-12 h-12 rounded-xl bg-brutal-yellow border-3 border-black flex items-center justify-center font-display text-2xl shadow-sm">
                          ⚡
                        </div>
                        {currentMode === "learn" && (
                          <span className="px-2.5 py-1 rounded-xl bg-black text-brutal-yellow font-display font-black text-[11px] uppercase tracking-wider">
                            SELECTED
                          </span>
                        )}
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="font-display font-black text-lg text-black uppercase tracking-tight">
                          30-Min Fast Fix
                        </span>
                        <p className="text-xs font-headline font-medium text-black/70">
                          Quick debugging, CSS layout unstuck, or code sanity check.
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 text-black font-mono font-bold text-xs bg-brutal-blue px-2.5 py-1 rounded-lg border-2 border-black w-fit">
                        <span>⏱️</span> 1 Micro-Block (30 min)
                      </div>
                    </div>

                    {/* Mode 2: Squad Co-Build */}
                    <div
                      className={`cursor-pointer p-4 rounded-2xl border-4 border-black brutal-btn flex flex-col justify-between gap-3 relative group transition-all ${
                        currentMode === "buddy"
                          ? "bg-white"
                          : "bg-white/70 opacity-90"
                      }`}
                      onClick={() => setCurrentMode("buddy")}
                    >
                      <div className="flex items-center justify-between">
                        <div className="w-12 h-12 rounded-xl bg-brutal-purple border-3 border-black flex items-center justify-center font-display text-2xl shadow-sm">
                          🤝
                        </div>
                        {currentMode === "buddy" && (
                          <span className="px-2.5 py-1 rounded-xl bg-black text-brutal-purple font-display font-black text-[11px] uppercase tracking-wider">
                            SELECTED
                          </span>
                        )}
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="font-display font-black text-lg text-black uppercase tracking-tight">
                          Squad Co-Build
                        </span>
                        <p className="text-xs font-headline font-medium text-black/70">
                          Multi-day sprint, project partner, or hackathon co-pilot.
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 text-black font-mono font-bold text-xs bg-brutal-pink px-2.5 py-1 rounded-lg border-2 border-black w-fit">
                        <span>🎮</span> Deep Collaborative Raid
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Bento Vault Card (Escrow) */}
              <div className="lg:col-span-4 bg-brutal-purple rounded-3xl border-4 border-black p-6 brutal-shadow flex flex-col justify-between gap-5 relative overflow-hidden">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-xl bg-black text-white font-display font-black text-xs uppercase">
                      Safe-Deposit Vault
                    </span>
                    <span className="text-2xl animate-pulse">🔒</span>
                  </div>
                  <h2 className="font-display font-black text-2xl text-black uppercase tracking-tight leading-tight">
                    Zero-Cash Ledger Protocol
                  </h2>
                  <div className="p-4 rounded-2xl bg-white border-3 border-black brutal-shadow-sm flex flex-col gap-2.5 font-mono text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-black/70">Current Vault:</span>
                      <span className="font-black text-black font-mono text-sm">
                        {userCredits} CR
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-red-600 font-bold">
                      <span>Radar Stake:</span>
                      <span>-1 CR (Refundable)</span>
                    </div>
                    <div className="flex items-center justify-between text-emerald-600 font-bold">
                      <span>Bounty Payout:</span>
                      <span>+3 CR on Review</span>
                    </div>
                    <div className="h-0.5 bg-black my-1" />
                    <div className="flex items-center justify-between font-black text-sm">
                      <span>Projected Vault:</span>
                      <span className="bg-brutal-yellow px-2 py-0.5 rounded border border-black">
                        {userCredits + 2} CR
                      </span>
                    </div>
                  </div>
                </div>

                {/* Neo-Brutalist Sticker Banner */}
                <div className="bg-brutal-pink p-3.5 rounded-2xl border-3 border-black brutal-shadow-sm flex items-center gap-3 sticker-rotate-left">
                  <span className="text-3xl">🚫💸</span>
                  <div className="flex flex-col">
                    <span className="font-display font-black text-xs uppercase leading-tight">
                      NO FIAT CURRENCY ALLOWED!
                    </span>
                    <span className="font-headline text-[11px] font-bold text-black/80">
                      Operates solely on academic karma, verified peer badges &amp;
                      SkillCredits.
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Bento Row: Form & Interactive Skill Sticker Board */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left: Quest Specification Card */}
              <div className="lg:col-span-8 bg-white rounded-3xl border-4 border-black p-6 md:p-8 brutal-shadow flex flex-col gap-6">
                <div className="flex items-center justify-between border-b-3 border-black pb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-xl bg-brutal-mint border-2 border-black flex items-center justify-center font-display font-black text-sm">
                      ✍️
                    </span>
                    <span className="font-display font-black text-xl text-black uppercase">
                      Quest Blueprint
                    </span>
                  </div>
                  <span className="font-mono text-xs font-bold bg-gray-100 border-2 border-black px-2.5 py-1 rounded-xl">
                    ID: #QUEST-9804
                  </span>
                </div>

                <div className="flex flex-col gap-4">
                  {/* Title Input */}
                  <div className="flex flex-col gap-1.5">
                    <label className="font-display font-black text-xs uppercase tracking-wider text-black">
                      Quest Headline (What&apos;s Broken?)
                    </label>
                    <input
                      className="w-full px-4 py-3 rounded-2xl bg-[#fffdf0] border-3 border-black text-black font-headline font-bold text-sm brutal-shadow-sm focus:outline-none focus:bg-white placeholder:text-black/40 transition-all"
                      placeholder="e.g. Master CSS Grid layout for interactive portfolio"
                      type="text"
                      value={questTitle}
                      onChange={(e) => setQuestTitle(e.target.value)}
                    />
                  </div>

                  {/* Course & Urgency Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="font-display font-black text-xs uppercase tracking-wider text-black">
                        Campus Course
                      </label>
                      <select
                        className="w-full px-4 py-3 rounded-2xl bg-[#fffdf0] border-3 border-black text-black font-headline font-bold text-sm brutal-shadow-sm focus:outline-none focus:bg-white transition-all"
                        value={questDomain}
                        onChange={(e) => setQuestDomain(e.target.value)}
                      >
                        <option value="cs301">CS 301 - Interactive Web Systems</option>
                        <option value="cs204">CS 204 - Algorithmic Thinking</option>
                        <option value="ds100">DS 100 - Data Structures &amp; SQL</option>
                        <option value="des210">DES 210 - UI/UX Design Systems</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="font-display font-black text-xs uppercase tracking-wider text-black">
                        Urgency Level
                      </label>
                      <select
                        className="w-full px-4 py-3 rounded-2xl bg-[#fffdf0] border-3 border-black text-black font-headline font-bold text-sm brutal-shadow-sm focus:outline-none focus:bg-white transition-all"
                        value={questUrgency}
                        onChange={(e) => setQuestUrgency(e.target.value)}
                      >
                        <option value="urgent">🔥 Within 2 Hours (Urgent Lab)</option>
                        <option value="tonight">🌙 Tonight Study Session</option>
                        <option value="weekend">🏖️ Weekend Hackathon Sprint</option>
                      </select>
                    </div>
                  </div>

                  {/* Clickable Interactive Skill Stickers */}
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <label className="font-display font-black text-xs uppercase tracking-wider text-black">
                        Required Skill Badges (Click Stickers to Add)
                      </label>
                      <span className="font-mono text-[11px] font-bold text-black/60">
                        + Press Enter for custom
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 p-3 rounded-2xl bg-[#fffdf0] border-3 border-black brutal-shadow-sm min-h-14">
                      {tags.map((tag) => (
                        <span
                          key={tag.name}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl ${tag.color} border-2 border-black font-display font-black text-xs brutal-shadow-sm hover:scale-105 transition-transform`}
                        >
                          <span>
                            {tag.icon} {tag.name}
                          </span>
                          <span
                            className="cursor-pointer hover:text-red-600 font-black ml-1 text-xs"
                            onClick={() => removeTag(tag.name)}
                          >
                            ✕
                          </span>
                        </span>
                      ))}

                      <input
                        className="bg-transparent font-headline font-bold text-xs text-black px-2 py-1 focus:outline-none placeholder:text-black/40 w-32"
                        placeholder="+ New sticker..."
                        type="text"
                        value={customTagInput}
                        onChange={(e) => setCustomTagInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addTag(customTagInput);
                          }
                        }}
                      />
                    </div>

                    {/* Quick Sticker Suggestion Dock */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      <span className="text-[11px] font-mono font-bold text-black/60 self-center mr-1">
                        Hot Stickers:
                      </span>
                      {[
                        { name: "TypeScript", color: "hover:bg-brutal-purple" },
                        { name: "Python / NumPy", color: "hover:bg-brutal-pink" },
                        { name: "Figma Systems", color: "hover:bg-brutal-yellow" },
                      ].map((s) => (
                        <button
                          key={s.name}
                          className={`px-2.5 py-1 rounded-lg bg-gray-100 border-2 border-black text-[11px] font-display font-black ${s.color} brutal-shadow-sm transition-all`}
                          onClick={() => addTag(s.name)}
                          type="button"
                        >
                          + {s.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Target Deliverable */}
                  <div className="flex flex-col gap-1.5">
                    <label className="font-display font-black text-xs uppercase tracking-wider text-black">
                      Target Deliverable (Victory Condition)
                    </label>
                    <textarea
                      className="w-full p-3.5 rounded-2xl bg-[#fffdf0] border-3 border-black text-black font-headline font-bold text-xs brutal-shadow-sm focus:outline-none focus:bg-white"
                      rows={2}
                      value={deliverable}
                      onChange={(e) => setDeliverable(e.target.value)}
                    />
                  </div>
                </div>

                {/* Big Punchy Action Bar */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t-3 border-black">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-black/70">
                    <span className="w-3 h-3 rounded-full bg-emerald-400 border border-black" />
                    <span>
                      Escrow 1 CR held in safe; automatically refunded if no match!
                    </span>
                  </div>
                  <button
                    className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-black text-brutal-yellow font-display font-black text-base uppercase tracking-wider brutal-btn flex items-center justify-center gap-3 hover:bg-brutal-electric hover:text-white"
                    onClick={submitQuest}
                    type="button"
                  >
                    <span>LAUNCH CAMPUS RADAR</span>
                    <span className="text-xl">🚀</span>
                  </button>
                </div>
              </div>

              {/* Right Bento: Active Campus Activity Monitor */}
              <div className="lg:col-span-4 flex flex-col gap-6">
                {/* Live Peer Radar Card */}
                <div className="bg-brutal-mint rounded-3xl border-4 border-black p-6 brutal-shadow flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-xl bg-black text-white font-display font-black text-xs uppercase">
                      Lab Radar Scan
                    </span>
                    <span className="flex items-center gap-1 font-mono text-xs font-black bg-white border border-black px-2 py-0.5 rounded-full">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />{" "}
                      24 READY
                    </span>
                  </div>
                  <div className="flex flex-col gap-3">
                    <div className="p-3 bg-white rounded-2xl border-3 border-black brutal-shadow-sm flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl ${peer1Bg} border-2 border-black flex items-center justify-center font-display font-black text-sm`}>
                        {peer1Initials}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-display font-black text-sm text-black truncate">
                          {peer1Name} (94% Compatibility)
                        </span>
                        <span className="font-mono text-xs text-black/70 truncate">
                          {peer1Role} · Available Now
                        </span>
                      </div>
                    </div>
                    <div className="p-3 bg-white rounded-2xl border-3 border-black brutal-shadow-sm flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl ${peer2Bg} border-2 border-black flex items-center justify-center font-display font-black text-sm`}>
                        {peer2Initials}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-display font-black text-sm text-black truncate">
                          {peer2Name} (88% Compatibility)
                        </span>
                        <span className="font-mono text-xs text-black/70 truncate">
                          {peer2Role} · Free in 15m
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-white/60 border-2 border-black font-mono text-[11px] font-bold text-black/80 flex items-center gap-2">
                    <span>⚡</span> Average peer response time:{" "}
                    <strong>4.2 minutes</strong>
                  </div>
                </div>

                {/* Hackathon Badge Sticker */}
                <div className="bg-brutal-blue rounded-3xl border-4 border-black p-5 brutal-shadow flex items-center gap-4 sticker-rotate-right">
                  <div className="w-12 h-12 rounded-2xl bg-black text-white flex items-center justify-center text-2xl font-mono">
                    🏆
                  </div>
                  <div className="flex flex-col">
                    <span className="font-display font-black text-sm uppercase">
                      Spring Capstone Bounty
                    </span>
                    <span className="text-xs font-headline font-medium text-black/80">
                      Every session earns double verified credential karma this week!
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ==========================================
            STAGE 2: RADAR MATCHES & SMART SCORES
           ========================================== */}
        {stage === 2 && (
          <section className="flex flex-col gap-6 animate-fade-in">
            {/* Header banner */}
            <div className="bg-brutal-mint rounded-3xl border-4 border-black p-6 md:p-8 brutal-shadow flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-xl bg-black text-brutal-mint font-display font-black text-xs uppercase">
                    Algorithm Radar Results
                  </span>
                  <span className="bg-white border-2 border-black px-2 py-0.5 rounded-full text-xs font-mono font-bold">
                    Query #SB-RADAR-9804
                  </span>
                </div>
                <h2 className="font-display font-black text-3xl md:text-4xl text-black uppercase tracking-tight mt-1">
                  Top 3 Peer Mentors Found!
                </h2>
                <p className="font-headline font-semibold text-xs sm:text-sm text-black/80">
                  Ranked by multi-factor score: 50% Skill Alignment + 25% Real-Time
                  Proximity + 15% Trust Rating + 10% Lab Affinity.
                </p>
              </div>
              <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border-3 border-black brutal-shadow-sm font-display font-black text-xs">
                <button className="px-3 py-1.5 rounded-xl bg-black text-white">
                  ALL MATCHES (3)
                </button>
                <button className="px-3 py-1.5 rounded-xl hover:bg-gray-100">
                  FREE NOW
                </button>
              </div>
            </div>

            {/* 3 Neo-Brutalist Peer Bento Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Card 1: peer1 (94% Top Match) */}
              <div className="bg-white rounded-3xl border-4 border-black p-6 brutal-shadow-lg flex flex-col justify-between gap-5 relative overflow-hidden transition-transform hover:-translate-y-1">
                <div className="absolute top-0 right-0 bg-brutal-yellow border-b-3 border-l-3 border-black px-4 py-1 font-display font-black text-xs uppercase">
                  🔥 94% MATCH (TOP)
                </div>
                <div className="flex flex-col gap-4 pt-4">
                  <div className="flex items-start gap-3">
                    <div className={`w-16 h-16 rounded-2xl ${peer1Bg} border-3 border-black brutal-shadow-sm flex items-center justify-center font-display font-black text-xl flex-shrink-0`}>
                      {peer1Initials}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-display font-black text-lg text-black uppercase">
                        {peer1Name}
                      </span>
                      <span className="font-mono text-xs font-bold text-black/70">
                        {peer1Role}
                      </span>
                      <div className="flex items-center gap-1.5 mt-1 font-mono font-black text-xs bg-brutal-pink px-2 py-0.5 rounded-lg border border-black w-fit">
                        <span>⭐ 4.95</span>
                        <span>(42 reviews)</span>
                      </div>
                    </div>
                  </div>

                  {/* Score Breakdown Card */}
                  <div className="p-3.5 rounded-2xl bg-[#fffdf0] border-3 border-black flex flex-col gap-2">
                    <div className="flex items-center justify-between font-display font-black text-xs">
                      <span>WEIGHTED POWER SCORE</span>
                      <span className="text-sm bg-black text-brutal-yellow px-2 py-0.5 rounded font-mono">
                        94 / 100
                      </span>
                    </div>
                    <div className="w-full h-3 rounded-full bg-gray-200 border-2 border-black overflow-hidden p-0.5">
                      <div
                        className="h-full bg-black rounded-full"
                        style={{ width: "94%" }}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-1 text-[11px] font-mono font-bold text-black/70 pt-1">
                      <div>🎯 50% Skill: 100%</div>
                      <div>⚡ 25% Avail: NOW</div>
                      <div>⭐ 15% Rating: 4.95</div>
                      <div>🏫 10% Lab: Same Floor</div>
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-1.5">
                    <span className="px-2.5 py-1 rounded-xl bg-brutal-yellow border-2 border-black font-display font-black text-[11px]">
                      Flexbox Specialist
                    </span>
                    <span className="px-2.5 py-1 rounded-xl bg-brutal-mint border-2 border-black font-display font-black text-[11px]">
                      Ready in 5m
                    </span>
                    <span className="px-2.5 py-1 rounded-xl bg-brutal-blue border-2 border-black font-display font-black text-[11px]">
                      100% Completion
                    </span>
                  </div>
                </div>

                <button
                  className="w-full py-3 rounded-2xl bg-black text-brutal-yellow font-display font-black text-xs uppercase tracking-wider brutal-btn flex items-center justify-center gap-2 hover:bg-brutal-electric hover:text-white"
                  onClick={() => handleSelectPeer(peer1Name)}
                  type="button"
                >
                  <span>SELECT {peer1Name.toUpperCase()} &amp; ENTER 2-KEY GATE</span>
                  <span>⚡</span>
                </button>
              </div>

              {/* Card 2: peer2 (88% Match) */}
              <div className="bg-white rounded-3xl border-4 border-black p-6 brutal-shadow flex flex-col justify-between gap-5 relative overflow-hidden transition-transform hover:-translate-y-1">
                <div className="absolute top-0 right-0 bg-brutal-purple border-b-3 border-l-3 border-black px-4 py-1 font-display font-black text-xs uppercase">
                  88% MATCH
                </div>
                <div className="flex flex-col gap-4 pt-4">
                  <div className="flex items-start gap-3">
                    <div className={`w-16 h-16 rounded-2xl ${peer2Bg} border-3 border-black brutal-shadow-sm flex items-center justify-center font-display font-black text-xl flex-shrink-0`}>
                      {peer2Initials}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-display font-black text-lg text-black uppercase">
                        {peer2Name}
                      </span>
                      <span className="font-mono text-xs font-bold text-black/70">
                        {peer2Role}
                      </span>
                      <div className="flex items-center gap-1.5 mt-1 font-mono font-black text-xs bg-brutal-mint px-2 py-0.5 rounded-lg border border-black w-fit">
                        <span>⭐ 4.88</span>
                        <span>(31 reviews)</span>
                      </div>
                    </div>
                  </div>

                  {/* Score Breakdown Card */}
                  <div className="p-3.5 rounded-2xl bg-[#fffdf0] border-3 border-black flex flex-col gap-2">
                    <div className="flex items-center justify-between font-display font-black text-xs">
                      <span>WEIGHTED POWER SCORE</span>
                      <span className="text-sm bg-black text-brutal-purple px-2 py-0.5 rounded font-mono">
                        88 / 100
                      </span>
                    </div>
                    <div className="w-full h-3 rounded-full bg-gray-200 border-2 border-black overflow-hidden p-0.5">
                      <div
                        className="h-full bg-black rounded-full"
                        style={{ width: "88%" }}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-1 text-[11px] font-mono font-bold text-black/70 pt-1">
                      <div>🎯 50% Skill: 92%</div>
                      <div>⚡ 25% Avail: In 15m</div>
                      <div>⭐ 15% Rating: 4.88</div>
                      <div>🏫 10% Lab: EECS Dept</div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    <span className="px-2.5 py-1 rounded-xl bg-gray-100 border-2 border-black font-display font-black text-[11px]">
                      Responsive UI
                    </span>
                    <span className="px-2.5 py-1 rounded-xl bg-gray-100 border-2 border-black font-display font-black text-[11px]">
                      In Library Now
                    </span>
                  </div>
                </div>

                <button
                  className="w-full py-3 rounded-2xl bg-white border-3 border-black font-display font-black text-xs uppercase tracking-wider brutal-btn flex items-center justify-center gap-2 hover:bg-black hover:text-white"
                  onClick={() => handleSelectPeer(peer2Name)}
                  type="button"
                >
                  <span>SELECT {peer2Name.toUpperCase()}</span>
                  <span>🤝</span>
                </button>
              </div>

              {/* Card 3: peer3 (82% Match) */}
              <div className="bg-white rounded-3xl border-4 border-black p-6 brutal-shadow flex flex-col justify-between gap-5 relative overflow-hidden transition-transform hover:-translate-y-1">
                <div className="absolute top-0 right-0 bg-brutal-blue border-b-3 border-l-3 border-black px-4 py-1 font-display font-black text-xs uppercase">
                  82% MATCH
                </div>
                <div className="flex flex-col gap-4 pt-4">
                  <div className="flex items-start gap-3">
                    <div className={`w-16 h-16 rounded-2xl ${peer3Bg} border-3 border-black brutal-shadow-sm flex items-center justify-center font-display font-black text-xl flex-shrink-0`}>
                      {peer3Initials}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-display font-black text-lg text-black uppercase">
                        {peer3Name}
                      </span>
                      <span className="font-mono text-xs font-bold text-black/70">
                        {peer3Role}
                      </span>
                      <div className="flex items-center gap-1.5 mt-1 font-mono font-black text-xs bg-brutal-yellow px-2 py-0.5 rounded-lg border border-black w-fit">
                        <span>⭐ 4.75</span>
                        <span>(19 reviews)</span>
                      </div>
                    </div>
                  </div>

                  {/* Score Breakdown Card */}
                  <div className="p-3.5 rounded-2xl bg-[#fffdf0] border-3 border-black flex flex-col gap-2">
                    <div className="flex items-center justify-between font-display font-black text-xs">
                      <span>WEIGHTED POWER SCORE</span>
                      <span className="text-sm bg-black text-brutal-blue px-2 py-0.5 rounded font-mono">
                        82 / 100
                      </span>
                    </div>
                    <div className="w-full h-3 rounded-full bg-gray-200 border-2 border-black overflow-hidden p-0.5">
                      <div
                        className="h-full bg-black rounded-full"
                        style={{ width: "82%" }}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-1 text-[11px] font-mono font-bold text-black/70 pt-1">
                      <div>🎯 50% Skill: 84%</div>
                      <div>⚡ 25% Avail: NOW</div>
                      <div>⭐ 15% Rating: 4.75</div>
                      <div>🏫 10% Lab: CS 301 Lab</div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    <span className="px-2.5 py-1 rounded-xl bg-gray-100 border-2 border-black font-display font-black text-[11px]">
                      Tailwind Fanatic
                    </span>
                    <span className="px-2.5 py-1 rounded-xl bg-gray-100 border-2 border-black font-display font-black text-[11px]">
                      Rapid Responder
                    </span>
                  </div>
                </div>

                <button
                  className="w-full py-3 rounded-2xl bg-white border-3 border-black font-display font-black text-xs uppercase tracking-wider brutal-btn flex items-center justify-center gap-2 hover:bg-black hover:text-white"
                  onClick={() => handleSelectPeer(peer3Name)}
                  type="button"
                >
                  <span>SELECT {peer3Name.toUpperCase()}</span>
                  <span>⚡</span>
                </button>
              </div>
            </div>
          </section>
        )}

        {/* ==========================================
            STAGE 3: 2-KEY CONSENT GATE & CHAT
           ========================================== */}
        {stage === 3 && (
          <section className="flex flex-col gap-6 animate-fade-in">
            {/* Anti-Ghosting 2-Key Gate Banner */}
            <div className="bg-brutal-yellow rounded-3xl border-4 border-black p-6 brutal-shadow flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-black text-brutal-yellow flex items-center justify-center text-3xl font-display font-black brutal-shadow-sm">
                  🔑
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <h2 className="font-display font-black text-xl sm:text-2xl text-black uppercase">
                      Anti-Ghosting 2-Key Consent Gate
                    </h2>
                    <span
                      className={`px-2.5 py-0.5 rounded-lg border border-black font-mono text-xs font-black uppercase ${
                        bothConsented
                          ? "bg-emerald-400 text-black"
                          : userConsented
                          ? "bg-brutal-purple text-black"
                          : peerConsented
                          ? "bg-brutal-pink text-black"
                          : "bg-black text-brutal-yellow"
                      }`}
                    >
                      {bothConsented
                        ? "BOTH KEYS ARMED ⚡"
                        : userConsented
                        ? `Waiting for ${selectedPeer}`
                        : peerConsented
                        ? "Waiting for Your Key"
                        : "Awaiting Both Keys"}
                    </span>
                  </div>
                  <p className="font-headline font-semibold text-xs text-black/80">
                    Both peers must press &apos;GO AHEAD&apos; simultaneously to unlock WebRTC
                    sandbox &amp; bind micro-escrow.
                  </p>
                </div>
              </div>

              {/* Quick Simulator Trigger */}
              <div className="bg-white p-3 rounded-2xl border-3 border-black brutal-shadow-sm flex items-center gap-3">
                <div className="flex flex-col text-right">
                  <span className="font-display font-black text-xs uppercase">
                    Judge Simulator:
                  </span>
                  <span className="font-mono text-[10px] text-black/60">
                    Toggle {selectedPeer}&apos;s Consent
                  </span>
                </div>
                <button
                  className="brutal-btn px-3 py-1.5 rounded-xl bg-brutal-purple border-2 border-black font-display font-black text-xs uppercase flex items-center gap-1"
                  onClick={() => setPeerConsented(!peerConsented)}
                  type="button"
                >
                  <span>
                    {peerConsented
                      ? `🟢 ${selectedPeer} Accepted ✓`
                      : `🔘 Simulate ${selectedPeer}`}
                  </span>
                </button>
              </div>
            </div>

            {/* Chat & Gate Split */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left: Retro Terminal Chat Window */}
              <div className="lg:col-span-7 bg-white rounded-3xl border-4 border-black brutal-shadow flex flex-col h-[520px] overflow-hidden">
                {/* Chat Bar */}
                <div className="p-4 bg-brutal-blue border-b-3 border-black flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-black text-white flex items-center justify-center font-display font-black text-xs">
                      {selectedPeer.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "PR"}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-display font-black text-sm text-black uppercase">
                        {selectedPeer} &amp; You
                      </span>
                      <span className="font-mono text-[11px] font-bold text-black/80 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />{" "}
                        Synced in Campus Lab Room 32-044
                      </span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-xl bg-white border-2 border-black font-mono text-xs font-bold">
                    WebRTC LIVE
                  </span>
                </div>

                {/* Chat Stream */}
                <div className="flex-1 p-5 overflow-y-auto flex flex-col gap-4 bg-[#fcfcf9]">
                  {chatMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex items-start gap-3 max-w-[85%] ${
                        msg.sender === "user"
                          ? "self-end flex-row-reverse"
                          : ""
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-xl border-2 border-black flex items-center justify-center font-display font-black text-xs flex-shrink-0 ${
                          msg.sender === "user"
                            ? "bg-black text-brutal-yellow"
                            : "bg-brutal-yellow"
                        }`}
                      >
                        {msg.avatar}
                      </div>
                      <div
                        className={`flex flex-col gap-1 ${
                          msg.sender === "user" ? "items-end" : ""
                        }`}
                      >
                        <span className="text-[11px] font-mono font-bold text-black/60">
                          {msg.senderName} · {msg.time}
                        </span>
                        <div
                          className={`p-3.5 rounded-2xl border-3 border-black brutal-shadow-sm text-black font-headline text-xs leading-relaxed ${
                            msg.sender === "user"
                              ? "rounded-tr-none bg-brutal-purple font-bold"
                              : "rounded-tl-none bg-white font-semibold"
                          }`}
                        >
                          {msg.text}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Chat Input */}
                <div className="p-3 bg-white border-t-3 border-black flex items-center gap-2">
                  <input
                    className="flex-1 px-4 py-2.5 rounded-2xl bg-[#fffdf0] border-2 border-black text-black font-headline font-bold text-xs focus:outline-none"
                    placeholder={`Type instant reply to ${selectedPeer}...`}
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        sendChatMessage();
                      }
                    }}
                  />
                  <button
                    className="brutal-btn px-4 py-2.5 rounded-2xl bg-black text-brutal-yellow font-display font-black text-xs uppercase"
                    onClick={sendChatMessage}
                    type="button"
                  >
                    SEND ⚡
                  </button>
                </div>
              </div>

              {/* Right: Dual Key Consent Physical Switches */}
              <div className="lg:col-span-5 flex flex-col gap-6">
                <div className="bg-white rounded-3xl border-4 border-black p-6 brutal-shadow flex flex-col gap-5">
                  <div className="flex items-center justify-between border-b-2 border-black pb-3">
                    <span className="font-display font-black text-base text-black uppercase">
                      Physical Key Consents
                    </span>
                    <span className="font-mono text-xs font-bold bg-brutal-yellow px-2 py-0.5 rounded border border-black">
                      {Number(userConsented) + Number(peerConsented)} of 2 Needed
                    </span>
                  </div>

                  {/* Key 1: You */}
                  <div className="p-4 rounded-2xl bg-[#fffdf0] border-3 border-black brutal-shadow-sm flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-black text-brutal-yellow flex items-center justify-center font-display font-black text-sm">
                        ME
                      </div>
                      <div className="flex flex-col">
                        <span className="font-display font-black text-sm text-black">
                          Your Key
                        </span>
                        <span
                          className={`font-mono text-xs ${
                            userConsented
                              ? "font-black text-emerald-600"
                              : "font-bold text-red-600"
                          }`}
                        >
                          {userConsented ? "Key Activated (Ready)" : "Not turned"}
                        </span>
                      </div>
                    </div>
                    <button
                      className={`brutal-btn px-4 py-2 rounded-xl border-2 border-black font-display font-black text-xs uppercase ${
                        userConsented
                          ? "bg-brutal-mint text-black"
                          : "bg-black text-brutal-yellow"
                      }`}
                      onClick={() => setUserConsented(!userConsented)}
                      type="button"
                    >
                      {userConsented ? "KEY TURNED ✓" : "TURN KEY (GO AHEAD)"}
                    </button>
                  </div>

                  {/* Key 2: Peer */}
                  <div className="p-4 rounded-2xl bg-[#fffdf0] border-3 border-black brutal-shadow-sm flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-brutal-yellow border-2 border-black flex items-center justify-center font-display font-black text-sm">
                        {selectedPeer.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "PR"}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-display font-black text-sm text-black">
                          {selectedPeer}&apos;s Key
                        </span>
                        <span
                          className={`font-mono text-xs ${
                            peerConsented
                              ? "font-black text-emerald-600"
                              : "font-bold text-black/60"
                          }`}
                        >
                          {peerConsented
                            ? "Key Activated (Ready)"
                            : "Awaiting peer..."}
                        </span>
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1.5 rounded-xl border-2 border-black font-display font-black text-xs uppercase ${
                        peerConsented ? "bg-brutal-mint" : "bg-gray-200"
                      }`}
                    >
                      {peerConsented ? "KEY TURNED" : "WAITING"}
                    </span>
                  </div>

                  {/* Unlocked Banner */}
                  {bothConsented && (
                    <div className="p-5 rounded-2xl bg-brutal-mint border-4 border-black brutal-shadow flex flex-col gap-3 transition-all animate-scale-in">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">🎉</span>
                        <span className="font-display font-black text-base uppercase">
                          BOTH KEYS TURNED! ESCROW ARMED!
                        </span>
                      </div>
                      <p className="font-headline font-semibold text-xs text-black/80">
                        Code sandbox unlocked in Room 32-044. 1 CR escrow locked in mutual contract.
                      </p>
                      <button
                        className="brutal-btn w-full py-3 rounded-xl bg-black text-brutal-mint font-display font-black text-xs uppercase tracking-wider"
                        onClick={() => switchStage(4)}
                        type="button"
                      >
                        PROCEED TO AGREEMENT &amp; CARD 🚀
                      </button>
                    </div>
                  )}
                </div>

                {/* Sync Tools Mini Bento */}
                <div className="bg-brutal-pink rounded-3xl border-4 border-black p-5 brutal-shadow flex flex-col gap-3">
                  <span className="font-display font-black text-xs uppercase text-black">
                    Active Sandbox Hardware
                  </span>
                  <div className="flex items-center justify-between bg-white p-3 rounded-2xl border-2 border-black text-xs font-mono font-bold">
                    <div className="flex items-center gap-2">
                      <span>💻</span> MIT VS Code LiveShare
                    </div>
                    <span className="text-emerald-600">CONNECTED</span>
                  </div>
                  <div className="flex items-center justify-between bg-white p-3 rounded-2xl border-2 border-black text-xs font-mono font-bold">
                    <div className="flex items-center gap-2">
                      <span>🎙️</span> Encrypted Audio Link
                    </div>
                    <span className="text-emerald-600">ACTIVE</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ==========================================
            STAGE 4: AGREEMENT & MINTED VERIFIED CARD
           ========================================== */}
        {stage === 4 && (
          <section className="flex flex-col gap-6 animate-fade-in">
            {/* Deliverable Agreement */}
            <div className="bg-white rounded-3xl border-4 border-black p-6 md:p-8 brutal-shadow flex flex-col gap-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-3 border-black pb-4">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-xl bg-black text-brutal-yellow font-display font-black text-xs uppercase">
                      Smart Contract Active
                    </span>
                    <span className="font-mono text-xs font-bold text-black/70">
                      #SB-ETH-0294
                    </span>
                  </div>
                  <h2 className="font-display font-black text-2xl md:text-3xl text-black uppercase tracking-tight">
                    Peer Quest Deliverable Sign-Off
                  </h2>
                </div>

                {/* Completion Trigger Button */}
                <button
                  className={`brutal-btn px-6 py-3.5 rounded-2xl border-3 border-black font-display font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 ${
                    projectMinted
                      ? "bg-brutal-mint text-black cursor-default"
                      : "bg-brutal-yellow text-black"
                  }`}
                  disabled={projectMinted}
                  onClick={handleCompleteProject}
                  type="button"
                >
                  <span>
                    {projectMinted
                      ? "🏆 PROOF MINTED & +3 CR ADDED!"
                      : "🏆 MARK COMPLETE & MINT (+3 CREDS)"}
                  </span>
                </button>
              </div>

              {/* Agreement Specs Bento */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-brutal-blue border-3 border-black brutal-shadow-sm flex flex-col gap-1">
                  <span className="font-mono text-[10px] font-black uppercase text-black/70">
                    PLAYER ROLES
                  </span>
                  <span className="font-display font-black text-base text-black uppercase">
                    You: Author / Builder
                  </span>
                  <span className="font-headline font-bold text-xs text-black/80">
                    {selectedPeer}: Code Reviewer / Mentor
                  </span>
                </div>
                <div className="p-4 rounded-2xl bg-brutal-purple border-3 border-black brutal-shadow-sm flex flex-col gap-1">
                  <span className="font-mono text-[10px] font-black uppercase text-black/70">
                    SESSION TIME
                  </span>
                  <span className="font-display font-black text-base text-black uppercase">
                    30 Min Sprint
                  </span>
                  <span className="font-headline font-bold text-xs text-black/80">
                    Completed on-time in Lab 32-044
                  </span>
                </div>
                <div className="p-4 rounded-2xl bg-brutal-mint border-3 border-black brutal-shadow-sm flex flex-col gap-1">
                  <span className="font-mono text-[10px] font-black uppercase text-black/70">
                    CREDIT PAYOUT
                  </span>
                  <span className="font-display font-black text-base text-black uppercase">
                    +3 SkillCredits
                  </span>
                  <span className="font-headline font-bold text-xs text-black/80">
                    Minted directly into student balances
                  </span>
                </div>
              </div>

              {/* Deliverable Checklist */}
              <div className="flex flex-col gap-3">
                <span className="font-display font-black text-xs uppercase tracking-wider text-black">
                  Deliverable Acceptance Checklist
                </span>
                <div className="flex flex-col gap-2 font-headline text-xs font-bold">
                  {[
                    "Flexbox container max-width refactored to responsive fluid clamps without overflow.",
                    "Verified across mobile 375px Safari, Chrome, and desktop 1440px displays.",
                    "Passed peer code inspection and committed to student repo.",
                  ].map((item, idx) => (
                    <label
                      key={idx}
                      className="flex items-center gap-3 p-3 rounded-xl bg-[#fffdf0] border-2 border-black cursor-pointer hover:bg-brutal-yellow/20"
                    >
                      <input
                        defaultChecked
                        className="w-5 h-5 rounded border-2 border-black text-black focus:ring-0"
                        type="checkbox"
                      />
                      <span>{item}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* MINTED VERIFIED ARTIFACT CARD */}
            {projectMinted && (
              <div className="flex flex-col gap-4 transition-all animate-scale-in">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
                    <span className="font-display font-black text-xl text-black uppercase">
                      Academic Proof Minted to Ledger!
                    </span>
                  </div>
                  <span className="font-display font-black text-xs uppercase bg-brutal-yellow border-2 border-black px-3 py-1 rounded-xl brutal-shadow-sm">
                    +3 CR Deposited to Your Account
                  </span>
                </div>

                {/* Neo-Brutalist Collectible Certificate Card */}
                <div className="bg-white rounded-3xl border-4 border-black p-6 md:p-8 brutal-shadow-lg relative overflow-hidden flex flex-col gap-6 retro-stripe">
                  <div className="bg-white p-6 rounded-2xl border-4 border-black brutal-shadow flex flex-col gap-6">
                    {/* Card Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-3 border-black pb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-brutal-yellow border-3 border-black brutal-shadow-sm flex items-center justify-center font-display text-3xl">
                          🎓
                        </div>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <h3 className="font-display font-black text-xl sm:text-2xl text-black uppercase">
                              Verified Peer Project Proof
                            </h3>
                            <span className="px-2.5 py-0.5 rounded-lg bg-brutal-mint border border-black font-display font-black text-xs uppercase">
                              VALIDATED
                            </span>
                          </div>
                          <span className="font-mono text-xs font-bold text-black/70">
                            MIT SkillBridge Syndicate · Capstone Protocol 2025
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 bg-[#fffdf0] px-3.5 py-2 rounded-xl border-2 border-black font-mono text-xs font-bold">
                        <span>HASH:</span>
                        <span className="bg-black text-brutal-yellow px-1.5 py-0.5 rounded">
                          0x8F2A...C389
                        </span>
                      </div>
                    </div>

                    {/* Middle Details */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                      <div className="lg:col-span-7 flex flex-col gap-2">
                        <span className="font-mono text-xs font-black uppercase text-black/70">
                          CERTIFIED MODULE
                        </span>
                        <h4 className="font-display font-black text-2xl text-black uppercase">
                          CS 301: Responsive Layout Architecture
                        </h4>
                        <p className="font-headline font-semibold text-xs text-black/80 leading-relaxed">
                          Demonstrated mastery of fluid responsive container
                          hierarchies, dynamic Tailwind breakpoints, and cross-browser
                          box model normalization under peer review.
                        </p>
                        <div className="flex flex-wrap gap-2 pt-2">
                          <span className="px-3 py-1 rounded-xl bg-brutal-yellow border-2 border-black font-display font-black text-xs">
                            CSS Flexbox
                          </span>
                          <span className="px-3 py-1 rounded-xl bg-brutal-mint border-2 border-black font-display font-black text-xs">
                            Tailwind CSS
                          </span>
                          <span className="px-3 py-1 rounded-xl bg-brutal-blue border-2 border-black font-display font-black text-xs">
                            Responsive UI
                          </span>
                          <span className="px-3 py-1 rounded-xl bg-brutal-pink border-2 border-black font-display font-black text-xs">
                            Grade: Exemplary
                          </span>
                        </div>
                      </div>

                      {/* Avatars */}
                      <div className="lg:col-span-5 bg-[#fffdf0] p-4 rounded-2xl border-3 border-black flex flex-col gap-3 font-mono text-xs">
                        <span className="font-display font-black text-xs uppercase">
                          Certified Collaborators
                        </span>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-black text-brutal-yellow flex items-center justify-center font-display font-black text-xs">
                              {playerInitials}
                            </div>
                            <span className="font-bold">{playerName} (Student)</span>
                          </div>
                          <span className="font-black text-emerald-600">+3 CR</span>
                        </div>
                        <div className="h-0.5 bg-black" />
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-brutal-yellow border border-black flex items-center justify-center font-display font-black text-xs">
                              {selectedPeer.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
                            </div>
                            <span className="font-bold">{selectedPeer} (Mentor)</span>
                          </div>
                          <span className="font-black text-emerald-600">+3 CR</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t-2 border-black">
                      <span className="font-mono text-xs font-bold text-black/70">
                        🛡️ Cryptographically sealed by MIT Campus Authority
                      </span>
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <button
                          className="brutal-btn px-4 py-2.5 rounded-xl bg-white border-2 border-black font-display font-black text-xs uppercase"
                          onClick={() =>
                            showToast(
                              "⚡ Artifact CS301_Responsive_Architecture.png downloaded to your device!",
                              "info"
                            )
                          }
                          type="button"
                        >
                          DOWNLOAD CARD 💾
                        </button>
                        <button
                          className="brutal-btn px-4 py-2.5 rounded-xl bg-white border-2 border-black font-display font-black text-xs uppercase"
                          onClick={handleCopyShareLink}
                          type="button"
                        >
                          <span>
                            {copiedLink ? "LINK COPIED! 🚀" : "COPY SHARE LINK 🔗"}
                          </span>
                        </button>
                        <button
                          className="brutal-btn px-5 py-2.5 rounded-xl bg-black text-brutal-yellow font-display font-black text-xs uppercase"
                          onClick={() => switchStage(5)}
                          type="button"
                        >
                          SPEND IN REWARDS STORE 🛍️
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </section>
        )}

        {/* ==========================================
            STAGE 5: REWARD STORE & LOOT VAULT
           ========================================== */}
        {stage === 5 && (
          <section className="flex flex-col gap-6 animate-fade-in">
            {/* Balance Banner */}
            <div className="bg-brutal-yellow rounded-3xl border-4 border-black p-6 md:p-8 brutal-shadow flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex flex-col gap-1">
                <span className="px-3 py-1 rounded-xl bg-black text-brutal-yellow font-display font-black text-xs uppercase w-fit">
                  Campus Zero-Cash Loot
                </span>
                <h2 className="font-display font-black text-3xl md:text-4xl text-black uppercase tracking-tight mt-1">
                  Academic Perks &amp; Trust Ledger
                </h2>
                <p className="font-headline font-semibold text-xs sm:text-sm text-black/80">
                  Redeem purely non-monetary campus privileges or send confidential
                  faculty feedback.
                </p>
              </div>
              <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border-3 border-black brutal-shadow">
                <span className="text-3xl animate-bounce">🪙</span>
                <div className="flex flex-col">
                  <span className="font-mono text-xs font-bold text-black/70">
                    Your Usable Balance:
                  </span>
                  <span className="font-mono font-black text-2xl text-black">
                    {userCredits} CR
                  </span>
                </div>
              </div>
            </div>

            {/* 4 Loot Bento Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  name: "Canteen Lunch Pass",
                  cost: 5,
                  icon: "🥪",
                  color: "bg-brutal-yellow",
                  desc: "Full lunch voucher redeemable at Student Union or North Quad dining facilities.",
                },
                {
                  name: "Faculty Rec Priority",
                  cost: 10,
                  icon: "📜",
                  color: "bg-brutal-purple",
                  desc: "Guaranteed review slot with Department Chair for graduate school endorsements.",
                },
                {
                  name: "24/7 Lab Keycard Pass",
                  cost: 8,
                  icon: "🔑",
                  color: "bg-brutal-mint",
                  desc: "Magnetic card access for 1 month to the Engineering Makerspace & GPU cluster.",
                },
                {
                  name: "Hackathon Fast-Track",
                  cost: 6,
                  icon: "🚀",
                  color: "bg-brutal-pink",
                  desc: "Automatic squad entry and prime demo booth at the MIT Spring Hackathon.",
                },
              ].map((perk) => (
                <div
                  key={perk.name}
                  className="bg-white rounded-3xl border-4 border-black p-6 brutal-shadow flex flex-col justify-between gap-4 hover:-translate-y-1 transition-transform"
                >
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <div
                        className={`w-12 h-12 rounded-2xl ${perk.color} border-3 border-black flex items-center justify-center text-2xl`}
                      >
                        {perk.icon}
                      </div>
                      <span className="font-mono font-black text-base bg-black text-white px-2 py-0.5 rounded-lg">
                        {perk.cost} CR
                      </span>
                    </div>
                    <span className="font-display font-black text-lg text-black uppercase">
                      {perk.name}
                    </span>
                    <p className="font-headline font-medium text-xs text-black/70">
                      {perk.desc}
                    </p>
                  </div>
                  <button
                    className={`brutal-btn w-full py-2.5 rounded-xl ${perk.color} border-2 border-black font-display font-black text-xs uppercase`}
                    onClick={() =>
                      setRedeemModal({
                        open: true,
                        name: perk.name,
                        cost: perk.cost,
                      })
                    }
                    type="button"
                  >
                    REDEEM ({perk.cost} CR) ⚡
                  </button>
                </div>
              ))}
            </div>

            {/* Peer Feedback Bento Section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Feedback Form */}
              <div className="lg:col-span-7 bg-white rounded-3xl border-4 border-black p-6 md:p-8 brutal-shadow flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-black text-brutal-yellow flex items-center justify-center text-2xl">
                    💬
                  </div>
                  <div className="flex flex-col">
                    <span className="font-display font-black text-lg text-black uppercase">
                      Rate Quest Partner {selectedPeer}
                    </span>
                    <span className="font-mono text-xs font-bold text-black/60">
                      Confidential peer review dynamically updates campus trust scores
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="font-display font-black text-xs uppercase text-black">
                    Award Public Badges
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { name: "RELIABLE & PUNCTUAL", icon: "🎖️", color: "bg-brutal-yellow" },
                      { name: "GREAT MENTOR", icon: "🧙", color: "bg-brutal-mint" },
                      { name: "CLEAN CODE HERO", icon: "💻", color: "bg-brutal-blue" },
                    ].map((badge) => {
                      const isAwarded = awardedBadges.includes(badge.name);
                      return (
                        <button
                          key={badge.name}
                          className={`brutal-btn px-3 py-1.5 rounded-xl border-2 border-black font-display font-black text-xs uppercase ${
                            isAwarded ? badge.color : "bg-white"
                          }`}
                          onClick={() => toggleBadge(badge.name)}
                          type="button"
                        >
                          {badge.icon} {badge.name}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-display font-black text-xs uppercase text-black">
                    Private Faculty-Level Feedback
                  </label>
                  <textarea
                    className="w-full p-3.5 rounded-2xl bg-[#fffdf0] border-3 border-black text-black font-headline font-bold text-xs"
                    rows={3}
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                  />
                </div>

                <button
                  className="brutal-btn self-start px-6 py-3 rounded-2xl bg-black text-white font-display font-black text-xs uppercase"
                  onClick={handleSubmitFeedback}
                  type="button"
                >
                  SUBMIT PRIVATE FEEDBACK ✍️
                </button>
              </div>

              {/* Trust Metrics Card */}
              <div className="lg:col-span-5 bg-brutal-blue rounded-3xl border-4 border-black p-6 md:p-8 brutal-shadow flex flex-col justify-between gap-4">
                <div className="flex flex-col gap-3">
                  <span className="font-display font-black text-xs uppercase text-black">
                    Academic Trust Score
                  </span>
                  <div className="flex items-center gap-4">
                    <div className="w-18 h-18 p-3 rounded-2xl bg-black text-brutal-yellow border-3 border-black brutal-shadow-sm flex items-center justify-center font-display font-black text-3xl">
                      99
                    </div>
                    <div className="flex flex-col">
                      <span className="font-display font-black text-lg text-black uppercase">
                        Exemplary Standing
                      </span>
                      <span className="font-mono text-xs font-bold text-black/80">
                        Dean&apos;s Peer Mentorship Honor Roll
                      </span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white border-3 border-black font-mono text-xs flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold">Completed Quests:</span>
                      <span className="font-black">25 Quests</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold">Lifetime Earned:</span>
                      <span className="font-black text-emerald-600">+75 CR</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold">No-Show / Ghost Rate:</span>
                      <span className="font-black text-black">
                        0.0% (Zero Ghosting)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-2">
                  <span className="px-2.5 py-1 rounded-lg bg-brutal-yellow border border-black font-display font-black text-[11px]">
                    🎖️ Reliable (19x)
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-brutal-mint border border-black font-display font-black text-[11px]">
                    🧙 Great Mentor (14x)
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-white border border-black font-display font-black text-[11px]">
                    ⚡ Instant Reply
                  </span>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* ==========================================
          REDEEM MODAL
         ========================================== */}
      {redeemModal.open && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border-4 border-black brutal-shadow-lg flex flex-col gap-4">
            <div className="flex items-center justify-between border-b-2 border-black pb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🛍️</span>
                <span className="font-display font-black text-lg text-black uppercase">
                  Confirm Loot Spend
                </span>
              </div>
              <button
                className="font-mono font-black text-lg hover:text-red-600"
                onClick={() => setRedeemModal({ open: false, name: "", cost: 0 })}
              >
                ✕
              </button>
            </div>
            <p className="font-headline font-semibold text-xs text-black/80 leading-relaxed">
              Confirm spending {redeemModal.cost} academic credits on {redeemModal.name}?
              New student ledger balance will be {userCredits - redeemModal.cost} CR.
            </p>
            <div className="p-4 rounded-2xl bg-brutal-yellow border-3 border-black flex items-center justify-between font-display font-black">
              <span className="text-sm uppercase">{redeemModal.name}</span>
              <span className="text-base bg-black text-brutal-yellow px-2.5 py-1 rounded-xl">
                {redeemModal.cost} CR
              </span>
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                className="brutal-btn px-4 py-2 rounded-xl bg-gray-200 border-2 border-black font-display font-black text-xs uppercase"
                onClick={() => setRedeemModal({ open: false, name: "", cost: 0 })}
              >
                Cancel
              </button>
              <button
                className="brutal-btn px-5 py-2.5 rounded-xl bg-black text-brutal-yellow font-display font-black text-xs uppercase"
                onClick={handleConfirmRedeem}
              >
                CONFIRM UNLOCK ⚡
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          FLOATING ARCADE DEMO SWITCHER / CHEAT DRAWER
         ========================================== */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
        {drawerOpen && (
          <div className="bg-white p-4 rounded-3xl border-4 border-black brutal-shadow-lg flex flex-col gap-2.5 mb-2 w-72 transition-all animate-scale-in">
            <div className="flex items-center justify-between border-b-2 border-black pb-2">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
                <span className="font-display font-black text-xs text-black uppercase">
                  Arcade Stage Switcher
                </span>
              </div>
              <button
                className="font-mono font-bold text-xs"
                onClick={() => setDrawerOpen(false)}
                type="button"
              >
                ✕
              </button>
            </div>

            {/* Active Account Pill */}
            <div className="p-2.5 rounded-xl bg-[#fffdf0] border-2 border-black flex items-center justify-between font-mono text-[11px]">
              <div>
                <span className="text-[9px] uppercase text-black/60 font-black block">Active Account:</span>
                <span className="font-black text-black">{playerName}</span>
              </div>
              <span className="bg-brutal-yellow px-2 py-0.5 rounded border border-black font-black text-xs">
                {userCredits} CR
              </span>
            </div>

            <div className="grid grid-cols-1 gap-1.5 font-display font-black text-xs">
              {[
                { s: 1, label: "01. Post Quest Bento", sub: "Form", color: "hover:bg-brutal-yellow" },
                { s: 2, label: "02. Radar Peer Matches", sub: "Scores", color: "hover:bg-brutal-mint" },
                { s: 3, label: "03. 2-Key Consent Gate", sub: "Chat", color: "hover:bg-brutal-blue" },
                { s: 4, label: "04. Minted Proof Card", sub: "Credential", color: "hover:bg-brutal-pink" },
                { s: 5, label: "05. Loot & Reputation", sub: "Perks", color: "hover:bg-brutal-purple" },
              ].map((item) => (
                <button
                  key={item.s}
                  className={`w-full text-left px-3 py-1.5 rounded-xl ${item.color} border ${
                    stage === item.s ? "border-black bg-gray-100" : "border-transparent"
                  } hover:border-black transition-colors flex items-center justify-between`}
                  onClick={() => {
                    switchStage(item.s);
                  }}
                  type="button"
                >
                  <span>{item.label}</span>
                  <span className="font-mono text-[10px] text-black/60">
                    {item.sub}
                  </span>
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between pt-2 border-t-2 border-black font-mono text-[11px]">
              <button
                className="text-red-600 font-black hover:underline flex items-center gap-1"
                onClick={resetDemoData}
                type="button"
              >
                <span>↺</span> Reset All
              </button>
              <span className="font-bold text-emerald-600">● Live Arcade</span>
            </div>
          </div>
        )}

        <button
          className="brutal-btn flex items-center gap-2 px-4 py-3 rounded-2xl bg-black text-brutal-yellow font-display font-black text-xs uppercase tracking-wider border-3 border-black hover:bg-brutal-electric hover:text-white"
          onClick={() => setDrawerOpen(!drawerOpen)}
          type="button"
        >
          <span>🎮</span>
          <span>Arcade Switcher</span>
        </button>
      </div>
    </div>
  );
}
