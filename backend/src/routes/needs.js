import { Router } from "express";
import { getDB, generateId, nowISO } from "../db.js";

const router = Router();

// GET /api/needs
router.get("/", (req, res) => {
  const db = getDB();
  res.json(db.needs);
});

// GET /api/needs/:id
router.get("/:id", (req, res) => {
  const db = getDB();
  const need = db.needs.find((n) => n.id === req.params.id);
  if (!need) return res.status(404).json({ error: "Need not found" });
  res.json(need);
});

// POST /api/needs
router.post("/", (req, res) => {
  const db = getDB();
  const need = {
    id: generateId("need"),
    ...req.body,
    status: "open",
    createdAt: nowISO(),
  };
  db.needs.push(need);
  res.status(201).json(need);
});

// PUT /api/needs/:id
router.put("/:id", (req, res) => {
  const db = getDB();
  const idx = db.needs.findIndex((n) => n.id === req.params.id);
  if (idx < 0) return res.status(404).json({ error: "Need not found" });
  db.needs[idx] = { ...db.needs[idx], ...req.body };
  res.json(db.needs[idx]);
});

export default router;
