"use client";

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "@/utils/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import { Avatar } from "@/components/ui/Avatar";
import { ArrowLeft, CheckCircle2, UserPlus, Clock, FileText, Loader2, ArrowRight, X, Plus, Sparkles, ShieldCheck } from "lucide-react";
import { consentService } from "@/services/consentService";
import { matchService } from "@/services/matchService";
import { needService } from "@/services/needService";
import { userService } from "@/services/userService";
import { projectService } from "@/services/projectService";
import { creditService } from "@/services/creditService";
import { Navbar } from "@/components/layout/Navbar";
import type { Collaboration, AgreedRole } from "@/types";

export function Agreement() {
  const { matchId } = useParams<{ matchId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [collaboration, setCollaboration] = useState<Collaboration | null>(null);
  const [match, setMatch] = useState<any>(null);
  const [need, setNeed] = useState<any>(null);
  const [participants, setParticipants] = useState<Array<{ user: any; role: AgreedRole }>>([]);
  const [roles, setRoles] = useState<AgreedRole[]>([]);
  const [deadline, setDeadline] = useState("");
  const [expectedOutput, setExpectedOutput] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (matchId) loadData();
  }, [matchId]);

  const loadData = async () => {
    if (!matchId || !user) return;
    setLoading(true);
    try {
      const [collabData, matchData, needData] = await Promise.all([
        consentService.getCollaborationByMatchId(matchId),
        matchService.getMatch(matchId),
        matchService.getMatch(matchId).then(m => m ? needService.getNeed(m.needId) : null),
      ]);

      if (!collabData) {
        showToast("Collaboration session not found", "error");
        navigate("/dashboard");
        return;
      }

      // Check if already has agreement & project card
      if (collabData.agreement) {
        navigate(`/project-card/${collabData.projectCardId || matchId}`);
        return;
      }

      // Check mutual consent
      const mutualConsent = Object.values(collabData.consentStatus).every(v => v === "accepted");
      if (!mutualConsent) {
        navigate(`/room/${matchId}`);
        return;
      }

      // Get participants
      const participantsData = await Promise.all(
        collabData.participants.map(async id => {
          const u = await userService.getUser(id);
          return { 
            user: u, 
            role: { 
              userId: id, 
              roleTitle: id === user.id ? "Lead Architect" : "Peer Specialist", 
              responsibilities: ["Implement core deliverables", "Verify architecture and peer sign-off"] 
            } 
          };
        })
      );

      setCollaboration(collabData);
      setMatch(matchData);
      setNeed(needData);
      setParticipants(participantsData);
      setRoles(participantsData.map(p => p.role));
      
      // Pre-fill deadline from need or default to 3 days
      if (needData?.deadline) {
        setDeadline(needData.deadline.split("T")[0]);
      } else {
        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 3);
        setDeadline(nextWeek.toISOString().split("T")[0]);
      }

      if (!expectedOutput && needData?.description) {
        setExpectedOutput(`Verified deliverable: ${needData.description}. Complete test suite passing, peer-reviewed codebase.`);
      }
    } catch (e) {
      console.error("Failed to load agreement:", e);
    } finally {
      setLoading(false);
    }
  };

  const updateRole = (index: number, field: keyof AgreedRole, value: any) => {
    setRoles(prev => prev.map((r, i) => i === index ? { ...r, [field]: value } : r));
    setErrors(prev => ({ ...prev, [`role-${index}-${field}`]: "" }));
  };

  const addResponsibility = (index: number) => {
    updateRole(index, "responsibilities", [...(roles[index]?.responsibilities || []), ""]);
  };

  const removeResponsibility = (roleIndex: number, respIndex: number) => {
    updateRole(roleIndex, "responsibilities", roles[roleIndex].responsibilities.filter((_, i) => i !== respIndex));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    roles.forEach((role, i) => {
      if (!role.roleTitle.trim()) newErrors[`role-${i}-roleTitle`] = "Role title required";
      if (role.responsibilities.length === 0) newErrors[`role-${i}-responsibilities`] = "At least one responsibility required";
      role.responsibilities.forEach((resp, j) => {
        if (!resp.trim()) newErrors[`role-${i}-resp-${j}`] = "Responsibility cannot be empty";
      });
    });

    if (!deadline) newErrors.deadline = "Target deadline required";
    if (!expectedOutput.trim() || expectedOutput.length < 15) {
      newErrors.expectedOutput = "Specify deliverables clearly (min 15 chars)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm() || !collaboration || !user) return;

    setSaving(true);
    try {
      // Create the minted project card directly
      const projectCard = await projectService.createProjectCard({
        collaborationId: collaboration.id,
        title: need?.title || "Syndicate Co-Build Project",
        description: expectedOutput,
        skillsUsed: need?.requiredSkills || ["System Design", "Engineering"],
        roles,
      });

      if (!projectCard) {
        showToast("Failed to mint project card", "error");
        return;
      }

      // Award credits to both participants
      await Promise.all(
        collaboration.participants.map(p => creditService.processCompleteProject(p, collaboration.id))
      );

      showToast("Deliverables signed off! Verified Project Card minted! ⚡");
      navigate(`/project-card/${projectCard.id}`);
    } catch (e) {
      showToast("Failed to save agreement", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fefce8] pixel-pattern font-headline text-black antialiased flex items-center justify-center">
        <Navbar />
        <div className="bg-white rounded-3xl border-4 border-black p-8 text-center brutal-shadow animate-pulse">
          <div className="w-12 h-12 rounded-xl bg-brutal-yellow border-3 border-black mx-auto mb-3 flex items-center justify-center text-xl">
            📜
          </div>
          <div className="font-display font-black text-lg uppercase">INITIALIZING AGREEMENT PROTOCOL...</div>
        </div>
      </div>
    );
  }

  if (!collaboration) {
    return (
      <div className="min-h-screen bg-[#fefce8] pixel-pattern font-headline text-black antialiased flex items-center justify-center p-4">
        <Navbar />
        <div className="max-w-md w-full bg-white rounded-3xl border-4 border-black p-8 text-center brutal-shadow">
          <div className="w-16 h-16 rounded-2xl bg-brutal-pink border-3 border-black mx-auto mb-4 flex items-center justify-center text-3xl">
            ⚠️
          </div>
          <h2 className="font-display font-black text-2xl uppercase tracking-tight text-black mb-2">Gate Locked</h2>
          <p className="font-mono text-sm text-black/70 mb-6">Both parties must turn consent keys before entering the agreement protocol.</p>
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
    <div className="min-h-screen bg-[#fefce8] pixel-pattern font-headline text-black antialiased">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-24 pb-16">
        {/* Back Link */}
        <button 
          onClick={() => navigate(-1)} 
          className="mb-6 inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border-2 border-black font-mono font-bold text-xs uppercase brutal-shadow-sm hover:-translate-y-0.5 transition-transform"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Live Room</span>
        </button>

        {/* Stepper Header */}
        <div className="bg-white rounded-3xl border-4 border-black p-6 md:p-8 brutal-shadow mb-8">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-black text-brutal-yellow flex items-center justify-center font-display font-black text-base">
                04
              </span>
              <span className="px-3 py-1 rounded-xl bg-brutal-mint border-2 border-black font-mono font-black text-xs uppercase">
                MUTUAL CONSENT ACTIVE 🔓
              </span>
            </div>
            <div className="font-mono font-black text-xs uppercase text-black/60 bg-black/5 px-3 py-1 rounded-xl border border-black/20">
              SMART PROTOCOL #SB-ETH-0294
            </div>
          </div>

          <h1 className="font-display font-black text-2xl md:text-3xl text-black uppercase tracking-tight mb-2">
            Deliverable Sign-Off & Agreement
          </h1>
          <p className="font-headline text-base text-black/80 max-w-2xl">
            Lock in participant responsibilities, target deadline, and deliverable verification criteria. Upon sign-off, a permanent Verified Project Credential is minted.
          </p>
        </div>

        {/* Agreement Form */}
        <form onSubmit={e => { e.preventDefault(); handleSave(); }} className="space-y-6">
          {/* Roles & Responsibilities Bento */}
          <div className="bg-white rounded-3xl border-4 border-black p-6 md:p-8 brutal-shadow">
            <div className="flex items-center gap-2.5 mb-6">
              <UserPlus className="w-6 h-6 text-black" />
              <h3 className="font-display font-black text-xl uppercase tracking-tight text-black">
                Squad Roles & Deliverable Duties
              </h3>
            </div>

            <div className="space-y-6">
              {roles.map((role, index) => {
                const participant = participants[index]?.user;
                return (
                  <div key={index} className="p-5 rounded-2xl bg-[#fffdf0] border-3 border-black brutal-shadow-sm">
                    <div className="flex items-center gap-3 mb-4 pb-3 border-b-2 border-black">
                      <Avatar name={participant?.name || "Participant"} size="md" verified={participant?.isVerified} />
                      <div>
                        <div className="font-display font-black text-base uppercase text-black">
                          {participant?.name || "Participant"} {participant?.id === user?.id ? "(YOU)" : "(PEER)"}
                        </div>
                        <div className="font-mono text-xs text-black/70 font-bold">
                          {participant?.branch} • YEAR {participant?.year}
                        </div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="block font-mono font-black text-xs uppercase text-black mb-1.5">
                        Agreed Syndicate Title:
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., Fullstack Lead, Algorithm Architect, UI Specialist"
                        value={role.roleTitle}
                        onChange={e => updateRole(index, "roleTitle", e.target.value)}
                        className="w-full bg-white border-2 border-black rounded-xl px-4 py-2.5 font-mono text-xs font-bold text-black focus:outline-none focus:ring-2 focus:ring-black"
                      />
                      {errors[`role-${index}-roleTitle`] && (
                        <p className="text-red-600 font-mono text-xs font-bold mt-1">
                          {errors[`role-${index}-roleTitle`]}
                        </p>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="font-mono font-black text-xs uppercase text-black">
                          Key Deliverable Responsibilities:
                        </label>
                        <button
                          type="button"
                          onClick={() => addResponsibility(index)}
                          className="px-2.5 py-1 rounded-lg bg-brutal-yellow border border-black font-mono font-black text-[10px] uppercase inline-flex items-center gap-1 hover:bg-brutal-yellow-dark"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Add Task</span>
                        </button>
                      </div>

                      <div className="space-y-2">
                        {role.responsibilities.map((resp, respIndex) => (
                          <div key={respIndex} className="flex gap-2">
                            <input
                              type="text"
                              value={resp}
                              onChange={e => {
                                const updated = [...roles[index].responsibilities];
                                updated[respIndex] = e.target.value;
                                updateRole(index, "responsibilities", updated);
                              }}
                              placeholder="e.g., Build responsive UI components, write tests..."
                              className="flex-1 bg-white border-2 border-black rounded-xl px-3 py-2 font-mono text-xs font-bold text-black focus:outline-none focus:ring-2 focus:ring-black"
                            />
                            {role.responsibilities.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeResponsibility(index, respIndex)}
                                className="px-2.5 py-2 bg-red-100 hover:bg-red-200 border-2 border-black rounded-xl text-red-700"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Deliverables & Target Date Bento */}
          <div className="bg-white rounded-3xl border-4 border-black p-6 md:p-8 brutal-shadow">
            <div className="flex items-center gap-2.5 mb-6">
              <ShieldCheck className="w-6 h-6 text-black" />
              <h3 className="font-display font-black text-xl uppercase tracking-tight text-black">
                Verification Criteria & Target Date
              </h3>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block font-mono font-black text-xs uppercase text-black mb-1.5">
                  Target Deliverable Deadline:
                </label>
                <input
                  type="date"
                  value={deadline}
                  onChange={e => { setDeadline(e.target.value); setErrors(prev => ({ ...prev, deadline: "" })); }}
                  className="w-full bg-[#fffdf0] border-3 border-black rounded-2xl px-4 py-3 font-mono text-xs font-bold text-black focus:outline-none focus:ring-2 focus:ring-black brutal-shadow-sm"
                />
                {errors.deadline && (
                  <p className="text-red-600 font-mono text-xs font-bold mt-1">{errors.deadline}</p>
                )}
              </div>

              <div>
                <label className="block font-mono font-black text-xs uppercase text-black mb-1.5">
                  Expected Output & Acceptance Checklist:
                </label>
                <textarea
                  rows={4}
                  value={expectedOutput}
                  onChange={e => { setExpectedOutput(e.target.value); setErrors(prev => ({ ...prev, expectedOutput: "" })); }}
                  placeholder="Detail the expected deliverable (e.g. GitHub PR merged, documentation complete, deployed preview live)..."
                  className="w-full bg-[#fffdf0] border-3 border-black rounded-2xl px-4 py-3 font-mono text-xs font-bold text-black focus:outline-none focus:ring-2 focus:ring-black brutal-shadow-sm"
                />
                {errors.expectedOutput && (
                  <p className="text-red-600 font-mono text-xs font-bold mt-1">{errors.expectedOutput}</p>
                )}
              </div>
            </div>
          </div>

          {/* Sign & Mint CTA */}
          <div className="bg-brutal-yellow rounded-3xl border-4 border-black p-6 md:p-8 brutal-shadow text-center">
            <div className="text-3xl mb-2">⚡</div>
            <h4 className="font-display font-black text-xl uppercase text-black mb-2">
              Ready to Lock In Syndicate Agreement?
            </h4>
            <p className="font-mono text-xs text-black/80 max-w-lg mx-auto mb-6">
              Clicking below finalizes mutual agreement, releases escrowed credits to participants upon completion, and generates your cryptographic Project Proof Card.
            </p>
            <button
              type="submit"
              disabled={saving}
              className="brutal-btn w-full max-w-md mx-auto bg-black text-brutal-yellow hover:bg-neutral-900 border-3 border-black font-display font-black text-base uppercase py-4 px-6 rounded-2xl flex items-center justify-center gap-2"
            >
              <span>{saving ? "MINTING PROOF CARD..." : "SIGN & MINT VERIFIED PROJECT CARD"}</span>
              <Sparkles className="w-5 h-5 text-brutal-yellow" />
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}