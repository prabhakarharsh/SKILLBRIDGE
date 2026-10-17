"use client";

import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "@/utils/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import { Avatar } from "@/components/ui/Avatar";
import { ArrowLeft, Star, Clock, CheckCircle2, Award, MessageSquare, ExternalLink, Loader2, Edit, ShieldCheck, Sparkles } from "lucide-react";
import { userService } from "@/services/userService";
import { projectService } from "@/services/projectService";
import { feedbackService } from "@/services/feedbackService";
import { formatDate, getTrustBadgeStyle, getTrustBadgeIcon, classNames } from "@/utils/helpers";
import { Navbar } from "@/components/layout/Navbar";
import type { User, ProjectCard, TrustBadge } from "@/types";

export function Profile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { showToast } = useToast();

  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<ProjectCard[]>([]);
  const [trustBadges, setTrustBadges] = useState<TrustBadge[]>([]);
  const [feedbackStats, setFeedbackStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isOwnProfile, setIsOwnProfile] = useState(false);

  const targetId = (id === "me" || !id) ? currentUser?.id : id;

  useEffect(() => {
    if (targetId) {
      loadProfile(targetId);
    }
  }, [targetId]);

  const loadProfile = async (userId: string) => {
    setLoading(true);
    try {
      const [userData, projectsData, badgesData, statsData] = await Promise.all([
        userService.getUser(userId),
        projectService.getUserProjectCards(userId),
        feedbackService.getPublicTrustBadges(userId),
        feedbackService.getFeedbackStats(userId),
      ]);

      if (!userData) {
        showToast("Player not found on syndicate registry", "error");
        navigate("/dashboard");
        return;
      }

      setProfileUser(userData);
      setProjects(projectsData);
      setTrustBadges(badgesData as TrustBadge[]);
      setFeedbackStats(statsData);
      setIsOwnProfile(currentUser?.id === userId);
    } catch (e) {
      console.error("Failed to load profile:", e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fefce8] pixel-pattern font-headline text-black antialiased flex items-center justify-center">
        <Navbar />
        <div className="bg-white rounded-3xl border-4 border-black p-8 text-center brutal-shadow animate-pulse">
          <div className="font-display font-black text-lg uppercase">RETRIEVING PLAYER DOSSIER...</div>
        </div>
      </div>
    );
  }

  if (!profileUser) return null;

  return (
    <div className="min-h-screen bg-[#fefce8] pixel-pattern font-headline text-black antialiased">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-24 pb-16">
        {/* Back Link */}
        <button 
          onClick={() => navigate(-1)} 
          className="mb-6 inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border-2 border-black font-mono font-bold text-xs uppercase brutal-shadow-sm hover:-translate-y-0.5 transition-transform"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        {/* Player Header Bento Card */}
        <div className="bg-white rounded-3xl border-4 border-black p-6 md:p-8 brutal-shadow mb-8 relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <div className="relative">
                <Avatar name={profileUser.name} size="xl" verified={profileUser.isVerified} />
                <span className="absolute -bottom-2 -right-2 bg-brutal-mint border-2 border-black font-mono font-black text-[10px] uppercase px-2 py-0.5 rounded-lg">
                  LVL 4
                </span>
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2.5 mb-1.5">
                  <h1 className="font-display font-black text-2xl md:text-3xl uppercase tracking-tight text-black">
                    {profileUser.name}
                  </h1>
                  {profileUser.isVerified && (
                    <span className="bg-brutal-mint border-2 border-black font-mono font-black text-xs uppercase px-2.5 py-0.5 rounded-lg">
                      VERIFIED STUDENT
                    </span>
                  )}
                </div>
                <p className="font-mono text-xs font-bold text-black/70 mb-3">
                  {profileUser.branch} • YEAR {profileUser.year} • CAMPUS ID #{profileUser.id.slice(0, 8)}
                </p>

                {/* Status Badges */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 rounded-xl bg-brutal-yellow border-2 border-black font-mono font-black text-xs">
                    🪙 {profileUser.credits} SKILLCREDITS
                  </span>
                  <span className="px-3 py-1 rounded-xl bg-brutal-purple/30 border-2 border-black font-mono font-black text-xs">
                    ★ {profileUser.rating.toFixed(1)} RATING
                  </span>
                  <span className="px-3 py-1 rounded-xl bg-brutal-mint border-2 border-black font-mono font-black text-xs">
                    🟢 {profileUser.availability === "now" ? "AVAILABLE NOW" : "THIS WEEK"}
                  </span>
                </div>
              </div>
            </div>

            {/* Academic Trust Score Pill */}
            <div className="bg-brutal-yellow p-4 rounded-2xl border-3 border-black brutal-shadow-sm text-center md:text-right w-full md:w-auto">
              <div className="text-[10px] font-mono font-black uppercase text-black/70">ACADEMIC TRUST SCORE</div>
              <div className="font-display font-black text-3xl text-black">99 / 100</div>
              <div className="text-[10px] font-mono font-black uppercase text-emerald-800">DEAN'S HONOR ROLL ⭐</div>
            </div>
          </div>

          {profileUser.bio && (
            <div className="mt-6 pt-4 border-t-2 border-black/10">
              <div className="text-[10px] font-mono font-black uppercase text-black/60 mb-1">CO-BUILDER BIO:</div>
              <p className="font-headline text-sm font-medium text-black">{profileUser.bio}</p>
            </div>
          )}
        </div>

        {/* Skills Deck & Trust Badges Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Verified Skills Deck */}
          <div className="bg-white rounded-3xl border-4 border-black p-6 brutal-shadow">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl">⚡</span>
              <h3 className="font-display font-black text-lg uppercase tracking-tight text-black">
                Verified Skill Deck ({profileUser.skills.length})
              </h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {profileUser.skills.map((skill, i) => (
                <span key={i} className="bg-brutal-yellow/40 border-2 border-black font-mono font-bold text-xs px-3 py-1.5 rounded-xl brutal-shadow-sm">
                  #{skill}
                </span>
              ))}
            </div>
          </div>

          {/* Syndicate Trust Badges */}
          <div className="bg-white rounded-3xl border-4 border-black p-6 brutal-shadow">
            <div className="flex items-center gap-2 mb-4">
              <Award className="w-5 h-5 text-black" />
              <h3 className="font-display font-black text-lg uppercase tracking-tight text-black">
                Campus Syndicate Badges
              </h3>
            </div>
            {trustBadges.length === 0 ? (
              <div className="font-mono text-xs text-black/60 py-4">
                No custom badges unlocked yet. Complete collaborations to earn endorsements.
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {trustBadges.map((badge, i) => (
                  <span key={i} className="bg-brutal-mint border-2 border-black font-mono font-black text-xs uppercase px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                    <span>{getTrustBadgeIcon(badge)}</span>
                    <span>{badge}</span>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Minted Projects Portfolio */}
        <div className="bg-white rounded-3xl border-4 border-black p-6 md:p-8 brutal-shadow">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-black" />
              <h3 className="font-display font-black text-xl uppercase tracking-tight text-black">
                Minted Project Portfolio ({projects.length})
              </h3>
            </div>
            <span className="font-mono font-black text-xs uppercase bg-black text-brutal-yellow px-2.5 py-1 rounded-xl">
              PROOF OF COLLAB
            </span>
          </div>

          {projects.length === 0 ? (
            <div className="text-center py-8 font-mono text-sm text-black/60">
              No completed project credentials yet. Co-build with peers to mint credentials!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {projects.map((proj) => (
                <Link
                  key={proj.id}
                  to={`/project-card/${proj.id}`}
                  className="p-5 rounded-2xl bg-[#fffdf0] border-3 border-black brutal-shadow-sm hover:-translate-y-1 transition-all block"
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="bg-black text-brutal-yellow font-mono font-black text-[10px] uppercase px-2 py-0.5 rounded-md">
                      #{proj.verificationBadge}
                    </span>
                    <span className="font-mono text-xs text-black/60 font-bold">
                      {formatDate(proj.endDate)}
                    </span>
                  </div>
                  <h4 className="font-display font-black text-base uppercase text-black mb-1">
                    {proj.title}
                  </h4>
                  <p className="font-mono text-xs text-black/70 line-clamp-2 mb-3">
                    {proj.description}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {proj.skillsUsed.map((s, i) => (
                      <span key={i} className="text-[10px] font-mono font-bold bg-white px-2 py-0.5 rounded border border-black">
                        #{s}
                      </span>
                    ))}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}