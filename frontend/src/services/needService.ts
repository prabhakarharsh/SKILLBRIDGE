import type { Need, NeedMode } from "@/types";
import { storage, generateId, nowISO } from "@/utils/storage";

/**
 * Need Service
 * 
 * AWS Mapping:
 * - createNeed → DynamoDB PutItem (Needs table, PK: needId, GSI: authorId, GSI: status)
 * - getNeed → DynamoDB GetItem
 * - getUserNeeds → DynamoDB Query (authorId-index)
 * - getOpenNeeds → DynamoDB Query (status-index) with filter on mode
 * - updateNeed → DynamoDB UpdateItem
 * - deleteNeed → DynamoDB DeleteItem
 */
export const needService = {
  /**
   * Create a new need (Learn or Buddy mode)
   */
  async createNeed(need: Omit<Need, "id" | "createdAt" | "status">): Promise<Need> {
    const newNeed: Need = {
      ...need,
      id: generateId("need"),
      status: "open",
      createdAt: nowISO(),
    };
    
    const needs = storage.getNeeds();
    needs.unshift(newNeed);
    storage.saveNeeds(needs);
    
    return newNeed;
  },

  /**
   * Get need by ID
   */
  async getNeed(id: string): Promise<Need | null> {
    return storage.getNeedById(id) || null;
  },

  /**
   * Get all needs by a user
   */
  async getUserNeeds(userId: string): Promise<Need[]> {
    return storage.getNeeds()
      .filter(n => n.authorId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  /**
   * Get open needs, optionally filtered by mode
   */
  async getOpenNeeds(mode?: NeedMode): Promise<Need[]> {
    let needs = storage.getNeeds().filter(n => n.status === "open");
    
    if (mode) {
      needs = needs.filter(n => n.mode === mode);
    }
    
    return needs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  /**
   * Update need (e.g., change status, update details)
   */
  async updateNeed(id: string, data: Partial<Need>): Promise<Need | null> {
    const need = storage.getNeedById(id);
    if (!need) return null;

    const updated = { ...need, ...data };
    storage.saveNeed(updated);
    return updated;
  },

  /**
   * Delete a need (only if open and no active matches)
   */
  async deleteNeed(id: string): Promise<boolean> {
    const need = storage.getNeedById(id);
    if (!need) return false;
    
    if (need.status !== "open") return false;

    const needs = storage.getNeeds().filter(n => n.id !== id);
    storage.saveNeeds(needs);
    return true;
  },

  /**
   * Mark need as matched/in-progress/completed
   */
  async setNeedStatus(id: string, status: Need["status"]): Promise<Need | null> {
    return this.updateNeed(id, { status });
  },

  /**
   * Get needs needing matches (for background matching job)
   */
  async getNeedsNeedingMatches(): Promise<Need[]> {
    return storage.getNeeds().filter(n => n.status === "open");
  },
};