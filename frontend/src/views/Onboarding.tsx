"use client";

import { useState } from "react";
import { useNavigate } from "@/utils/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import { ArrowRight, ArrowLeft, CheckCircle2, User, Star, Clock, MessageSquare, Sparkles, Plus, X } from "lucide-react";
import { SKILLS_LIST, AVAILABILITY_OPTIONS, BRANCHES, YEARS } from "@/utils/constants";
import { classNames } from "@/utils/helpers";

const steps = [
  { id: "basics", title: "Basics", desc: "Name, branch & year", icon: User },
  { id: "skills", title: "Skill Deck", desc: "Your verified capabilities", icon: Star },
  { id: "availability", title: "Availability", desc: "When you can co-build", icon: Clock },
  { id: "bio", title: "Player Bio", desc: "Introduction for radar", icon: MessageSquare },
];

export function Onboarding() {
  const navigate = useNavigate();
  const { user, completeProfile, loading: authLoading } = useAuth();
  const { showToast } = useToast();

  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    name: "",
    branch: "Computer Science",
    year: 3,
    skills: ["React", "Python", "TypeScript"] as string[],
    availability: "now" as const,
    bio: "Fullstack enthusiast excited to collaborate on campus syndicate projects and hackathons.",
  });
  const [customSkill, setCustomSkill] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#fefce8] pixel-pattern font-headline text-black antialiased flex items-center justify-center">
        <div className="bg-white rounded-3xl border-4 border-black p-8 text-center brutal-shadow animate-pulse">
          <div className="font-display font-black text-lg uppercase">INITIALIZING PLAYER REGISTRY...</div>
        </div>
      </div>
    );
  }

  if (!user || user.name) {
    navigate("/dashboard");
    return null;
  }

  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  const validateStep = () => {
    const newErrors: Record<string, string> = {};
    const step = steps[currentStep];

    if (step.id === "basics") {
      if (!formData.name.trim()) newErrors.name = "Full name is required";
      if (!formData.branch) newErrors.branch = "Select your academic branch";
      if (!formData.year) newErrors.year = "Select your year";
    } else if (step.id === "skills") {
      if (formData.skills.length === 0) newErrors.skills = "Equip at least one skill to your deck";
    } else if (step.id === "availability") {
      if (!formData.availability) newErrors.availability = "Select availability status";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      if (isLastStep) {
        handleSubmit();
      } else {
        setCurrentStep(prev => prev + 1);
      }
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;
    
    setSubmitting(true);
    const result = await completeProfile(formData);
    setSubmitting(false);

    if (result.error) {
      showToast(result.error, "error");
    } else {
      showToast("Player dossier initialized! Welcome to the Syndicate! ⚡");
      navigate("/dashboard");
    }
  };

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: "" }));
  };

  const toggleSkill = (skill: string) => {
    if (formData.skills.includes(skill)) {
      updateField("skills", formData.skills.filter(s => s !== skill));
    } else {
      updateField("skills", [...formData.skills, skill]);
    }
  };

  const handleAddCustomSkill = () => {
    if (customSkill.trim() && !formData.skills.includes(customSkill.trim())) {
      updateField("skills", [...formData.skills, customSkill.trim()]);
      setCustomSkill("");
    }
  };

  return (
    <div className="min-h-screen bg-[#fefce8] pixel-pattern font-headline text-black antialiased flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-2xl">
        {/* Brand / Title Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brutal-mint border-2 border-black font-mono font-black text-xs uppercase mb-3">
            <span>⚡</span>
            <span>PLAYER CHARACTER INITIALIZATION</span>
          </div>
          <h1 className="font-display font-black text-3xl uppercase tracking-tight text-black">
            Build Your Syndicate Profile
          </h1>
          <p className="font-mono text-xs font-bold text-black/70 mt-1">
            Step {currentStep + 1} of {steps.length}: {currentStepData.title} — {currentStepData.desc}
          </p>
        </div>

        {/* Stepper Progress Bar */}
        <div className="grid grid-cols-4 gap-2 mb-6">
          {steps.map((step, idx) => (
            <div
              key={step.id}
              className={classNames(
                "p-2.5 rounded-2xl border-3 border-black font-mono text-center transition-all",
                idx === currentStep
                  ? "bg-brutal-yellow font-black text-black brutal-shadow-sm scale-105"
                  : idx < currentStep
                  ? "bg-brutal-mint font-bold text-black"
                  : "bg-white font-medium text-black/40"
              )}
            >
              <div className="text-xs uppercase">{step.title}</div>
            </div>
          ))}
        </div>

        {/* Form Bento Card */}
        <div className="bg-white rounded-3xl border-4 border-black p-6 md:p-8 brutal-shadow">
          <form onSubmit={e => { e.preventDefault(); handleNext(); }}>
            {/* Step 1: Basics */}
            {currentStepData.id === "basics" && (
              <div className="space-y-4">
                <div>
                  <label className="block font-mono font-black text-xs uppercase text-black mb-1.5">
                    Player Real Name / Handle:
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={e => updateField("name", e.target.value)}
                    placeholder="e.g. Alex Martinez"
                    className="w-full bg-[#fffdf0] border-3 border-black rounded-2xl px-4 py-3 font-mono text-xs font-bold text-black focus:outline-none focus:ring-2 focus:ring-black brutal-shadow-sm"
                  />
                  {errors.name && (
                    <p className="text-red-600 font-mono text-xs font-bold mt-1">{errors.name}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-mono font-black text-xs uppercase text-black mb-1.5">
                      Academic Branch:
                    </label>
                    <select
                      value={formData.branch}
                      onChange={e => updateField("branch", e.target.value)}
                      className="w-full bg-[#fffdf0] border-3 border-black rounded-2xl px-4 py-3 font-mono text-xs font-bold text-black focus:outline-none focus:ring-2 focus:ring-black brutal-shadow-sm"
                    >
                      {BRANCHES.map(b => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-mono font-black text-xs uppercase text-black mb-1.5">
                      Academic Year:
                    </label>
                    <select
                      value={formData.year}
                      onChange={e => updateField("year", parseInt(e.target.value))}
                      className="w-full bg-[#fffdf0] border-3 border-black rounded-2xl px-4 py-3 font-mono text-xs font-bold text-black focus:outline-none focus:ring-2 focus:ring-black brutal-shadow-sm"
                    >
                      {YEARS.map(y => (
                        <option key={y} value={y}>Year {y}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Skills Deck */}
            {currentStepData.id === "skills" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="font-mono font-black text-xs uppercase text-black">
                    Equipped Skill Deck ({formData.skills.length}):
                  </label>
                  <span className="font-mono text-[10px] text-black/60 font-bold">CLICK TO TOGGLE</span>
                </div>

                <div className="flex flex-wrap gap-2 p-3 bg-[#fffdf0] border-2 border-black rounded-2xl min-h-[50px]">
                  {formData.skills.map(skill => (
                    <button
                      type="button"
                      key={skill}
                      onClick={() => toggleSkill(skill)}
                      className="bg-brutal-yellow border-2 border-black font-mono font-bold text-xs px-2.5 py-1 rounded-xl brutal-shadow-sm flex items-center gap-1.5"
                    >
                      <span>#{skill}</span>
                      <X className="w-3 h-3 text-black/70" />
                    </button>
                  ))}
                  {formData.skills.length === 0 && (
                    <span className="font-mono text-xs text-black/40">Select skills below or add your own</span>
                  )}
                </div>

                {errors.skills && (
                  <p className="text-red-600 font-mono text-xs font-bold">{errors.skills}</p>
                )}

                {/* Add Custom Skill */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customSkill}
                    onChange={e => setCustomSkill(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && (e.preventDefault(), handleAddCustomSkill())}
                    placeholder="Add custom skill (e.g. PyTorch, Rust)..."
                    className="flex-1 bg-white border-2 border-black rounded-xl px-3 py-2 font-mono text-xs font-bold text-black focus:outline-none focus:ring-2 focus:ring-black"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomSkill}
                    className="px-4 py-2 bg-black text-brutal-yellow rounded-xl font-mono font-bold text-xs uppercase"
                  >
                    Add
                  </button>
                </div>

                {/* Suggested Pool */}
                <div>
                  <div className="text-[10px] font-mono font-black uppercase text-black/60 mb-2">
                    POPULAR CAMPUS SKILLS:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {SKILLS_LIST.slice(0, 15).map(skill => (
                      <button
                        type="button"
                        key={skill}
                        onClick={() => toggleSkill(skill)}
                        className={classNames(
                          "px-2.5 py-1 rounded-lg border font-mono text-xs transition-all",
                          formData.skills.includes(skill)
                            ? "bg-black text-white border-black font-bold"
                            : "bg-white hover:bg-gray-100 border-black/40 text-black font-medium"
                        )}
                      >
                        {skill}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Availability */}
            {currentStepData.id === "availability" && (
              <div className="space-y-4">
                <label className="block font-mono font-black text-xs uppercase text-black mb-2">
                  When are you available to peer-teach or co-build?
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {AVAILABILITY_OPTIONS.map(opt => (
                    <button
                      type="button"
                      key={opt.value}
                      onClick={() => updateField("availability", opt.value)}
                      className={classNames(
                        "p-4 rounded-2xl border-3 border-black text-left transition-all",
                        formData.availability === opt.value
                          ? "bg-brutal-yellow font-black brutal-shadow scale-[1.02]"
                          : "bg-[#fffdf0] hover:bg-gray-50 text-black font-bold"
                      )}
                    >
                      <div className="font-display font-black text-sm uppercase text-black">{opt.label}</div>
                      <div className="font-mono text-xs text-black/70 mt-1">{opt.description}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 4: Bio */}
            {currentStepData.id === "bio" && (
              <div className="space-y-4">
                <label className="block font-mono font-black text-xs uppercase text-black mb-1.5">
                  Player Syndicate Bio & Goals:
                </label>
                <textarea
                  rows={4}
                  value={formData.bio}
                  onChange={e => updateField("bio", e.target.value)}
                  placeholder="Tell campus peers about your projects, favorite stacks, or what you want to learn..."
                  className="w-full bg-[#fffdf0] border-3 border-black rounded-2xl px-4 py-3 font-mono text-xs font-bold text-black focus:outline-none focus:ring-2 focus:ring-black brutal-shadow-sm"
                />
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between gap-4 mt-8 pt-4 border-t-2 border-black/10">
              {currentStep > 0 ? (
                <button
                  type="button"
                  onClick={handleBack}
                  className="px-4 py-2.5 rounded-xl bg-white border-2 border-black font-mono font-bold text-xs uppercase flex items-center gap-1.5 hover:bg-gray-50"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
              ) : <div></div>}

              <button
                type="submit"
                disabled={submitting}
                className="brutal-btn px-6 py-3 rounded-2xl bg-brutal-yellow hover:bg-brutal-yellow-dark border-3 border-black font-display font-black text-xs uppercase flex items-center gap-2"
              >
                <span>
                  {submitting ? "INITIALIZING..." : isLastStep ? "LAUNCH PROFILE 🚀" : "CONTINUE"}
                </span>
                {!isLastStep && <ArrowRight className="w-4 h-4 text-black" />}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}