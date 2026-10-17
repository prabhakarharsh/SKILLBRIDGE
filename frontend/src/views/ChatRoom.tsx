"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "@/utils/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import { useDemoPanel } from "@/hooks/useDemoPanel";
import { Avatar } from "@/components/ui/Avatar";
import { ArrowLeft, Send, CheckCircle2, ShieldAlert, ArrowRight, Loader2, Sparkles, Terminal } from "lucide-react";
import { consentService } from "@/services/consentService";
import { matchService } from "@/services/matchService";
import { needService } from "@/services/needService";
import { userService } from "@/services/userService";
import { formatRelativeTime, classNames } from "@/utils/helpers";
import { ConsentButton, ConsentStatus } from "@/components/chat/ConsentButton";
import { Navbar } from "@/components/layout/Navbar";
import type { Collaboration } from "@/types";

const MOCK_MESSAGES = [
  { id: "1", fromMe: false, text: "Hey! I saw your quest on the syndicate radar and I can definitely build this with you.", time: "2 min ago" },
  { id: "2", fromMe: true, text: "Awesome! I need to ensure the architecture is clean and ready for peer review.", time: "1 min ago" },
  { id: "3", fromMe: false, text: "No problem at all! I'm free this afternoon. Let's turn our consent keys and lock in the agreement.", time: "Just now" },
];

export function ChatRoom() {
  const { matchId } = useParams<{ matchId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const { demoState, setSimulatedConsent } = useDemoPanel();

  const [collaboration, setCollaboration] = useState<Collaboration | null>(null);
  const [match, setMatch] = useState<any>(null);
  const [need, setNeed] = useState<any>(null);
  const [seeker, setSeeker] = useState<any>(null);
  const [provider, setProvider] = useState<any>(null);
  const [messages, setMessages] = useState<typeof MOCK_MESSAGES>(MOCK_MESSAGES);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [consentLoading, setConsentLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (matchId) loadData();
  }, [matchId]);

  const loadData = async () => {
    if (!matchId || !user) return;
    setLoading(true);
    try {
      const [collabData, matchData, needData, seekerData, providerData] = await Promise.all([
        consentService.getCollaborationByMatchId(matchId),
        matchService.getMatch(matchId),
        matchService.getMatch(matchId).then(m => m ? needService.getNeed(m.needId) : null),
        matchService.getMatch(matchId).then(m => m ? userService.getUser(m.seekerId) : null),
        matchService.getMatch(matchId).then(m => m ? userService.getUser(m.providerId) : null),
      ]);
      
      // If no collaboration exists, create one
      let collab = collabData;
      if (!collab) {
        collab = await consentService.createCollaboration(matchId);
      }
      
      setCollaboration(collab);
      setMatch(matchData);
      setNeed(needData);
      setSeeker(seekerData);
      setProvider(providerData);
    } catch (e) {
      console.error("Failed to load chat:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const isSeeker = user?.id === collaboration?.participants[0];
  const myConsent = collaboration?.consentStatus[user?.id || ""] || "pending";
  const otherId = collaboration?.participants.find(p => p !== user?.id);
  const otherConsent = otherId ? collaboration?.consentStatus[otherId] || "pending" : "pending";
  const otherUser = isSeeker ? provider : seeker;

  // Handle demo panel simulated consent
  const effectiveOtherConsent = demoState.simulatedPartnerConsent !== "pending" 
    ? demoState.simulatedPartnerConsent 
    : otherConsent;

  const mutualConsent = myConsent === "accepted" && effectiveOtherConsent === "accepted";

  const handleAccept = async () => {
    if (!collaboration || !user) return;
    setConsentLoading(true);
    try {
      await consentService.updateConsent(collaboration.id, user.id, "accepted");
      showToast("Key turned! Cryptographic signature active.");
      loadData();
    } catch (e) {
      showToast("Failed to turn key", "error");
    } finally {
      setConsentLoading(false);
    }
  };

  const handleReject = async () => {
    if (!collaboration || !user) return;
    setConsentLoading(true);
    try {
      await consentService.updateConsent(collaboration.id, user.id, "rejected");
      showToast("Collaboration declined");
      navigate("/dashboard");
    } catch (e) {
      showToast("Failed to reject", "error");
    } finally {
      setConsentLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || sending) return;
    const msg = { id: Date.now().toString(), fromMe: true, text: newMessage.trim(), time: "Just now" };
    setMessages(prev => [...prev, msg]);
    setNewMessage("");
    // Simulate peer reply
    setTimeout(() => {
      const replies = [
        "Sounds perfect! I'm ready to turn my key whenever you are.",
        "Got it! Let's build this together.",
        "Understood. Reviewing the deliverables list now.",
        "Great! Let's lock in the project card.",
      ];
      setMessages(prev => [...prev, { 
        id: (Date.now() + 1).toString(), 
        fromMe: false, 
        text: replies[Math.floor(Math.random() * replies.length)], 
        time: "Just now" 
      }]);
    }, 1200);
  };

  const handleProceedToAgreement = () => {
    navigate(`/agreement/${matchId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fefce8] pixel-pattern font-headline text-black antialiased flex items-center justify-center">
        <Navbar />
        <div className="bg-white rounded-3xl border-4 border-black p-8 text-center brutal-shadow animate-pulse">
          <div className="w-12 h-12 rounded-xl bg-brutal-yellow border-3 border-black mx-auto mb-3 flex items-center justify-center text-xl">
            ⚡
          </div>
          <div className="font-display font-black text-lg uppercase">INITIALIZING 2-KEY GATE...</div>
        </div>
      </div>
    );
  }

  if (!collaboration || !match || !need) {
    return (
      <div className="min-h-screen bg-[#fefce8] pixel-pattern font-headline text-black antialiased flex items-center justify-center p-4">
        <Navbar />
        <div className="max-w-md w-full bg-white rounded-3xl border-4 border-black p-8 text-center brutal-shadow">
          <div className="w-16 h-16 rounded-2xl bg-brutal-pink border-3 border-black mx-auto mb-4 flex items-center justify-center text-3xl">
            ⚠️
          </div>
          <h2 className="font-display font-black text-2xl uppercase tracking-tight text-black mb-2">Gate Offline</h2>
          <p className="font-mono text-sm text-black/70 mb-6">Unable to synchronize collaboration session.</p>
          <button
            onClick={() => navigate("/dashboard")}
            className="brutal-btn w-full px-5 py-3 rounded-2xl bg-brutal-yellow border-3 border-black font-display font-black text-sm uppercase"
          >
            Back to Terminal
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fefce8] pixel-pattern font-headline text-black antialiased flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 pt-24 pb-12 flex flex-col">
        {/* Navigation & Peer Header */}
        <div className="mb-4">
          <button 
            onClick={() => navigate(-1)} 
            className="mb-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border-2 border-black font-mono font-bold text-xs uppercase brutal-shadow-sm hover:-translate-y-0.5 transition-transform"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Matches</span>
          </button>

          {/* Peer Info Card */}
          <div className="bg-white rounded-3xl border-4 border-black p-4 md:p-6 brutal-shadow flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Avatar name={otherUser?.name || "Peer Co-builder"} size="lg" verified={otherUser?.isVerified} />
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-display font-black text-lg md:text-xl uppercase tracking-tight text-black">
                    {otherUser?.name || "Peer Co-builder"}
                  </h2>
                  {otherUser?.isVerified && (
                    <span className="bg-brutal-mint border-2 border-black font-mono font-black text-[10px] uppercase px-2 py-0.5 rounded-md">
                      VERIFIED
                    </span>
                  )}
                </div>
                <p className="font-mono text-xs text-black/70 font-bold">
                  {otherUser?.branch} • YEAR {otherUser?.year} • CAMPUS NODE
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-brutal-mint border-2 border-black font-mono text-xs font-black">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping"></span>
                <span>WEBRTC ACTIVE</span>
              </span>
              <span className="px-3 py-1 rounded-full bg-brutal-yellow border-2 border-black font-mono text-xs font-black">
                🪙 1 CR ESCROW STAKE
              </span>
            </div>
          </div>
        </div>

        {/* Consent Status Indicator */}
        <ConsentStatus 
          myConsent={myConsent} 
          otherConsent={effectiveOtherConsent} 
          otherName={otherUser?.name || "Peer"} 
        />

        {/* Terminal Chat Window */}
        <div className="flex-1 bg-white rounded-3xl border-4 border-black p-4 brutal-shadow flex flex-col min-h-[350px] mb-4 overflow-hidden">
          {/* Terminal Title Bar */}
          <div className="flex items-center justify-between pb-3 mb-3 border-b-2 border-black font-mono text-xs font-bold text-black/70">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-black" />
              <span>TERMINAL // 2-KEY LIVE PROTOCOL CHANNEL</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-400 border border-black"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 border border-black"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 border border-black"></span>
            </div>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-1 max-h-[380px]">
            {messages.map(msg => (
              <div key={msg.id} className={classNames("flex gap-2.5", msg.fromMe && "flex-row-reverse")}>
                {!msg.fromMe && (
                  <div className="w-8 h-8 rounded-xl bg-brutal-purple border-2 border-black font-display font-black text-xs flex items-center justify-center flex-shrink-0">
                    {otherUser?.name?.charAt(0) || "P"}
                  </div>
                )}
                <div className={classNames("max-w-[75%] flex flex-col", msg.fromMe ? "items-end" : "items-start")}>
                  <div className={classNames(
                    "px-4 py-2.5 rounded-2xl border-2.5 border-black font-headline text-sm font-medium brutal-shadow-sm",
                    msg.fromMe 
                      ? "bg-brutal-yellow text-black" 
                      : "bg-[#fffdf0] text-black"
                  )}>
                    {msg.text}
                  </div>
                  <span className="text-[10px] font-mono font-bold text-black/50 mt-1 px-1">{msg.time}</span>
                </div>
                {msg.fromMe && (
                  <div className="w-8 h-8 rounded-xl bg-brutal-yellow border-2 border-black font-display font-black text-xs flex items-center justify-center flex-shrink-0">
                    ME
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input Dock */}
          <div className="pt-3 mt-3 border-t-2 border-black flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSendMessage()}
              placeholder="Type transmission to peer co-builder..."
              className="flex-1 bg-[#fffdf0] border-3 border-black rounded-2xl px-4 py-2.5 font-mono text-xs font-bold text-black focus:outline-none focus:ring-2 focus:ring-black brutal-shadow-sm"
            />
            <button
              type="button"
              onClick={handleSendMessage}
              disabled={sending || !newMessage.trim()}
              className="brutal-btn px-4 py-2.5 rounded-2xl bg-black text-brutal-yellow border-3 border-black font-display font-black text-xs uppercase flex items-center gap-1.5"
            >
              <span>SEND</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 2-Key Consent Cryptographic Gate */}
        <ConsentButton
          myConsent={myConsent}
          otherConsent={effectiveOtherConsent}
          onAccept={handleAccept}
          onReject={handleReject}
          disabled={consentLoading}
          isMutual={mutualConsent}
        />

        {/* Unlocked Banner when Mutual Consent Achieved */}
        {mutualConsent && (
          <div className="mt-4 p-6 bg-brutal-mint rounded-3xl border-4 border-black brutal-shadow animate-scale-in">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">🔓</span>
                <div>
                  <h4 className="font-display font-black text-lg uppercase text-black">
                    Zero-Cash Smart Escrow Unlocked!
                  </h4>
                  <p className="font-mono text-xs text-black/80">
                    Both cryptographic keys are verified. Proceed to define your project roles and deliverables.
                  </p>
                </div>
              </div>
              <button 
                type="button"
                onClick={handleProceedToAgreement}
                className="brutal-btn px-6 py-3.5 rounded-2xl bg-black text-white hover:bg-neutral-900 border-3 border-black font-display font-black text-sm uppercase flex items-center gap-2"
              >
                <span>DEFINE AGREEMENT</span>
                <ArrowRight className="w-4 h-4 text-brutal-yellow" />
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}