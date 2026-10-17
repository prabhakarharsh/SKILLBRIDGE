import type { ProjectCard, ProjectParticipant, AgreedRole, Collaboration, User, Need } from "@/types";
import { storage, generateId, nowISO } from "@/utils/storage";
import { consentService } from "@/services/consentService";
import { needService } from "@/services/needService";
import { userService } from "@/services/userService";
import { generateShareToken } from "@/utils/helpers";

/**
 * Project Service - Verified Project Cards
 * 
 * AWS Mapping:
 * - createProjectCard → DynamoDB PutItem (ProjectCards table, PK: projectId)
 *   + S3 PutObject (card assets: JSON, generated PNG)
 * - getProjectCard → DynamoDB GetItem
 * - getUserProjectCards → DynamoDB Query (userId-index via participants)
 * - generateShareLink → CloudFront signed URL for S3 object
 * - downloadAsImage → Lambda@Edge or client-side html2canvas (current impl)
 */
export const projectService = {
  /**
   * Create a Verified Project Card after collaboration completion
   */
  async createProjectCard(data: {
    collaborationId: string;
    title: string;
    description: string;
    skillsUsed: string[];
    roles: AgreedRole[];
  }): Promise<ProjectCard | null> {
    const collab = await consentService.getCollaboration(data.collaborationId);
    if (!collab || collab.status !== "completed") return null;

    const need = await needService.getNeed(collab.needId);
    if (!need) return null;

    // Get participants with full details
    const participants: ProjectParticipant[] = [];
    for (const userId of collab.participants) {
      const user = await userService.getUser(userId);
      if (!user) continue;
      
      const role = data.roles.find(r => r.userId === userId);
      participants.push({
        userId: user.id,
        name: user.name,
        role: role?.roleTitle || (userId === need.authorId ? "Project Lead" : "Contributor"),
        skills: user.skills,
      });
    }

    const projectCard: ProjectCard = {
      id: generateId("project"),
      collaborationId: data.collaborationId,
      title: data.title,
      participants,
      roles: data.roles,
      skillsUsed: data.skillsUsed,
      startDate: collab.startedAt || collab.createdAt,
      endDate: nowISO(),
      description: data.description,
      verificationBadge: "Verified by SkillBridge",
      shareToken: generateShareToken(),
      createdAt: nowISO(),
    };

    storage.saveProjectCard(projectCard);

    // Link to collaboration
    const updatedCollab = { ...collab, projectCardId: projectCard.id };
    storage.saveCollaboration(updatedCollab);

    return projectCard;
  },

  /**
   * Get project card by ID
   */
  async getProjectCard(id: string): Promise<ProjectCard | null> {
    return storage.getProjectCardById(id) || null;
  },

  /**
   * Get project card by share token (public access)
   */
  async getProjectCardByToken(token: string): Promise<ProjectCard | null> {
    const cards = storage.getProjectCards();
    return cards.find(c => c.shareToken === token) || null;
  },

  /**
   * Get all project cards for a user
   */
  async getUserProjectCards(userId: string): Promise<ProjectCard[]> {
    return storage.getProjectCards()
      .filter(p => p.participants.some(pt => pt.userId === userId))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  /**
   * Generate public share link
   * Real: Returns CloudFront signed URL with expiration
   */
  async generateShareLink(projectId: string): Promise<string> {
    const card = await this.getProjectCard(projectId);
    if (!card) return "";
    
    // Mock: return a shareable URL
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "http://localhost:5173";
    return `${baseUrl}/project/${card.shareToken}`;
  },

  /**
   * Get project card with full details for display
   */
  async getProjectCardWithDetails(projectId: string): Promise<{
    card: ProjectCard;
    collaboration: Collaboration | null;
    need: Need | null;
  } | null> {
    const card = await this.getProjectCard(projectId);
    if (!card) return null;

    const [collaboration, need] = await Promise.all([
      consentService.getCollaboration(card.collaborationId),
      needService.getNeed(card.collaborationId), // This should be needId
    ]);

    return { card, collaboration, need };
  },

  /**
   * Update project card (e.g., add description, fix typo)
   */
  async updateProjectCard(projectId: string, data: Partial<ProjectCard>): Promise<ProjectCard | null> {
    const card = storage.getProjectCardById(projectId);
    if (!card) return null;

    const updated = { ...card, ...data };
    storage.saveProjectCard(updated);
    return updated;
  },

  /**
   * Delete project card (admin only in real app)
   */
  async deleteProjectCard(projectId: string): Promise<boolean> {
    const card = storage.getProjectCardById(projectId);
    if (!card) return false;

    const cards = storage.getProjectCards().filter(c => c.id !== projectId);
    storage.saveProjectCards(cards);
    return true;
  },
};