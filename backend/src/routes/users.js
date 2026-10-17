import { Router } from "express";
import { getDB, generateId, nowISO } from "../db.js";

const router = Router();

// GET /api/users
router.get("/", (req, res) => {
  const db = getDB();
  res.json(db.users);
});

// GET /api/users/:id
router.get("/:id", (req, res) => {
  const db = getDB();
  const user = db.users.find((u) => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json(user);
});

// PUT /api/users/:id
router.put("/:id", (req, res) => {
  const db = getDB();
  const idx = db.users.findIndex((u) => u.id === req.params.id);
  if (idx < 0) return res.status(404).json({ error: "User not found" });
  db.users[idx] = { ...db.users[idx], ...req.body };
  res.json(db.users[idx]);
});

export default router;
