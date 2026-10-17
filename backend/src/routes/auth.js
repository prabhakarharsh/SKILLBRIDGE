import { Router } from "express";
import { getDB, generateId, nowISO } from "../db.js";

const router = Router();

// POST /api/auth/signup
router.post("/signup", (req, res) => {
  const { email, password } = req.body;
  const db = getDB();

  if (!email || !password) {
    return res.status(400).json({ user: null, error: "Email and password required." });
  }

  if (!email.endsWith("@skillbridge.edu")) {
    return res.status(400).json({ user: null, error: "Must use a @skillbridge.edu email." });
  }

  const existing = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(400).json({ user: null, error: "Account already exists. Please login." });
  }

  const user = {
    id: generateId("user"),
    email: email.toLowerCase(),
    name: "",
    branch: "",
    year: 1,
    skills: [],
    availability: "now",
    bio: "",
    rating: 0,
    credits: 10,
    trustBadges: [],
    isVerified: false,
    createdAt: nowISO(),
  };

  db.users.push(user);
  res.json({ user });
});

// POST /api/auth/login
router.post("/login", (req, res) => {
  const { email, password } = req.body;
  const db = getDB();

  if (!email || !password) {
    return res.status(400).json({ user: null, error: "Email and password required." });
  }

  const user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    return res.status(404).json({ user: null, error: "No account found. Please sign up first." });
  }

  if (!user.isVerified) {
    return res.status(403).json({ user: null, error: "Please verify your email first (OTP: 123456)." });
  }

  const token = generateId("token");
  db.sessions[token] = user.id;
  res.json({ user, token });
});

// POST /api/auth/verify-otp
router.post("/verify-otp", (req, res) => {
  const { email, code } = req.body;
  const db = getDB();

  if (code !== "123456") {
    return res.status(400).json({ user: null, error: "Invalid OTP. Use 123456 for demo." });
  }

  const user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    return res.status(404).json({ user: null, error: "User not found." });
  }

  user.isVerified = true;
  const token = generateId("token");
  db.sessions[token] = user.id;
  res.json({ user, token });
});

// POST /api/auth/logout
router.post("/logout", (req, res) => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  const db = getDB();
  if (token) delete db.sessions[token];
  res.json({ success: true });
});

// GET /api/auth/me
router.get("/me", (req, res) => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  const db = getDB();
  const userId = db.sessions[token];
  if (!userId) return res.status(401).json({ user: null });
  const user = db.users.find((u) => u.id === userId);
  res.json({ user: user || null });
});

// PUT /api/auth/profile/:userId
router.put("/profile/:userId", (req, res) => {
  const db = getDB();
  const idx = db.users.findIndex((u) => u.id === req.params.userId);
  if (idx < 0) return res.status(404).json({ user: null, error: "User not found" });
  db.users[idx] = { ...db.users[idx], ...req.body };
  res.json({ user: db.users[idx] });
});

export default router;
