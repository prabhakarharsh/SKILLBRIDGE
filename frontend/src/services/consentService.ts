import type { Collaboration, ConsentState, Match, Need, User } from "@/types";
import { storage, generateId, nowISO } from "@/utils/storage";
import { matchService } from "@/services/matchService";
import { needService } from "@/services/needService";
import { userService } from "@/services/userService";

/**
 * Consent Service - Manages the mutual consent gate
 * 
 * AWS Mapping:
 * - createCollaboration → DynamoDB PutItem (Collaborations table, PK: collaborationId, GSI: userId)
 * - getCollaboration → DynamoDB GetItem
 * - getUserCollaborations → DynamoDB Query (userId-index)
 * - updateConsent → DynamoDB UpdateItem with condition expression
 * - checkMutualConsent → Read collaboration, check both consentStatus = "accepted"
 * 
 * Consent is the critical gate - both parties must explicitly accept
 */
export const consentService = {
  /**
   * Create a collaboration from a consented match
   * Called when first user accepts a match
   */
  async createCollaboration(matchId: string): Promise<Collaboration | null> {
    const match = await matchService.getMatch(matchId);
    if (!match) return null;

    // Check if collaboration already exists
    const existing = storage.getCollaborationByMatchId(matchId);
    if (existing) return existing;

    const collaboration: Collaboration = {
      id: generateId("collab"),
      matchId,
      needId: match.needId,
      participants: [match.seekerId, match.providerId],
      consentStatus: {
        [match.seekerId]: "pending",
        [match.providerId]: "pending",
      },
      status: "pending-consent",
      createdAt: nowISO(),
    };

    storage.saveCollaboration(collaboration);
    return collaboration;
  },

  /**
   * Get collaboration by ID
   */
  async getCollaboration(id: string): Promise<Collaboration | null> {
    return storage.getCollaborationById(id) || null;
  },

  /**
   * Get collaboration by match ID
   */
  async getCollaborationByMatchId(matchId: string): Promise<Collaboration | null> {
    return storage.getCollaborationByMatchId(matchId) || null;
  },

  /**
   * Get all collaborations for a user
   */
  async getUserCollaborations(userId: string): Promise<Collaboration[]> {
    return storage.getCollaborations()
      .filter(c => c.participants.includes(userId))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  /**
   * Get active collaborations for a user
   */
  async getActiveCollaborations(userId: string): Promise<Collaboration[]> {
    const collabs = await this.getUserCollaborations(userId);
    return collabs.filter(c => c.status === "active" || c.status === "pending-consent");
  },

  /**
   * Update consent status for a user
   * This is the core "Go Ahead" action
   */
  async updateConsent(
    collaborationId: string, 
    userId: string, 
    status: ConsentState
  ): Promise<Collaboration | null> {
    const collab = storage.getCollaborationById(collaborationId);
    if (!collab) return null;

    if (!collab.participants.includes(userId)) return null;

    const updatedConsent = { ...collab.consentStatus, [userId]: status };
    const mutual = this.checkMutualConsent(updatedConsent);

    const updated: Collaboration = {
      ...collab,
      consentStatus: updatedConsent,
      status: mutual ? "active" : "pending-consent",
      startedAt: mutual ? nowISO() : collab.startedAt,
    };

    storage.saveCollaboration(updated);

    // Update match status
    if (mutual) {
      await matchService.updateMatchStatus(collab.matchId, "consented");
    }

    return updated;
  },

  /**
   * Check if both parties have accepted
   */
  checkMutualConsent(consentStatus: Record<string, ConsentState>): boolean {
    const values = Object.values(consentStatus);
    return values.length === 2 && values.every(v => v === "accepted");
  },

  /**
   * Get the other participant's ID
   */
  getOtherParticipant(collab: Collaboration, userId: string): string | null {
    return collab.participants.find(p => p !== userId) || null;
  },

  /**
   * Get other participant's consent status
   */
  getOtherConsent(collab: Collaboration, userId: string): ConsentState | null {
    const otherId = this.getOtherParticipant(collab, userId);
    if (!otherId) return null;
    return collab.consentStatus[otherId] || "pending";
  },

  /**
   * Get user's own consent status
   */
  getMyConsent(collab: Collaboration, userId: string): ConsentState {
    return collab.consentStatus[userId] || "pending";
  },

  /**
   * Check if collaboration is ready for agreement (both consented)
   */
  async isReadyForAgreement(collaborationId: string): Promise<boolean> {
    const collab = await this.getCollaboration(collaborationId);
    if (!collab) return false;
    return this.checkMutualConsent(collab.consentStatus);
  },

  /**
   * Cancel collaboration (by either party before mutual consent)
   */
  async cancelCollaboration(collaborationId: string, userId: string): Promise<boolean> {
    const collab = storage.getCollaborationById(collaborationId);
    if (!collab) return false;
    if (!collab.participants.includes(userId)) return false;
    if (collab.status === "completed") return false;

    const updated = { ...collab, status: "cancelled" as const };
    storage.saveCollaboration(updated);
    
    // Update match status
    await matchService.updateMatchStatus(collab.matchId, "rejected");
    
    return true;
  },

  /**
   * Complete collaboration (after project done)
   */
  async completeCollaboration(collaborationId: string): Promise<Collaboration | null> {
    const collab = storage.getCollaborationById(collaborationId);
    if (!collab) return null;

    const updated: Collaboration = {
      ...collab,
      status: "completed",
      completedAt: nowISO(),
    };

    storage.saveCollaboration(updated);
    return updated;
  },

  /**
   * Get collaboration with full details (for chat room)
   */
  async getCollaborationWithDetails(collaborationId: string): Promise<{
    collaboration: Collaboration;
    match: Match | null;
    need: Need | null;
    seeker: User | null;
    provider: User | null;
  } | null> {
    const collab = await this.getCollaboration(collaborationId);
    if (!collab) return null;

    const [match, need, seeker, provider] = await Promise.all([
      matchService.getMatch(collab.matchId),
      needService.getNeed(collab.needId),
      userService.getUser(collab.participants[0]),
      userService.getUser(collab.participants[1]),
    ]);

    return { collaboration: collab, match, need, seeker, provider };
  },
};