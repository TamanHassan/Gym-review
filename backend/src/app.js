import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import gymsRoutes from "./routes/gyms.js";
import profileRoutes from "./routes/profile.js";

dotenv.config();

const app = express();

app.use(express.json());

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true
  })
);

app.use("/gyms", gymsRoutes);
app.use("/profile", profileRoutes);

export default app;