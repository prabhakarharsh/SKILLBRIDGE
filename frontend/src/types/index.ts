export type Availability = "now" | "this-week" | "this-month" | "busy";
export type TrustBadge = "Reliable" | "Great Mentor" | "Fast Responder" | "Quality Work";
export type NeedMode = "learn" | "buddy";
export type NeedStatus = "open" | "matched" | "in-progress" | "completed" | "cancelled";
export type MatchStatus = "suggested" | "consented" | "rejected" | "expired";
export type ConsentState = "pending" | "accepted" | "rejected";
export type CollaborationStatus = "pending-consent" | "active" | "completed" | "cancelled";
export type CreditReason = "teach-session" | "complete-project" | "request-help" | "redeem-reward";
export type CreditType = "earned" | "spent";
export type RewardCategory = "food" | "academic" | "event" | "priority";

export interface User {
  id: string;
  email: string;
  name: string;
  branch: string;
  year: number;
  skills: string[];
  availability: Availability;
  bio: string;
  avatar?: string;
  rating: number;
  credits: number;
  trustBadges: TrustBadge[];
  isVerified: boolean;
  createdAt: string;
}

export interface Need {
  id: string;
  authorId: string;
  mode: NeedMode;
  title: string;
  description: string;
  requiredSkills: string[];
  duration?: number;
  deadline?: string;
  rolesNeeded?: Role[];
  status: NeedStatus;
  createdAt: string;
}

export interface Role {
  id: string;
  title: string;
  skills: string[];
  description: string;
}

export interface Match {
  id: string;
  needId: string;
  seekerId: string;
  providerId: string;
  score: number;
  reasons: MatchReason[];
  status: MatchStatus;
  createdAt: string;
}

export interface MatchReason {
  type: "skill-fit" | "availability" | "rating" | "college" | "complementary";
  label: string;
  detail: string;
  weight: number;
}

export interface Collaboration {
  id: string;
  matchId: string;
  needId: string;
  participants: string[];
  consentStatus: Record<string, ConsentState>;
  agreement?: Agreement;
  projectCardId?: string;
  status: CollaborationStatus;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
}

export interface Agreement {
  id: string;
  collaborationId: string;
  roles: AgreedRole[];
  deadline: string;
  expectedOutput: string;
  signedBy: string[];
  createdAt: string;
}

export interface AgreedRole {
  userId: string;
  roleTitle: string;
  responsibilities: string[];
}

export interface ProjectCard {
  id: string;
  collaborationId: string;
  title: string;
  participants: ProjectParticipant[];
  roles: AgreedRole[];
  skillsUsed: string[];
  startDate: string;
  endDate: string;
  description: string;
  verificationBadge: string;
  shareToken: string;
  createdAt: string;
}

export interface ProjectParticipant {
  userId: string;
  name: string;
  role: string;
  skills: string[];
}

export interface CreditTransaction {
  id: string;
  userId: string;
  type: CreditType;
  amount: number;
  reason: CreditReason;
  referenceId?: string;
  createdAt: string;
}

export interface Feedback {
  id: string;
  collaborationId: string;
  fromUserId: string;
  toUserId: string;
  ratings: FeedbackRatings;
  comment: string;
  isAnonymous: boolean;
  createdAt: string;
}

export interface FeedbackRatings {
  communication: number;
  reliability: number;
  skill: number;
  responsiveness: number;
}

export interface Reward {
  id: string;
  name: string;
  description: string;
  cost: number;
  icon: string;
  category: RewardCategory;
}

export interface AuthResult {
  user: User | null;
  error?: string;
}

export interface MatchInput {
  seeker: User;
  provider: User;
  need: Need;
  allUsers: User[];
}

export interface MatchOutput {
  score: number;
  reasons: MatchReason[];
}