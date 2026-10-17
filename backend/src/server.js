import express from "express";
import cors from "cors";
import { seedData } from "./seed.js";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import needRoutes from "./routes/needs.js";
import matchRoutes from "./routes/matches.js";
import dataRoutes from "./routes/data.js";

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({ origin: ["http://localhost:5173", "http://localhost:3000"], credentials: true }));
app.use(express.json());

// Seed mock data on startup
seedData();

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/needs", needRoutes);
app.use("/api/matches", matchRoutes);
app.use("/api/data", dataRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 SkillBridge API running on http://localhost:${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/api/health`);
});
