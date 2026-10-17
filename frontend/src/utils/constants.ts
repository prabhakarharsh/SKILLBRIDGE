import type { Availability, TrustBadge } from "@/types";

export const COLLEGE_DOMAIN = "@skillbridge.edu";

export const SKILLS_LIST = [
  "React", "TypeScript", "JavaScript", "CSS", "Tailwind", "HTML",
  "Node.js", "Express", "MongoDB", "PostgreSQL", "GraphQL",
  "Python", "Django", "FastAPI", "Pandas", "NumPy",
  "Machine Learning", "PyTorch", "TensorFlow", "Data Science",
  "DSA", "Algorithms", "System Design",
  "Figma", "UI/UX", "Illustrator", "Photoshop",
  "Video Editing", "Premiere", "After Effects",
  "Docker", "AWS", "Git", "Testing", "Storybook",
  "Next.js", "Remix", "Vite", "Webpack",
] as const;

export const AVAILABILITY_OPTIONS: { value: Availability; label: string; description: string }[] = [
  { value: "now", label: "Available Now", description: "Free for the next few hours" },
  { value: "this-week", label: "This Week", description: "Can schedule within a week" },
  { value: "this-month", label: "This Month", description: "Flexible within the month" },
  { value: "busy", label: "Busy", description: "Not available for new collaborations" },
];

export const BRANCHES = [
  "Computer Science", "Electronics", "Mechanical", "Civil", 
  "Design", "Information Technology", "Data Science", "AI/ML",
  "Other"
] as const;

export const YEARS = [1, 2, 3, 4, 5] as const;

export const REWARDS = [
  {
    id: "canteen-credit",
    name: "Canteen Credit",
    description: "₹100 canteen voucher for snacks or meals",
    cost: 5,
    icon: "🍔",
    category: "food" as const,
  },
  {
    id: "faculty-cert",
    name: "Faculty Certificate",
    description: "Official certificate signed by faculty advisor",
    cost: 10,
    icon: "📜",
    category: "academic" as const,
  },
  {
    id: "workshop-priority",
    name: "Workshop Priority Access",
    description: "Early registration for campus workshops & tech talks",
    cost: 8,
    icon: "🎓",
    category: "academic" as const,
  },
  {
    id: "fest-perks",
    name: "Tech Fest Perks",
    description: "VIP pass + merchandise for annual tech fest",
    cost: 15,
    icon: "🎪",
    category: "event" as const,
  },
  {
    id: "mentor-badge",
    name: "Mentor Recognition",
    description: "Featured on campus mentor wall + LinkedIn shoutout",
    cost: 20,
    icon: "⭐",
    category: "priority" as const,
  },
] as const;

export const TRUST_BADGES = [
  { id: "Reliable", label: "Reliable", icon: "🤝", color: "bg-blue-100 text-blue-700" },
  { id: "Great Mentor", label: "Great Mentor", icon: "🧠", color: "bg-purple-100 text-purple-700" },
  { id: "Fast Responder", label: "Fast Responder", icon: "⚡", color: "bg-yellow-100 text-yellow-700" },
  { id: "Quality Work", label: "Quality Work", icon: "💎", color: "bg-green-100 text-green-700" },
] as const;

export const CREDIT_RULES = {
  "teach-session": 1,
  "complete-project": 3,
  "request-help": -1,
  "redeem-reward": -1,
} as const;

export const MATCH_WEIGHTS = {
  learn: {
    skillFit: 40,
    availability: 20,
    rating: 20,
    college: 10,
    credits: 10,
  },
  buddy: {
    complementary: 40,
    availability: 20,
    rating: 20,
    college: 10,
    credits: 10,
  },
} as const;

export const STORAGE_KEYS = {
  AUTH_TOKEN: "skillbridge_auth",
  CURRENT_USER: "skillbridge_user",
  USERS: "skillbridge_users",
  NEEDS: "skillbridge_needs",
  MATCHES: "skillbridge_matches",
  COLLABORATIONS: "skillbridge_collaborations",
  PROJECT_CARDS: "skillbridge_project_cards",
  CREDIT_TRANSACTIONS: "skillbridge_credits",
  FEEDBACK: "skillbridge_feedback",
  REWARDS: "skillbridge_rewards",
  DEMO_STATE: "skillbridge_demo",
} as const;