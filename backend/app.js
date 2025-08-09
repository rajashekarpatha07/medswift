import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import userRoutes from "./src/routes/user.route.js";
import AmbualnceRoutes from "./src/routes/ambulance.route.js";
import adminroutes from "./src/routes/admin.route.js"
import hospitalroutes from "./src/routes/hospital.route.js"

const app = express();

// Fixed CORS configuration
app.use(
  cors({
    origin: "http://localhost:5173", 
    methods: ["POST", "GET", "PATCH", "PUT", "DELETE"], 
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());

app.use("/api/v1/user", userRoutes);
app.use("/api/v1/ambulance", AmbualnceRoutes);
app.use("/api/v1/admin", adminroutes)
app.use("/api/v1/hospital", hospitalroutes)

export default app;