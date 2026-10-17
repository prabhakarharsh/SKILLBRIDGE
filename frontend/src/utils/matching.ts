import type { MatchInput, MatchOutput, MatchReason, User, Need } from "@/types";
import { MATCH_WEIGHTS } from "@/utils/constants";

/**
 * Pure matching function - no side effects, easily testable and portable to AWS Lambda
 * 
 * Learn Mode: Direct skill overlap (provider has skills seeker needs)
 * Buddy Mode: Complementary skills (provider has skills seeker LACKS but need requires)
 * 
 * Weights (both modes):
 * - Skill Fit / Complementary: 40%
 * - Availability: 20%
 * - Rating: 20%
 * - Same College: 10%
 * - Credit Activity: 10%
 */
export function computeMatchScore(input: MatchInput): MatchOutput {
  const { seeker, provider, need, allUsers } = input;
  let score = 0;
  const reasons: MatchReason[] = [];

  // 1. SKILL FIT (40% weight) - Different logic for Learn vs Buddy
  if (need.mode === "learn") {
    // Direct skill overlap: provider has skills seeker needs
    const seekerSkillsLower = new Set(seeker.skills.map(s => s.toLowerCase()));
    const needSkillsLower = new Set(need.requiredSkills.map(s => s.toLowerCase()));
    
    // Skills the provider has that the seeker needs
    const overlap = provider.skills.filter(ps => 
      needSkillsLower.has(ps.toLowerCase()) && !seekerSkillsLower.has(ps.toLowerCase())
    );
    
    // Also count skills seeker already has but provider also has (reinforcement)
    const reinforcement = provider.skills.filter(ps => 
      seekerSkillsLower.has(ps.toLowerCase()) && needSkillsLower.has(ps.toLowerCase())
    );
    
    const totalRelevant = overlap.length + reinforcement.length * 0.5;
    const maxPossible = need.requiredSkills.length;
    const skillScore = Math.min((totalRelevant / maxPossible) * MATCH_WEIGHTS.learn.skillFit, MATCH_WEIGHTS.learn.skillFit);
    
    score += skillScore;
    
    if (overlap.length > 0 || reinforcement.length > 0) {
      const allSkills = [...overlap, ...reinforcement];
      reasons.push({
        type: "skill-fit",
        label: "Skill Match",
        detail: `Has ${allSkills.slice(0, 3).join(", ")}${allSkills.length > 3 ? ` +${allSkills.length - 3} more` : ""}`,
        weight: MATCH_WEIGHTS.learn.skillFit,
      });
    }
  } else {
    // Buddy: COMPLEMENTARY skills (provider has skills seeker LACKS but need requires)
    const seekerSkillsLower = new Set(seeker.skills.map(s => s.toLowerCase()));
    const needSkillsLower = new Set(need.requiredSkills.map(s => s.toLowerCase()));
    
    const complementary = provider.skills.filter(ps => 
      !seekerSkillsLower.has(ps.toLowerCase()) && 
      needSkillsLower.has(ps.toLowerCase())
    );
    
    // Also value additional relevant skills not in need but complementary
    const bonusSkills = provider.skills.filter(ps => 
      !seekerSkillsLower.has(ps.toLowerCase()) && 
      !needSkillsLower.has(ps.toLowerCase()) &&
      isRelevantSkill(ps, need.requiredSkills)
    );
    
    const compScore = Math.min(
      (complementary.length * 8) + (bonusSkills.length * 3), 
      MATCH_WEIGHTS.buddy.complementary
    );
    
    score += compScore;
    
    if (complementary.length > 0 || bonusSkills.length > 0) {
      const allSkills = [...complementary, ...bonusSkills];
      reasons.push({
        type: "complementary",
        label: "Complementary Skills",
        detail: `Brings ${allSkills.slice(0, 3).join(", ")}${allSkills.length > 3 ? ` +${allSkills.length - 3} more` : ""}`,
        weight: MATCH_WEIGHTS.buddy.complementary,
      });
    }
  }

  // 2. AVAILABILITY FIT (20% weight)
  const availWeight = MATCH_WEIGHTS.learn.availability; // same for both
  let availScore = 0;
  
  switch (provider.availability) {
    case "now":
      availScore = availWeight;
      break;
    case "this-week":
      availScore = availWeight * 0.7;
      break;
    case "this-month":
      availScore = availWeight * 0.4;
      break;
    case "busy":
      availScore = 0;
      break;
  }
  
  score += availScore;
  
  if (availScore > 0) {
    reasons.push({
      type: "availability",
      label: "Availability",
      detail: formatAvailabilityLabel(provider.availability),
      weight: availWeight,
    });
  }

  // 3. RATING / RELIABILITY (20% weight)
  const ratingWeight = MATCH_WEIGHTS.learn.rating;
  const ratingScore = (provider.rating / 5) * ratingWeight;
  score += ratingScore;
  
  reasons.push({
    type: "rating",
    label: "Rating",
    detail: `${provider.rating.toFixed(1)}/5.0 ⭐`,
    weight: ratingWeight,
  });

  // 4. SAME COLLEGE (10% weight) - Domain verification
  const collegeWeight = MATCH_WEIGHTS.learn.college;
  const seekerDomain = seeker.email.split("@")[1]?.toLowerCase();
  const providerDomain = provider.email.split("@")[1]?.toLowerCase();
  const sameCollege = seekerDomain && providerDomain && seekerDomain === providerDomain;
  const collegeScore = sameCollege ? collegeWeight : 0;
  
  score += collegeScore;
  
  if (sameCollege) {
    reasons.push({
      type: "college",
      label: "Same Campus",
      detail: `Verified @${providerDomain} peer`,
      weight: collegeWeight,
    });
  }

  // 5. CREDIT BALANCE (10% weight) - Incentivize active users
  const creditWeight = MATCH_WEIGHTS.learn.credits;
  const creditScore = Math.min(provider.credits / 10, 1) * creditWeight; // Max 10 credits = full score
  score += creditScore;
  
  if (creditScore > 0) {
    reasons.push({
      type: "rating", // reuse type for UI
      label: "Active Contributor",
      detail: `${provider.credits} credits earned`,
      weight: creditWeight,
    });
  }

  // Sort reasons by weight descending
  reasons.sort((a, b) => b.weight - a.weight);

  return {
    score: Math.round(Math.min(score, 100)),
    reasons,
  };
}

function isRelevantSkill(skill: string, needSkills: string[]): boolean {
  const skillLower = skill.toLowerCase();
  const relevantGroups: Record<string, string[]> = {
    frontend: ["react", "vue", "angular", "svelte", "next", "remix", "typescript", "javascript", "css", "html", "tailwind", "styled-components"],
    backend: ["node", "express", "fastify", "nestjs", "python", "django", "fastapi", "flask", "go", "rust", "java", "spring"],
    database: ["mongodb", "postgresql", "mysql", "redis", "prisma", "typeorm", "sql", "nosql"],
    design: ["figma", "sketch", "adobe", "photoshop", "illustrator", "ui", "ux", "design", "prototyping"],
    ml: ["python", "pytorch", "tensorflow", "sklearn", "pandas", "numpy", "ml", "ai", "deep learning", "nlp", "cv"],
    devops: ["docker", "kubernetes", "aws", "gcp", "azure", "ci/cd", "github actions", "terraform", "ansible"],
  };
  
  const needGroups = new Set<string>();
  needSkills.forEach(ns => {
    Object.entries(relevantGroups).forEach(([group, skills]) => {
      if (skills.some(s => ns.toLowerCase().includes(s) || s.includes(ns.toLowerCase()))) {
        needGroups.add(group);
      }
    });
  });
  
  return Array.from(needGroups).some(group => 
    relevantGroups[group].some(s => skillLower.includes(s) || s.includes(skillLower))
  );
}

function formatAvailabilityLabel(availability: string): string {
  switch (availability) {
    case "now": return "Available now 🟢";
    case "this-week": return "Free this week 📅";
    case "this-month": return "Flexible this month 📆";
    case "busy": return "Currently busy 🔴";
    default: return availability;
  }
}

/**
 * Find matches for a need - returns sorted matches with scores
 */
export function findMatchesForNeed(
  need: Need, 
  allUsers: User[], 
  currentUserId: string,
  maxResults = 10
): MatchOutput[] {
  const seeker = allUsers.find(u => u.id === need.authorId);
  if (!seeker) return [];

  // Filter potential providers
  const providers = allUsers.filter(u => 
    u.id !== currentUserId && 
    u.id !== need.authorId &&
    u.isVerified &&
    u.availability !== "busy"
  );

  // Compute scores
  const matches = providers.map(provider => 
    computeMatchScore({ seeker, provider, need, allUsers })
  );

  // Sort by score descending and return top results
  return matches
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults);
}