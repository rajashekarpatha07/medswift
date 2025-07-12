import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import userRoutes from "./src/routes/user.route.js";
import ambulanceRoutes from "./src/routes/ambulance.route.js";
import expressStatusMonitor from 'express-status-monitor';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware setup
app.use(
  cors({
    origin: ["http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  })
);
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static(path.join(__dirname, "../frontend/public")));
app.use(cookieParser());
app.use(expressStatusMonitor());

// Routes
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/ambulance", ambulanceRoutes);

export default app;