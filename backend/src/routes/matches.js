import { Router } from "express";
import { getDB, generateId, nowISO } from "../db.js";

const router = Router();

// GET /api/matches
router.get("/", (req, res) => {
  const db = getDB();
  res.json(db.matches);
});

// GET /api/matches/:id
router.get("/:id", (req, res) => {
  const db = getDB();
  const match = db.matches.find((m) => m.id === req.params.id);
  if (!match) return res.status(404).json({ error: "Match not found" });
  res.json(match);
});

// POST /api/matches
router.post("/", (req, res) => {
  const db = getDB();
  const match = {
    id: generateId("match"),
    ...req.body,
    status: "suggested",
    createdAt: nowISO(),
  };
  db.matches.push(match);
  res.status(201).json(match);
});

// PUT /api/matches/:id
router.put("/:id", (req, res) => {
  const db = getDB();
  const idx = db.matches.findIndex((m) => m.id === req.params.id);
  if (idx < 0) return res.status(404).json({ error: "Match not found" });
  db.matches[idx] = { ...db.matches[idx], ...req.body };
  res.json(db.matches[idx]);
});

// POST /api/matches/find/:needId - Find matches for a need
router.post("/find/:needId", (req, res) => {
  const db = getDB();
  const need = db.needs.find((n) => n.id === req.params.needId);
  if (!need) return res.status(404).json({ error: "Need not found" });

  const seeker = db.users.find((u) => u.id === need.authorId);
  if (!seeker) return res.status(404).json({ error: "Seeker not found" });

  // Simple matching algorithm
  const candidates = db.users.filter((u) => u.id !== seeker.id && u.isVerified && u.availability !== "busy");
  const matches = candidates.map((provider) => {
    const matchedSkills = need.requiredSkills.filter((s) => provider.skills.includes(s));
    const skillScore = need.requiredSkills.length > 0 ? (matchedSkills.length / need.requiredSkills.length) * 40 : 0;
    const availScore = provider.availability === "now" ? 20 : provider.availability === "this-week" ? 15 : 10;
    const ratingScore = (provider.rating / 5) * 20;
    const score = Math.round(skillScore + availScore + ratingScore + 10);

    const reasons = [];
    if (matchedSkills.length > 0) {
      reasons.push({
        type: "skill-fit",
        label: "Skill Match",
        detail: `Knows ${matchedSkills.join(", ")}`,
        weight: skillScore,
      });
    }
    reasons.push({
      type: "availability",
      label: "Available",
      detail: provider.availability === "now" ? "Available now" : `Available ${provider.availability}`,
      weight: availScore,
    });
    reasons.push({
      type: "rating",
      label: "Highly Rated",
      detail: `${provider.rating}/5 rating`,
      weight: ratingScore,
    });

    return {
      id: generateId("match"),
      needId: need.id,
      seekerId: seeker.id,
      providerId: provider.id,
      score: Math.min(score, 100),
      reasons,
      status: "suggested",
      createdAt: nowISO(),
    };
  });

  // Sort by score descending, take top 10
  matches.sort((a, b) => b.score - a.score);
  const topMatches = matches.slice(0, 10);

  // Save matches
  db.matches.push(...topMatches);
  res.json(topMatches);
});

export default router;
