"use client";

import React, { useState, useEffect } from "react";
import { CheckCircle2, KeyRound, Lock, Unlock, XCircle, Clock } from "lucide-react";
import { classNames } from "@/utils/helpers";

type ConsentState = "pending" | "accepted" | "rejected";

interface ConsentButtonProps {
  myConsent: ConsentState;
  otherConsent: ConsentState;
  onAccept: () => void;
  onReject: () => void;
  disabled?: boolean;
  isMutual?: boolean;
}

export function ConsentButton({ 
  myConsent, 
  otherConsent, 
  onAccept, 
  onReject, 
  disabled = false,
  isMutual = false 
}: ConsentButtonProps) {
  const isMyAccepted = myConsent === "accepted";
  const isOtherAccepted = otherConsent === "accepted";

  return (
    <div className="bg-white rounded-3xl border-4 border-black p-5 brutal-shadow">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <KeyRound className="w-5 h-5 text-black" />
          <h4 className="font-display font-black text-sm uppercase tracking-tight text-black">
            2-Key Cryptographic Consent Gate
          </h4>
        </div>
        <div className={classNames(
          "px-3 py-1 rounded-xl border-2 border-black font-mono font-black text-[10px] uppercase flex items-center gap-1.5",
          isMutual ? "bg-brutal-mint text-black" : "bg-brutal-yellow text-black"
        )}>
          {isMutual ? (
            <>
              <Unlock className="w-3.5 h-3.5" />
              <span>ESCROW UNLOCKED</span>
            </>
          ) : (
            <>
              <Lock className="w-3.5 h-3.5" />
              <span>ESCROW TIME-LOCKED</span>
            </>
          )}
        </div>
      </div>

      {/* Dual Key Visual Interface */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        {/* Key 1: You */}
        <div className={classNames(
          "p-4 rounded-2xl border-3 border-black transition-all",
          isMyAccepted ? "bg-brutal-mint/50" : "bg-brutal-yellow/30"
        )}>
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono font-black text-xs uppercase">KEY 01: YOU</span>
            <span className={classNames(
              "w-3 h-3 rounded-full border border-black",
              isMyAccepted ? "bg-emerald-500 animate-ping" : "bg-amber-400"
            )}></span>
          </div>
          <div className="font-display font-black text-base text-black mb-3">
            {isMyAccepted ? "KEY TURNED & LOCKED IN" : "AWAITING YOUR KEY TURN"}
          </div>

          {!isMyAccepted ? (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onAccept}
                disabled={disabled}
                className="brutal-btn flex-1 bg-brutal-yellow hover:bg-brutal-yellow-dark border-2 border-black font-display font-black text-xs uppercase py-2 px-3 rounded-xl flex items-center justify-center gap-1.5"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>TURN KEY (ACCEPT)</span>
              </button>
              <button
                type="button"
                onClick={onReject}
                disabled={disabled}
                className="brutal-btn bg-white hover:bg-red-50 border-2 border-black font-mono font-bold text-xs uppercase py-2 px-3 rounded-xl text-red-600"
              >
                DECLINE
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs font-mono font-black text-emerald-800 bg-white/80 p-2 rounded-xl border border-black">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>CRYPTO SIGNATURE ACTIVE</span>
            </div>
          )}
        </div>

        {/* Key 2: Peer */}
        <div className={classNames(
          "p-4 rounded-2xl border-3 border-black transition-all",
          isOtherAccepted ? "bg-brutal-mint/50" : "bg-gray-100"
        )}>
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono font-black text-xs uppercase">KEY 02: PEER CO-BUILDER</span>
            <span className={classNames(
              "w-3 h-3 rounded-full border border-black",
              isOtherAccepted ? "bg-emerald-500 animate-ping" : "bg-gray-400"
            )}></span>
          </div>
          <div className="font-display font-black text-base text-black mb-3">
            {isOtherAccepted ? "PEER KEY TURNED & VERIFIED" : "WAITING FOR PEER KEY TURN"}
          </div>

          <div className="flex items-center gap-2 text-xs font-mono font-black text-black/80 bg-white/80 p-2 rounded-xl border border-black">
            {isOtherAccepted ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>PEER CONSENT CONFIRMED</span>
              </>
            ) : (
              <>
                <Clock className="w-4 h-4 text-amber-500 animate-spin" />
                <span>LISTENING ON WEBRTC LIVE MESH</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface ConsentStatusProps {
  myConsent: ConsentState;
  otherConsent: ConsentState;
  otherName: string;
}

export function ConsentStatus({ myConsent, otherConsent, otherName }: ConsentStatusProps) {
  const isMutual = myConsent === "accepted" && otherConsent === "accepted";

  return (
    <div className={classNames(
      "mb-4 p-4 rounded-2xl border-3 border-black brutal-shadow-sm flex items-center justify-between flex-wrap gap-2",
      isMutual ? "bg-brutal-mint" : "bg-brutal-yellow"
    )}>
      <div className="flex items-center gap-2.5">
        <span className="text-xl">{isMutual ? "🎉" : "🛡️"}</span>
        <div>
          <div className="font-display font-black text-sm uppercase text-black">
            {isMutual 
              ? "DUAL CRYPTO-CONSENT ACHIEVED!" 
              : "2-KEY MUTUAL CONSENT IN PROGRESS"}
          </div>
          <div className="font-mono text-xs text-black/70">
            {isMutual
              ? "Both participants turned their keys. Zero-cash escrow unlocked."
              : myConsent === "accepted"
              ? `Your key is turned. Waiting for ${otherName} to turn their key.`
              : otherConsent === "accepted"
              ? `${otherName} has already turned their key! Turn yours to begin.`
              : `Chat to verify details, then both turn keys to start.`}
          </div>
        </div>
      </div>
      <div className="font-mono font-black text-xs uppercase px-2.5 py-1 bg-white border-2 border-black rounded-lg">
        {isMutual ? "READY FOR AGREEMENT" : "GATE 03 PENDING"}
      </div>
    </div>
  );
}