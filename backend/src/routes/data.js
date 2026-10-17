import { Router } from "express";
import { getDB, generateId, nowISO } from "../db.js";

const router = Router();

// GET /api/collaborations
router.get("/", (req, res) => {
  const db = getDB();
  res.json(db.collaborations);
});

// GET /api/collaborations/:id
router.get("/:id", (req, res) => {
  const db = getDB();
  const collab = db.collaborations.find((c) => c.id === req.params.id);
  if (!collab) return res.status(404).json({ error: "Collaboration not found" });
  res.json(collab);
});

// GET /api/collaborations/match/:matchId
router.get("/match/:matchId", (req, res) => {
  const db = getDB();
  const collab = db.collaborations.find((c) => c.matchId === req.params.matchId);
  if (!collab) return res.status(404).json({ error: "Collaboration not found" });
  res.json(collab);
});

// POST /api/collaborations
router.post("/", (req, res) => {
  const db = getDB();
  const collab = {
    id: generateId("collab"),
    ...req.body,
    status: "pending-consent",
    createdAt: nowISO(),
  };
  db.collaborations.push(collab);
  res.status(201).json(collab);
});

// PUT /api/collaborations/:id
router.put("/:id", (req, res) => {
  const db = getDB();
  const idx = db.collaborations.findIndex((c) => c.id === req.params.id);
  if (idx < 0) return res.status(404).json({ error: "Collaboration not found" });
  db.collaborations[idx] = { ...db.collaborations[idx], ...req.body };
  res.json(db.collaborations[idx]);
});

// --- Credits ---
// GET /api/credits
router.get("/credits/all", (req, res) => {
  const db = getDB();
  res.json(db.creditTransactions);
});

// POST /api/credits
router.post("/credits", (req, res) => {
  const db = getDB();
  const txn = {
    id: generateId("txn"),
    ...req.body,
    createdAt: nowISO(),
  };
  db.creditTransactions.unshift(txn);
  // Update user credits
  const user = db.users.find((u) => u.id === txn.userId);
  if (user) {
    user.credits += txn.type === "earned" ? txn.amount : -txn.amount;
  }
  res.status(201).json(txn);
});

// --- Feedback ---
// GET /api/feedback
router.get("/feedback/all", (req, res) => {
  const db = getDB();
  res.json(db.feedback);
});

// POST /api/feedback
router.post("/feedback", (req, res) => {
  const db = getDB();
  const fb = {
    id: generateId("fb"),
    ...req.body,
    createdAt: nowISO(),
  };
  db.feedback.unshift(fb);

  // Update target user's rating
  const toUser = db.users.find((u) => u.id === fb.toUserId);
  if (toUser) {
    const r = fb.ratings;
    const avg = (r.communication + r.reliability + r.skill + r.responsiveness) / 4;
    const allFb = db.feedback.filter((f) => f.toUserId === toUser.id);
    const totalRating = allFb.reduce((sum, f) => {
      const fr = f.ratings;
      return sum + (fr.communication + fr.reliability + fr.skill + fr.responsiveness) / 4;
    }, 0);
    toUser.rating = Math.round((totalRating / allFb.length) * 10) / 10;
  }

  res.status(201).json(fb);
});

// --- Project Cards ---
// GET /api/project-cards
router.get("/project-cards/all", (req, res) => {
  const db = getDB();
  res.json(db.projectCards);
});

// GET /api/project-cards/:id
router.get("/project-cards/:id", (req, res) => {
  const db = getDB();
  const card = db.projectCards.find((p) => p.id === req.params.id);
  if (!card) return res.status(404).json({ error: "Project card not found" });
  res.json(card);
});

// POST /api/project-cards
router.post("/project-cards", (req, res) => {
  const db = getDB();
  const card = {
    id: generateId("proj"),
    ...req.body,
    shareToken: generateId("share"),
    createdAt: nowISO(),
  };
  db.projectCards.push(card);
  res.status(201).json(card);
});

// --- Rewards ---
// GET /api/rewards
router.get("/rewards/all", (req, res) => {
  const db = getDB();
  res.json(db.rewards);
});

// --- Demo State ---
// GET /api/demo-state
router.get("/demo-state/current", (req, res) => {
  const db = getDB();
  res.json(db.demoState);
});

// PUT /api/demo-state
router.put("/demo-state/current", (req, res) => {
  const db = getDB();
  db.demoState = { ...db.demoState, ...req.body };
  res.json(db.demoState);
});

export default router;
