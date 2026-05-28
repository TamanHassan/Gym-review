import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import gymsRoutes from "./routes/gyms.js";
import profileRoutes from "./routes/profile.js";

dotenv.config();

const app = express();

// Hide Express version for security
app.disable("x-powered-by");

app.use(express.json());

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

// Security headers
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  next();
});

app.use("/gyms", gymsRoutes);
app.use("/profile", profileRoutes);

// Health check endpoint for Docker
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

export default app;