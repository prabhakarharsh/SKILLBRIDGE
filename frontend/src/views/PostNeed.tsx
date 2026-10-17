"use client";

import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "@/utils/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import { ArrowLeft, Target, Users, Clock, Calendar, UserPlus, X, CreditCard, Plus, Rocket } from "lucide-react";
import { SKILLS_LIST } from "@/utils/constants";
import { needService } from "@/services/needService";
import { creditService } from "@/services/creditService";
import { Navbar } from "@/components/layout/Navbar";
import type { NeedMode, Role } from "@/types";

export function PostNeed() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { showToast } = useToast();

  const initialMode = (searchParams.get("mode") as NeedMode) || "learn";
  const [mode, setMode] = useState<NeedMode>(initialMode);
  const [title, setTitle] = useState("Fix Responsive Flexbox Container & Breakpoints on Mobile");
  const [description, setDescription] = useState(
    "Responsive layout without horizontal overflow on 375px mobile & 1440px desktop displays, confirmed with synchronous code review."
  );
  const [requiredSkills, setRequiredSkills] = useState<string[]>([
    "CSS Flexbox",
    "Tailwind CSS",
    "React.js",
  ]);
  const [customTagInput, setCustomTagInput] = useState("");
  const [duration, setDuration] = useState(30);
  const [deadline, setDeadline] = useState("");
  const [roles, setRoles] = useState<Role[]>([
    { id: "1", title: "Code Reviewer / Mentor", skills: ["React.js", "CSS Flexbox"], description: "Help debug layout clamps" },
  ]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [canAfford, setCanAfford] = useState(true);

  useEffect(() => {
    if (user && mode === "learn") {
      creditService.canAfford(user.id, 1).then(setCanAfford);
    }
  }, [user, mode]);

  const addTag = (name: string) => {
    if (!name.trim()) return;
    if (requiredSkills.some((s) => s.toLowerCase() === name.toLowerCase())) return;
    setRequiredSkills([...requiredSkills, name.trim()]);
    setCustomTagInput("");
    setErrors((prev) => ({ ...prev, skills: "" }));
  };

  const removeTag = (name: string) => {
    setRequiredSkills(requiredSkills.filter((s) => s !== name));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!title.trim() || title.length < 5) newErrors.title = "Headline must be at least 5 characters";
    if (!description.trim() || description.length < 15) newErrors.description = "Deliverable victory condition must be at least 15 characters";
    if (requiredSkills.length === 0) newErrors.skills = "Add at least one required skill sticker";

    if (mode === "learn") {
      if (!duration || duration < 15 || duration > 120) newErrors.duration = "Duration must be 15-120 minutes";
      if (!canAfford) newErrors.credits = "Insufficient credits (need 1 credit stake)";
    } else {
      if (!deadline) newErrors.deadline = "Deadline is required";
      else if (new Date(deadline) <= new Date()) newErrors.deadline = "Deadline must be in the future";
      if (roles.length === 0 || roles.some((r) => !r.title.trim())) newErrors.roles = "At least one role title required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || !user) return;

    setLoading(true);
    try {
      const need = await needService.createNeed({
        authorId: user.id,
        mode,
        title: title.trim(),
        description: description.trim(),
        requiredSkills,
        duration: mode === "learn" ? duration : undefined,
        deadline: mode === "buddy" ? deadline : undefined,
        rolesNeeded: mode === "buddy" ? roles : undefined,
      });

      if (mode === "learn") {
        await creditService.spendCredits(user.id, "request-help", need.id);
      }

      showToast("🚀 Campus Radar Active: Escrow Staked! Scanning peers...", "success");
      navigate(`/matches/${need.id}`);
    } catch (err) {
      showToast("Failed to post quest", "error");
    } finally {
      setLoading(false);
    }
  };

  const addRole = () => {
    setRoles([...roles, { id: Date.now().toString(), title: "", skills: [], description: "" }]);
  };

  const removeRole = (index: number) => {
    if (roles.length <= 1) return;
    setRoles(roles.filter((_, i) => i !== index));
  };

  const updateRole = (index: number, field: keyof Role, value: any) => {
    setRoles(roles.map((r, i) => (i === index ? { ...r, [field]: value } : r)));
  };

  return (
    <div className="min-h-screen bg-[#fefce8] pixel-pattern font-headline text-black antialiased selection:bg-black selection:text-brutal-yellow">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 md:px-8 py-8 flex flex-col gap-6">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="brutal-btn px-4 py-2 rounded-xl bg-white border-2 border-black font-display font-black text-xs uppercase flex items-center gap-2 hover:bg-brutal-yellow"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
          <span className="font-mono text-xs font-bold bg-white border-2 border-black px-3 py-1 rounded-xl brutal-shadow-sm">
            ID: #QUEST-9804
          </span>
        </div>

        {/* Quest Specification Card */}
        <div className="bg-white rounded-3xl border-4 border-black p-6 md:p-8 brutal-shadow flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-3 border-black pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-brutal-yellow border-3 border-black flex items-center justify-center text-2xl brutal-shadow-sm">
                ✍️
              </div>
              <div>
                <h1 className="font-display font-black text-2xl text-black uppercase tracking-tight">
                  Quest Blueprint
                </h1>
                <p className="font-headline font-semibold text-xs text-black/70">
                  {mode === "learn" ? "30-min fast fix with verified peer wizard" : "Squad co-build raid for projects"}
                </p>
              </div>
            </div>

            {/* Mode Physical Toggle */}
            <div className="flex items-center gap-2 bg-[#fffdf0] p-1.5 rounded-2xl border-3 border-black font-display font-black text-xs">
              <button
                type="button"
                onClick={() => setMode("learn")}
                className={`px-3 py-1.5 rounded-xl uppercase transition-all ${
                  mode === "learn" ? "bg-black text-brutal-yellow" : "hover:bg-black/10"
                }`}
              >
                ⚡ 30-Min Fast Fix
              </button>
              <button
                type="button"
                onClick={() => setMode("buddy")}
                className={`px-3 py-1.5 rounded-xl uppercase transition-all ${
                  mode === "buddy" ? "bg-black text-brutal-purple" : "hover:bg-black/10"
                }`}
              >
                🤝 Squad Raid
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {/* Title Input */}
            <div className="flex flex-col gap-1.5">
              <label className="font-display font-black text-xs uppercase tracking-wider text-black">
                Quest Headline (What&apos;s Broken?)
              </label>
              <input
                className="w-full px-4 py-3 rounded-2xl bg-[#fffdf0] border-3 border-black text-black font-headline font-bold text-sm brutal-shadow-sm focus:outline-none focus:bg-white placeholder:text-black/40 transition-all"
                placeholder="e.g. Master CSS Grid layout for interactive portfolio"
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setErrors((prev) => ({ ...prev, title: "" }));
                }}
              />
              {errors.title && <p className="font-mono text-xs font-bold text-red-600">{errors.title}</p>}
            </div>

            {/* Course & Urgency Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="font-display font-black text-xs uppercase tracking-wider text-black">
                  Campus Course
                </label>
                <select className="w-full px-4 py-3 rounded-2xl bg-[#fffdf0] border-3 border-black text-black font-headline font-bold text-sm brutal-shadow-sm focus:outline-none focus:bg-white transition-all">
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
                <select className="w-full px-4 py-3 rounded-2xl bg-[#fffdf0] border-3 border-black text-black font-headline font-bold text-sm brutal-shadow-sm focus:outline-none focus:bg-white transition-all">
                  <option>🔥 Within 2 Hours (Urgent Lab)</option>
                  <option>🌙 Tonight Study Session</option>
                  <option>🏖️ Weekend Hackathon Sprint</option>
                </select>
              </div>
            </div>

            {/* Clickable Skill Stickers Dock */}
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
                {requiredSkills.map((skill, i) => {
                  const colors = ["bg-brutal-yellow", "bg-brutal-mint", "bg-brutal-blue", "bg-brutal-pink", "bg-brutal-purple"];
                  const color = colors[i % colors.length];
                  return (
                    <span
                      key={skill}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl ${color} border-2 border-black font-display font-black text-xs brutal-shadow-sm hover:scale-105 transition-transform`}
                    >
                      <span>🏷️ {skill}</span>
                      <button
                        type="button"
                        onClick={() => removeTag(skill)}
                        className="ml-1 font-mono font-black text-xs hover:text-red-600"
                      >
                        ✕
                      </button>
                    </span>
                  );
                })}

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

              {/* Quick Suggestion Dock */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="text-[11px] font-mono font-bold text-black/60 self-center mr-1">
                  Hot Stickers:
                </span>
                {["TypeScript", "Python / NumPy", "Figma Systems", "SQL Queries", "Next.js"].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => addTag(s)}
                    className="px-2.5 py-1 rounded-lg bg-gray-100 border-2 border-black text-[11px] font-display font-black hover:bg-brutal-yellow brutal-shadow-sm transition-all"
                  >
                    + {s}
                  </button>
                ))}
              </div>
              {errors.skills && <p className="font-mono text-xs font-bold text-red-600">{errors.skills}</p>}
            </div>

            {/* Target Deliverable (Victory Condition) */}
            <div className="flex flex-col gap-1.5">
              <label className="font-display font-black text-xs uppercase tracking-wider text-black">
                Target Deliverable (Victory Condition)
              </label>
              <textarea
                className="w-full p-3.5 rounded-2xl bg-[#fffdf0] border-3 border-black text-black font-headline font-bold text-xs brutal-shadow-sm focus:outline-none focus:bg-white"
                rows={3}
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  setErrors((prev) => ({ ...prev, description: "" }));
                }}
              />
              {errors.description && <p className="font-mono text-xs font-bold text-red-600">{errors.description}</p>}
            </div>

            {/* Learn Mode: Duration & Escrow */}
            {mode === "learn" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-[#fffdf0] border-3 border-black">
                <div className="flex flex-col gap-1.5">
                  <label className="font-display font-black text-xs uppercase tracking-wider text-black flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    Sprint Duration
                  </label>
                  <select
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-white border-2 border-black font-headline font-bold text-xs"
                  >
                    <option value={20}>20 Minutes Fast Check</option>
                    <option value={30}>30 Minutes Micro-Block (Recommended)</option>
                    <option value={45}>45 Minutes Deep Debug</option>
                    <option value={60}>60 Minutes Full Review</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-display font-black text-xs uppercase tracking-wider text-black flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4" />
                    Escrow Stake
                  </label>
                  <div className="px-3 py-2 rounded-xl bg-brutal-yellow border-2 border-black font-mono font-black text-xs flex items-center justify-between">
                    <span>1 SkillCredit Stake</span>
                    <span className="text-emerald-700">✓ Refundable</span>
                  </div>
                </div>
              </div>
            )}

            {/* Buddy Mode: Deadline & Squad Roles */}
            {mode === "buddy" && (
              <div className="flex flex-col gap-4 p-4 rounded-2xl bg-[#fffdf0] border-3 border-black">
                <div className="flex flex-col gap-1.5">
                  <label className="font-display font-black text-xs uppercase tracking-wider text-black flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    Project Deadline
                  </label>
                  <input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full px-3 py-2 rounded-xl bg-white border-2 border-black font-headline font-bold text-xs"
                  />
                  {errors.deadline && <p className="font-mono text-xs font-bold text-red-600">{errors.deadline}</p>}
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <label className="font-display font-black text-xs uppercase tracking-wider text-black flex items-center gap-1.5">
                      <UserPlus className="w-4 h-4" />
                      Squad Roles Needed
                    </label>
                    <button
                      type="button"
                      onClick={addRole}
                      className="px-2.5 py-1 rounded-lg bg-black text-brutal-purple font-display font-black text-xs uppercase"
                    >
                      + Add Role
                    </button>
                  </div>

                  {roles.map((role, idx) => (
                    <div key={idx} className="p-3 bg-white rounded-xl border-2 border-black flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <span className="font-display font-black text-xs uppercase">Role {idx + 1}</span>
                        {roles.length > 1 && (
                          <button type="button" onClick={() => removeRole(idx)} className="text-red-600 font-bold text-xs">
                            Remove
                          </button>
                        )}
                      </div>
                      <input
                        className="px-3 py-2 rounded-lg border-2 border-black font-headline font-bold text-xs bg-[#fffdf0]"
                        placeholder="e.g. Frontend Developer or UI Designer"
                        value={role.title}
                        onChange={(e) => updateRole(idx, "title", e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t-3 border-black">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-black/70">
                <span className="w-3 h-3 rounded-full bg-emerald-400 border border-black" />
                <span>Escrow held in safe; auto-refunded if no match!</span>
              </div>
              <button
                disabled={loading}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-black text-brutal-yellow font-display font-black text-base uppercase tracking-wider brutal-btn flex items-center justify-center gap-3 hover:bg-brutal-electric hover:text-white border-3 border-black"
                type="submit"
              >
                <span>{loading ? "SEARCHING RADAR..." : "LAUNCH CAMPUS RADAR"}</span>
                <span className="text-xl">🚀</span>
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}