import type { User } from "@/types";
import { storage } from "@/utils/storage";

/**
 * User Service
 * 
 * AWS Mapping:
 * - getUser/getUsers → DynamoDB GetItem / Query (Users table, PK: userId)
 * - getUsersBySkills → DynamoDB Query with GSI (skills-index)
 * - searchUsers → DynamoDB Scan with filter or OpenSearch
 * - updateUser → DynamoDB UpdateItem
 */
export const userService = {
  /**
   * Get user by ID
   */
  async getUser(id: string): Promise<User | null> {
    return storage.getUserById(id) || null;
  },

  /**
   * Get multiple users by IDs
   */
  async getUsersByIds(ids: string[]): Promise<User[]> {
    const allUsers = storage.getUsers();
    return allUsers.filter(u => ids.includes(u.id));
  },

  /**
   * Get all verified users (for matching)
   */
  async getAllVerifiedUsers(): Promise<User[]> {
    return storage.getUsers().filter(u => u.isVerified);
  },

  /**
   * Get users who have at least one of the required skills
   */
  async getUsersBySkills(skills: string[]): Promise<User[]> {
    const skillSet = new Set(skills.map(s => s.toLowerCase()));
    return storage.getUsers().filter(u => 
      u.isVerified && 
      u.skills.some(s => skillSet.has(s.toLowerCase()))
    );
  },

  /**
   * Get all users (for admin/demo)
   */
  async getAllUsers(): Promise<User[]> {
    return storage.getUsers().filter(u => u.isVerified);
  },

  /**
   * Search users by name, skills, branch
   */
  async searchUsers(query: string): Promise<User[]> {
    const q = query.toLowerCase().trim();
    if (!q) return [];
    
    return storage.getUsers().filter(u => 
      u.isVerified && (
        u.name.toLowerCase().includes(q) ||
        u.branch.toLowerCase().includes(q) ||
        u.skills.some(s => s.toLowerCase().includes(q)) ||
        u.bio.toLowerCase().includes(q)
      )
    );
  },

  /**
   * Update user profile
   */
  async updateUser(id: string, data: Partial<User>): Promise<User | null> {
    const user = storage.getUserById(id);
    if (!user) return null;

    const updated = { ...user, ...data };
    storage.saveUser(updated);
    return updated;
  },

  /**
   * Update user skills
   */
  async updateSkills(userId: string, skills: string[]): Promise<User | null> {
    return this.updateUser(userId, { skills });
  },

  /**
   * Update availability
   */
  async updateAvailability(userId: string, availability: User["availability"]): Promise<User | null> {
    return this.updateUser(userId, { availability });
  },

  /**
   * Add trust badge to user (from feedback)
   */
  async addTrustBadge(userId: string, badge: User["trustBadges"][0]): Promise<User | null> {
    const user = storage.getUserById(userId);
    if (!user) return null;

    if (!user.trustBadges.includes(badge)) {
      return this.updateUser(userId, { trustBadges: [...user.trustBadges, badge] });
    }
    return user;
  },

  /**
   * Get users by availability
   */
  async getUsersByAvailability(availability: User["availability"]): Promise<User[]> {
    return storage.getUsers().filter(u => u.isVerified && u.availability === availability);
  },

  /**
   * Get top rated users
   */
  async getTopRated(limit = 10): Promise<User[]> {
    return storage.getUsers()
      .filter(u => u.isVerified)
      .sort((a, b) => b.rating - a.rating)
      .slice(0, limit);
  },
};