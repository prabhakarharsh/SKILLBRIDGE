"use client";

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "@/utils/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import { ArrowLeft, Download, Copy, Share2, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { projectService } from "@/services/projectService";
import { ProjectCardDisplay } from "@/components/cards/ProjectCard";
import { Navbar } from "@/components/layout/Navbar";

export function ProjectCardPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (projectId) loadProject();
  }, [projectId]);

  const loadProject = async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      // Try to load by ID first, then by share token
      let proj = await projectService.getProjectCard(projectId);
      if (!proj) {
        proj = await projectService.getProjectCardByToken(projectId);
      }
      setProject(proj);
    } catch (e) {
      console.error("Failed to load project:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      showToast("Downloading credential badge PNG...");
    } catch (e) {
      showToast("Download failed", "error");
    } finally {
      setDownloading(false);
    }
  };

  const handleCopyLink = async () => {
    const url = `${window.location.origin}/project/${project?.shareToken}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      showToast("Verifiable project URL copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      showToast("Failed to copy link", "error");
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: project?.title,
        text: `Check out this verified syndicate project credential on SkillBridge Arcade`,
        url: `${window.location.origin}/project/${project?.shareToken}`,
      });
    } else {
      handleCopyLink();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fefce8] pixel-pattern font-headline text-black antialiased flex items-center justify-center">
        <Navbar />
        <div className="bg-white rounded-3xl border-4 border-black p-8 text-center brutal-shadow animate-pulse">
          <div className="w-12 h-12 rounded-xl bg-brutal-yellow border-3 border-black mx-auto mb-3 flex items-center justify-center text-xl">
            🛡️
          </div>
          <div className="font-display font-black text-lg uppercase">RETRIEVING MINTED PROOF...</div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-[#fefce8] pixel-pattern font-headline text-black antialiased flex items-center justify-center p-4">
        <Navbar />
        <div className="max-w-md w-full bg-white rounded-3xl border-4 border-black p-8 text-center brutal-shadow">
          <div className="w-16 h-16 rounded-2xl bg-brutal-pink border-3 border-black mx-auto mb-4 flex items-center justify-center text-3xl">
            ⚠️
          </div>
          <h2 className="font-display font-black text-2xl uppercase tracking-tight text-black mb-2">Credential Not Found</h2>
          <p className="font-mono text-sm text-black/70 mb-6">This project proof card doesn't exist or may have been unverified.</p>
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
        {/* Navigation & Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <button 
            onClick={() => navigate("/dashboard")} 
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border-2 border-black font-mono font-bold text-xs uppercase brutal-shadow-sm hover:-translate-y-0.5 transition-transform"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Terminal</span>
          </button>

          <div className="flex gap-2">
            <button
              onClick={handleCopyLink}
              className="brutal-btn px-4 py-2 rounded-xl bg-white border-2 border-black font-mono font-black text-xs uppercase flex items-center gap-1.5"
            >
              {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "COPIED!" : "COPY LINK"}</span>
            </button>
            <button
              onClick={handleShare}
              className="brutal-btn px-4 py-2 rounded-xl bg-brutal-blue border-2 border-black font-mono font-black text-xs uppercase flex items-center gap-1.5"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>SHARE URL</span>
            </button>
          </div>
        </div>

        {/* Project Card Display */}
        <ProjectCardDisplay 
          card={project} 
          onDownload={handleDownload}
          onShare={handleShare}
          showActions={true}
        />
      </main>
    </div>
  );
}