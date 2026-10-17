import type { Match, Need, User } from "@/types";
import { storage, generateId, nowISO } from "@/utils/storage";
import { computeMatchScore, findMatchesForNeed } from "@/utils/matching";
import { needService } from "@/services/needService";
import { userService } from "@/services/userService";

/**
 * Match Service
 * 
 * AWS Mapping:
 * - findMatches → Lambda function (POST /match) 
 *   - Reads need from DynamoDB
 *   - Queries users by skills from DynamoDB GSI
 *   - Runs computeMatchScore (this pure function)
 *   - Returns top N matches
 * - getMatch → DynamoDB GetItem (Matches table, PK: matchId)
 * - updateMatchStatus → DynamoDB UpdateItem
 * 
 * Matching runs async in background via EventBridge → Lambda
 */
export const matchService = {
  /**
   * Find and create matches for a need
   * Returns created Match objects with scores and reasons
   */
  async findMatches(needId: string): Promise<Match[]> {
    const need = await needService.getNeed(needId);
    if (!need) return [];

    const allUsers = await userService.getAllVerifiedUsers();
    const seeker = await userService.getUser(need.authorId);
    if (!seeker) return [];

    // Compute match scores for all potential providers
    const matchOutputs = findMatchesForNeed(need, allUsers, need.authorId, 10);

    // Create Match records
    const matches: Match[] = matchOutputs.map((output, index) => {
      const provider = allUsers.find(u => 
        output.reasons.some(r => r.detail.includes(u.skills[0] || ""))
      ) || allUsers[index];

      const match: Match = {
        id: generateId("match"),
        needId,
        seekerId: need.authorId,
        providerId: provider.id,
        score: output.score,
        reasons: output.reasons,
        status: "suggested",
        createdAt: nowISO(),
      };
      return match;
    });

    // Save matches
    const existingMatches = storage.getMatches();
    const updatedMatches = [...existingMatches, ...matches];
    storage.saveMatches(updatedMatches);

    // Update need status
    await needService.setNeedStatus(needId, "matched");

    return matches;
  },

  /**
   * Get matches for a specific need
   */
  async getMatchesForNeed(needId: string): Promise<Match[]> {
    return storage.getMatches()
      .filter(m => m.needId === needId)
      .sort((a, b) => b.score - a.score);
  },

  /**
   * Get match by ID
   */
  async getMatch(id: string): Promise<Match | null> {
    return storage.getMatchById(id) || null;
  },

  /**
   * Get matches where user is the provider
   */
  async getMatchesForProvider(providerId: string): Promise<Match[]> {
    return storage.getMatches()
      .filter(m => m.providerId === providerId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  /**
   * Get matches where user is the seeker
   */
  async getMatchesForSeeker(seekerId: string): Promise<Match[]> {
    return storage.getMatches()
      .filter(m => m.seekerId === seekerId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  /**
   * Update match status (consented, rejected, expired)
   */
  async updateMatchStatus(id: string, status: Match["status"]): Promise<Match | null> {
    const match = storage.getMatchById(id);
    if (!match) return null;

    const updated = { ...match, status };
    storage.saveMatch(updated);
    return updated;
  },

  /**
   * Accept a match (provider side) - creates collaboration
   */
  async acceptMatch(matchId: string): Promise<Match | null> {
    return this.updateMatchStatus(matchId, "consented");
  },

  /**
   * Reject a match
   */
  async rejectMatch(matchId: string): Promise<Match | null> {
    return this.updateMatchStatus(matchId, "rejected");
  },

  /**
   * Recompute matches for a need (e.g., after new users join)
   */
  async recomputeMatches(needId: string): Promise<Match[]> {
    // Delete old suggested matches
    const matches = storage.getMatches();
    const filtered = matches.filter(m => !(m.needId === needId && m.status === "suggested"));
    storage.saveMatches(filtered);

    // Find new matches
    return this.findMatches(needId);
  },

  /**
   * Get match with full user details
   */
  async getMatchWithDetails(matchId: string): Promise<{
    match: Match;
    need: Need | null;
    seeker: User | null;
    provider: User | null;
  } | null> {
    const match = await this.getMatch(matchId);
    if (!match) return null;

    const [need, seeker, provider] = await Promise.all([
      needService.getNeed(match.needId),
      userService.getUser(match.seekerId),
      userService.getUser(match.providerId),
    ]);

    return { match, need, seeker, provider };
  },
};