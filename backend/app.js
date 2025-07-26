import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import userRoutes from "./src/routes/user.route.js";
import AmbualnceRoutes from "./src/routes/ambulance.route.js";

const app = express();

// Fixed CORS configuration
app.use(
  cors({
    origin: "http://localhost:5173", // Specific origin instead of wildcard
    methods: ["POST", "GET", "PATCH", "PUT", "DELETE"], // Fixed UPDATE to PUT
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"], // Optional: specify allowed headers
  })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());

app.use("/api/v1/user", userRoutes);
app.use("/api/v1/ambulance", AmbualnceRoutes);

export default app;