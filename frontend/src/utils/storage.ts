import type { User, Need, Match, Collaboration, ProjectCard, CreditTransaction, Feedback, Reward } from "@/types";
import { STORAGE_KEYS } from "@/utils/constants";

// Generic storage helpers
export function get<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

export function set<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Failed to save ${key}:`, e);
  }
}

export function generateId(prefix = "id"): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function nowISO(): string {
  return new Date().toISOString();
}

// Auth storage
export function getAuthToken(): string | null {
  return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
}

export function setAuthToken(token: string): void {
  localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
}

export function clearAuthToken(): void {
  localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
}

export function getCurrentUserId(): string | null {
  try {
    const demo = getDemoState();
    if (demo?.currentImpersonation) {
      return demo.currentImpersonation;
    }
    const current = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (current) return current;

    // Fallback to first seeded user so account is always authenticated
    const users = getUsers();
    if (users.length > 0) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, users[0].id);
      return users[0].id;
    }
  } catch {}
  return null;
}

export function setCurrentUserId(userId: string): void {
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, userId);
}

export function clearCurrentUserId(): void {
  localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
}

// Users
export function getUsers(): User[] {
  return get(STORAGE_KEYS.USERS, []);
}

export function saveUsers(users: User[]): void {
  set(STORAGE_KEYS.USERS, users);
}

export function getUserById(id: string): User | undefined {
  return getUsers().find(u => u.id === id);
}

export function getUserByEmail(email: string): User | undefined {
  return getUsers().find(u => u.email.toLowerCase() === email.toLowerCase());
}

export function saveUser(user: User): void {
  const users = getUsers();
  const idx = users.findIndex(u => u.id === user.id);
  if (idx >= 0) users[idx] = user;
  else users.push(user);
  saveUsers(users);
}

// Needs
export function getNeeds(): Need[] {
  return get(STORAGE_KEYS.NEEDS, []);
}

export function saveNeeds(needs: Need[]): void {
  set(STORAGE_KEYS.NEEDS, needs);
}

export function getNeedById(id: string): Need | undefined {
  return getNeeds().find(n => n.id === id);
}

export function saveNeed(need: Need): void {
  const needs = getNeeds();
  const idx = needs.findIndex(n => n.id === need.id);
  if (idx >= 0) needs[idx] = need;
  else needs.push(need);
  saveNeeds(needs);
}

// Matches
export function getMatches(): Match[] {
  return get(STORAGE_KEYS.MATCHES, []);
}

export function saveMatches(matches: Match[]): void {
  set(STORAGE_KEYS.MATCHES, matches);
}

export function getMatchById(id: string): Match | undefined {
  return getMatches().find(m => m.id === id);
}

export function saveMatch(match: Match): void {
  const matches = getMatches();
  const idx = matches.findIndex(m => m.id === match.id);
  if (idx >= 0) matches[idx] = match;
  else matches.push(match);
  saveMatches(matches);
}

// Collaborations
export function getCollaborations(): Collaboration[] {
  return get(STORAGE_KEYS.COLLABORATIONS, []);
}

export function saveCollaborations(collabs: Collaboration[]): void {
  set(STORAGE_KEYS.COLLABORATIONS, collabs);
}

export function getCollaborationById(id: string): Collaboration | undefined {
  return getCollaborations().find(c => c.id === id);
}

export function getCollaborationByMatchId(matchId: string): Collaboration | undefined {
  return getCollaborations().find(c => c.matchId === matchId);
}

export function saveCollaboration(collab: Collaboration): void {
  const collabs = getCollaborations();
  const idx = collabs.findIndex(c => c.id === collab.id);
  if (idx >= 0) collabs[idx] = collab;
  else collabs.push(collab);
  saveCollaborations(collabs);
}

// Project Cards
export function getProjectCards(): ProjectCard[] {
  return get(STORAGE_KEYS.PROJECT_CARDS, []);
}

export function saveProjectCards(cards: ProjectCard[]): void {
  set(STORAGE_KEYS.PROJECT_CARDS, cards);
}

export function getProjectCardById(id: string): ProjectCard | undefined {
  return getProjectCards().find(p => p.id === id);
}

export function saveProjectCard(card: ProjectCard): void {
  const cards = getProjectCards();
  const idx = cards.findIndex(c => c.id === card.id);
  if (idx >= 0) cards[idx] = card;
  else cards.push(card);
  saveProjectCards(cards);
}

// Credit Transactions
export function getCreditTransactions(): CreditTransaction[] {
  return get(STORAGE_KEYS.CREDIT_TRANSACTIONS, []);
}

export function saveCreditTransactions(txns: CreditTransaction[]): void {
  set(STORAGE_KEYS.CREDIT_TRANSACTIONS, txns);
}

export function addCreditTransaction(txn: CreditTransaction): void {
  const txns = getCreditTransactions();
  txns.unshift(txn);
  saveCreditTransactions(txns);
}

// Feedback
export function getFeedback(): Feedback[] {
  return get(STORAGE_KEYS.FEEDBACK, []);
}

export function saveFeedback(feedback: Feedback[]): void {
  set(STORAGE_KEYS.FEEDBACK, feedback);
}

export function addFeedback(fb: Feedback): void {
  const feedback = getFeedback();
  feedback.unshift(fb);
  saveFeedback(feedback);
}

// Rewards
export function getRewards(): Reward[] {
  return get(STORAGE_KEYS.REWARDS, []);
}

export function saveRewards(rewards: Reward[]): void {
  set(STORAGE_KEYS.REWARDS, rewards);
}

// Demo state
export interface DemoState {
  simulatedPartnerConsent: "pending" | "accepted" | "rejected";
  currentImpersonation: string | null;
}

export function getDemoState(): DemoState {
  return get(STORAGE_KEYS.DEMO_STATE, { simulatedPartnerConsent: "pending", currentImpersonation: null });
}

export function saveDemoState(state: DemoState): void {
  set(STORAGE_KEYS.DEMO_STATE, state);
}

// Reset all data
export function resetAllData(): void {
  Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
}

// Export all for easy import
export const storage = {
  get,
  set,
  generateId,
  nowISO,
  getAuthToken,
  setAuthToken,
  clearAuthToken,
  getCurrentUserId,
  setCurrentUserId,
  clearCurrentUserId,
  getUsers,
  saveUsers,
  getUserById,
  getUserByEmail,
  saveUser,
  getNeeds,
  saveNeeds,
  getNeedById,
  saveNeed,
  getMatches,
  saveMatches,
  getMatchById,
  saveMatch,
  getCollaborations,
  saveCollaborations,
  getCollaborationById,
  getCollaborationByMatchId,
  saveCollaboration,
  getProjectCards,
  saveProjectCards,
  getProjectCardById,
  saveProjectCard,
  getCreditTransactions,
  saveCreditTransactions,
  addCreditTransaction,
  getFeedback,
  saveFeedback,
  addFeedback,
  getRewards,
  saveRewards,
  getDemoState,
  saveDemoState,
  resetAllData,
};