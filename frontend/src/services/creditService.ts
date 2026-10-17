import type { CreditTransaction, CreditReason, CreditType } from "@/types";
import { storage, generateId, nowISO } from "@/utils/storage";
import { CREDIT_RULES } from "@/utils/constants";

/**
 * Credit Service - SkillCredits economy
 * 
 * AWS Mapping:
 * - getBalance → DynamoDB Query (CreditTransactions table, PK: userId) - sum amounts
 * - getHistory → DynamoDB Query (userId, descending by timestamp)
 * - addCredits/spendCredits → DynamoDB TransactWriteItems (atomic balance update + transaction record)
 * - canAfford → Read balance, compare
 * 
 * Credits: Teach 30min = +1, Complete Buddy = +3, Request Help = -1
 * No real money - purely reputation/access currency
 */
export const creditService = {
  /**
   * Get current credit balance for a user
   */
  async getBalance(userId: string): Promise<number> {
    const transactions = storage.getCreditTransactions()
      .filter(t => t.userId === userId);
    
    return transactions.reduce((sum, t) => sum + (t.type === "earned" ? t.amount : -t.amount), 0);
  },

  /**
   * Get credit transaction history
   */
  async getHistory(userId: string, limit = 50): Promise<CreditTransaction[]> {
    return storage.getCreditTransactions()
      .filter(t => t.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  },

  /**
   * Add credits (earn)
   */
  async addCredits(
    userId: string, 
    reason: CreditReason, 
    referenceId?: string
  ): Promise<CreditTransaction> {
    const amount = CREDIT_RULES[reason] || 0;
    if (amount <= 0) throw new Error(`Invalid earn reason: ${reason}`);

    const txn: CreditTransaction = {
      id: generateId("txn"),
      userId,
      type: "earned",
      amount,
      reason,
      referenceId,
      createdAt: nowISO(),
    };

    storage.addCreditTransaction(txn);
    return txn;
  },

  /**
   * Spend credits
   */
  async spendCredits(
    userId: string, 
    reason: CreditReason, 
    referenceId?: string
  ): Promise<CreditTransaction> {
    const amount = Math.abs(CREDIT_RULES[reason] || 0);
    if (amount <= 0) throw new Error(`Invalid spend reason: ${reason}`);

    // Check balance
    const canAfford = await this.canAfford(userId, amount);
    if (!canAfford) throw new Error("Insufficient credits");

    const txn: CreditTransaction = {
      id: generateId("txn"),
      userId,
      type: "spent",
      amount,
      reason,
      referenceId,
      createdAt: nowISO(),
    };

    storage.addCreditTransaction(txn);
    return txn;
  },

  /**
   * Check if user can afford a credit cost
   */
  async canAfford(userId: string, amount: number): Promise<boolean> {
    const balance = await this.getBalance(userId);
    return balance >= amount;
  },

  /**
   * Get credit earning rules (for UI display)
   */
  getCreditRules(): Record<CreditReason, number> {
    return { ...CREDIT_RULES };
  },

  /**
   * Process credits for teaching a Learn session
   */
  async processTeachSession(providerId: string, needId: string): Promise<CreditTransaction> {
    return this.addCredits(providerId, "teach-session", needId);
  },

  /**
   * Process credits for completing a Buddy project
   */
  async processCompleteProject(userId: string, collaborationId: string): Promise<CreditTransaction> {
    return this.addCredits(userId, "complete-project", collaborationId);
  },

  /**
   * Process credits for requesting help (Learn mode)
   */
  async processRequestHelp(seekerId: string, needId: string): Promise<CreditTransaction> {
    return this.spendCredits(seekerId, "request-help", needId);
  },

  /**
   * Process credit redemption for reward
   */
  async processRedeemReward(userId: string, rewardId: string, cost: number): Promise<CreditTransaction> {
    const txn: CreditTransaction = {
      id: generateId("txn"),
      userId,
      type: "spent",
      amount: cost,
      reason: "redeem-reward",
      referenceId: rewardId,
      createdAt: nowISO(),
    };
    storage.addCreditTransaction(txn);
    return txn;
  },

  /**
   * Get formatted history for display
   */
  async getFormattedHistory(userId: string): Promise<Array<{
    id: string;
    date: string;
    type: "earned" | "spent";
    amount: number;
    reason: string;
    description: string;
  }>> {
    const history = await this.getHistory(userId);
    
    const reasonLabels: Record<CreditReason, string> = {
      "teach-session": "Taught a 30-min session",
      "complete-project": "Completed a Buddy project",
      "request-help": "Requested skill help",
      "redeem-reward": "Redeemed a reward",
    };

    return history.map(t => ({
      id: t.id,
      date: t.createdAt,
      type: t.type,
      amount: t.amount,
      reason: t.reason,
      description: reasonLabels[t.reason] || t.reason,
    }));
  },

  /**
   * Get total earned/spent stats
   */
  async getStats(userId: string): Promise<{
    totalEarned: number;
    totalSpent: number;
    currentBalance: number;
    teachSessions: number;
    projectsCompleted: number;
    helpRequests: number;
    rewardsRedeemed: number;
  }> {
    const transactions = storage.getCreditTransactions().filter(t => t.userId === userId);
    
    const stats = transactions.reduce((acc, t) => {
      if (t.type === "earned") {
        acc.totalEarned += t.amount;
        if (t.reason === "teach-session") acc.teachSessions++;
        if (t.reason === "complete-project") acc.projectsCompleted++;
      } else {
        acc.totalSpent += t.amount;
        if (t.reason === "request-help") acc.helpRequests++;
        if (t.reason === "redeem-reward") acc.rewardsRedeemed++;
      }
      return acc;
    }, {
      totalEarned: 0,
      totalSpent: 0,
      currentBalance: 0,
      teachSessions: 0,
      projectsCompleted: 0,
      helpRequests: 0,
      rewardsRedeemed: 0,
    });

    stats.currentBalance = stats.totalEarned - stats.totalSpent;
    return stats;
  },
};