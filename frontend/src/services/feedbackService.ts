import type { Feedback, FeedbackRatings, TrustBadge, User } from "@/types";
import { storage, generateId, nowISO } from "@/utils/storage";
import { TRUST_BADGES } from "@/utils/constants";

/**
 * Feedback Service - Private ratings → Public trust badges
 * 
 * AWS Mapping:
 * - submitFeedback → DynamoDB PutItem (Feedback table, PK: collaborationId, SK: fromUserId)
 * - getFeedbackForUser → DynamoDB Query (toUserId-index)
 * - getPublicTrustBadges → Lambda aggregation: reads all feedback for user, computes badge thresholds
 * 
 * Feedback is private/anonymous. Only aggregated trust badges appear publicly.
 */
export const feedbackService = {
  /**
   * Submit feedback after collaboration completion
   */
  async submitFeedback(feedback: Omit<Feedback, "id" | "createdAt">): Promise<Feedback> {
    const newFeedback: Feedback = {
      ...feedback,
      id: generateId("fb"),
      createdAt: nowISO(),
    };

    storage.addFeedback(newFeedback);
    
    // Update trust badges based on new feedback
    await this.updateTrustBadges(feedback.toUserId);
    
    return newFeedback;
  },

  /**
   * Get all feedback received by a user (private, for them only)
   */
  async getFeedbackForUser(userId: string): Promise<Feedback[]> {
    return storage.getFeedback()
      .filter(f => f.toUserId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  /**
   * Get feedback given by a user
   */
  async getFeedbackGivenBy(userId: string): Promise<Feedback[]> {
    return storage.getFeedback()
      .filter(f => f.fromUserId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  /**
   * Check if user has already given feedback for a collaboration
   */
  async hasGivenFeedback(collaborationId: string, fromUserId: string): Promise<boolean> {
    return storage.getFeedback().some(
      f => f.collaborationId === collaborationId && f.fromUserId === fromUserId
    );
  },

  /**
   * Get public trust badges for a user (aggregated from private feedback)
   * This is what shows on their profile
   */
  async getPublicTrustBadges(userId: string): Promise<TrustBadge[]> {
    const feedback = await this.getFeedbackForUser(userId);
    if (feedback.length === 0) return [];

    // Calculate average ratings
    const totals = feedback.reduce((acc, f) => {
      acc.communication += f.ratings.communication;
      acc.reliability += f.ratings.reliability;
      acc.skill += f.ratings.skill;
      acc.responsiveness += f.ratings.responsiveness;
      acc.count++;
      return acc;
    }, { communication: 0, reliability: 0, skill: 0, responsiveness: 0, count: 0 });

    const avgs = {
      communication: totals.communication / totals.count,
      reliability: totals.reliability / totals.count,
      skill: totals.skill / totals.count,
      responsiveness: totals.responsiveness / totals.count,
    };

    const badges: TrustBadge[] = [];

    // Badge thresholds (need at least 3 reviews for badges)
    if (totals.count >= 3) {
      if (avgs.reliability >= 4.5) badges.push("Reliable");
      if (avgs.skill >= 4.5) badges.push("Great Mentor");
      if (avgs.responsiveness >= 4.5) badges.push("Fast Responder");
      if (avgs.communication >= 4.5 && avgs.skill >= 4.0) badges.push("Quality Work");
    }

    return badges;
  },

  /**
   * Update user's trust badges based on feedback
   */
  async updateTrustBadges(userId: string): Promise<void> {
    // In a real app, this would update the user record
    // For now, badges are computed on-the-fly via getPublicTrustBadges
    // This function exists for the AWS mapping comment
  },

  /**
   * Get feedback stats for a user (for their private dashboard)
   */
  async getFeedbackStats(userId: string): Promise<{
    totalReviews: number;
    averageRatings: FeedbackRatings;
    badgeProgress: Array<{ badge: TrustBadge; current: number; threshold: number }>;
  }> {
    const feedback = await this.getFeedbackForUser(userId);
    
    if (feedback.length === 0) {
      return {
        totalReviews: 0,
        averageRatings: { communication: 0, reliability: 0, skill: 0, responsiveness: 0 },
        badgeProgress: TRUST_BADGES.map(b => ({ badge: b.id as TrustBadge, current: 0, threshold: 4.5 })),
      };
    }

    const totals = feedback.reduce((acc, f) => {
      acc.communication += f.ratings.communication;
      acc.reliability += f.ratings.reliability;
      acc.skill += f.ratings.skill;
      acc.responsiveness += f.ratings.responsiveness;
      return acc;
    }, { communication: 0, reliability: 0, skill: 0, responsiveness: 0 });

    const count = feedback.length;
    const avgs: FeedbackRatings = {
      communication: totals.communication / count,
      reliability: totals.reliability / count,
      skill: totals.skill / count,
      responsiveness: totals.responsiveness / count,
    };

    const badgeProgress = TRUST_BADGES.map(b => {
      let current = 0;
      if (b.id === "Reliable") current = avgs.reliability;
      else if (b.id === "Great Mentor") current = avgs.skill;
      else if (b.id === "Fast Responder") current = avgs.responsiveness;
      else if (b.id === "Quality Work") current = (avgs.communication + avgs.skill) / 2;
      
      return {
        badge: b.id as TrustBadge,
        current: Math.round(current * 10) / 10,
        threshold: 4.5,
      };
    });

    return {
      totalReviews: count,
      averageRatings: avgs,
      badgeProgress,
    };
  },

  /**
   * Get trust badge display info
   */
  getTrustBadgeInfo(badge: TrustBadge): { label: string; icon: string; color: string } {
    const info = TRUST_BADGES.find(b => b.id === badge);
    return info ? { label: info.label, icon: info.icon, color: info.color } : { label: badge, icon: "✨", color: "bg-slate-100 text-slate-700" };
  },
};