// In-memory data store (replaces localStorage)
// In production: replace with MongoDB/PostgreSQL

let db = {
  users: [],
  needs: [],
  matches: [],
  collaborations: [],
  projectCards: [],
  creditTransactions: [],
  feedback: [],
  rewards: [],
  demoState: { simulatedPartnerConsent: "pending", currentImpersonation: null },
  sessions: {}, // token -> userId
};

export function getDB() {
  return db;
}

export function resetDB() {
  db.users = [];
  db.needs = [];
  db.matches = [];
  db.collaborations = [];
  db.projectCards = [];
  db.creditTransactions = [];
  db.feedback = [];
  db.rewards = [];
  db.sessions = {};
  db.demoState = { simulatedPartnerConsent: "pending", currentImpersonation: null };
}

export function generateId(prefix = "id") {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function nowISO() {
  return new Date().toISOString();
}
