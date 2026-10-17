"use client";

import React from "react";
import { ProjectCard as ProjectCardType } from "@/types";
import { Avatar } from "@/components/ui/Avatar";
import { formatDate } from "@/utils/helpers";
import { Download, Copy, Share2, CheckCircle2, ShieldCheck, Sparkles, Hash } from "lucide-react";
import html2canvas from "html2canvas";

interface ProjectCardDisplayProps {
  card: ProjectCardType;
  onDownload?: () => void;
  onShare?: () => void;
  showActions?: boolean;
  compact?: boolean;
}

export function ProjectCardDisplay({ 
  card, 
  onDownload, 
  onShare, 
  showActions = true,
  compact = false 
}: ProjectCardDisplayProps) {
  const cardRef = React.useRef<HTMLDivElement>(null);
  const [copiedHash, setCopiedHash] = React.useState(false);

  const mockHash = card.shareToken 
    ? `0x${card.shareToken.toUpperCase().slice(0, 16)}...` 
    : "0x8F2A9B71C4E...C389";

  const handleDownload = async () => {
    if (!cardRef.current) return;
    
    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: "#ffffff",
        scale: 2,
        logging: false,
        useCORS: true,
      });
      
      const link = document.createElement("a");
      link.download = `${card.title.replace(/\s+/g, "-")}-verified-credential.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      
      onDownload?.();
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  const handleCopyHash = () => {
    navigator.clipboard.writeText(mockHash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Physical Minted Credential Card */}
      <div 
        ref={cardRef}
        className="bg-white rounded-3xl border-4 border-black p-6 md:p-8 brutal-shadow-lg relative overflow-hidden"
      >
        {/* Retro Stripe Ribbon Banner */}
        <div className="retro-stripe -mx-6 md:-mx-8 -mt-6 md:-mt-8 p-4 border-b-4 border-black flex flex-wrap items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-2 bg-black text-brutal-yellow px-3 py-1.5 rounded-xl border-2 border-black font-mono font-black text-xs uppercase brutal-shadow-sm">
            <span>🛡️</span>
            <span>VERIFIED SYNDICATE CREDENTIAL</span>
          </div>
          <div className="bg-white border-2 border-black px-3 py-1 rounded-xl font-mono font-black text-xs uppercase text-black">
            #{card.verificationBadge || "SB-ETH-0294"}
          </div>
        </div>

        {/* Header Details */}
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-brutal-mint border-2 border-black font-mono font-black text-xs uppercase px-2.5 py-0.5 rounded-lg">
                ZERO-CASH VERIFIED
              </span>
              <span className="font-mono font-bold text-xs text-black/60">
                {formatDate(card.startDate)} – {formatDate(card.endDate)}
              </span>
            </div>
            <h1 className="font-display font-black text-2xl md:text-3xl uppercase tracking-tight text-black">
              {card.title}
            </h1>
          </div>

          {/* Cryptographic Hash Badge */}
          <button 
            type="button"
            onClick={handleCopyHash}
            title="Click to copy hash"
            className="flex items-center gap-2 bg-black text-brutal-yellow border-2 border-black px-3 py-1.5 rounded-xl font-mono text-xs font-black brutal-shadow-sm hover:scale-105 transition-transform"
          >
            <Hash className="w-3.5 h-3.5 text-brutal-yellow" />
            <span>{copiedHash ? "HASH COPIED!" : mockHash}</span>
          </button>
        </div>

        {/* Deliverable Description */}
        <div className="p-4 rounded-2xl bg-[#fffdf0] border-3 border-black brutal-shadow-sm mb-6">
          <div className="text-[10px] font-mono font-black uppercase text-black/60 mb-1">
            DELIVERABLE SPECIFICATION & PEER SIGN-OFF:
          </div>
          <p className="font-headline text-sm font-medium text-black">
            {card.description}
          </p>
        </div>

        {/* Co-Builders Grid */}
        <div className="mb-6">
          <div className="text-xs font-mono font-black uppercase text-black mb-3 flex items-center gap-2">
            <span>👥</span>
            <span>VERIFIED SQUAD PARTICIPANTS & CONTRIBUTIONS:</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {card.participants.map((participant) => {
              const role = card.roles.find(r => r.userId === participant.userId);
              return (
                <div key={participant.userId} className="p-4 rounded-2xl bg-brutal-purple/20 border-3 border-black">
                  <div className="flex items-center gap-3 mb-2">
                    <Avatar name={participant.name} size="md" verified />
                    <div>
                      <div className="font-display font-black text-sm uppercase text-black">
                        {participant.name}
                      </div>
                      <div className="font-mono text-xs font-black text-purple-900">
                        {role?.roleTitle || participant.role}
                      </div>
                    </div>
                  </div>

                  {role?.responsibilities && role.responsibilities.length > 0 && (
                    <div className="mt-2 text-xs font-mono text-black/80 space-y-1">
                      {role.responsibilities.map((resp, i) => (
                        <div key={i} className="flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                          <span>{resp}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Skills Demonstrated Stickers */}
        <div className="mb-6">
          <div className="text-[10px] font-mono font-black uppercase text-black/60 mb-2">
            ACCREDITED SKILLSETS:
          </div>
          <div className="flex flex-wrap gap-2">
            {card.skillsUsed.map((skill, i) => (
              <span key={i} className="bg-brutal-yellow border-2 border-black font-mono font-bold text-xs px-3 py-1 rounded-xl brutal-shadow-sm">
                #{skill}
              </span>
            ))}
          </div>
        </div>

        {/* Stamped Seal */}
        <div className="pt-4 border-t-3 border-black flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-mono text-xs font-bold text-black/70">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <span>CAMPUS SYNDICATE PROTOCOL • TIME-STAMP VERIFIED</span>
          </div>
          <div className="border-2 border-black bg-brutal-mint px-3 py-1 rounded-xl font-mono font-black text-xs uppercase sticker-rotate-right">
            PEER VERIFIED SEAL ⭐
          </div>
        </div>
      </div>

      {/* Action CTA Bar */}
      {showActions && (
        <div className="mt-6 flex flex-wrap gap-3 justify-center">
          <button
            type="button"
            onClick={handleDownload}
            className="brutal-btn px-5 py-3 rounded-2xl bg-brutal-yellow border-3 border-black font-display font-black text-xs uppercase flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>DOWNLOAD BADGE (.PNG)</span>
          </button>
          <button
            type="button"
            onClick={onShare}
            className="brutal-btn px-5 py-3 rounded-2xl bg-white border-3 border-black font-display font-black text-xs uppercase flex items-center gap-2"
          >
            <Share2 className="w-4 h-4" />
            <span>SHARE VERIFIABLE URL</span>
          </button>
        </div>
      )}
    </div>
  );
}