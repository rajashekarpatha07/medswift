import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import userRoutes from "./src/routes/user.route.js";
import  ambulanceRoutes  from "./src/routes/ambulance.Route.js"

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors({
    origin: ["http://localhost:3000", "http://localhost:5173","http://127.0.1:3000"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}));

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static(path.join(__dirname, "../frontend/public")));
app.use(cookieParser());

app.use("/api/v1/users", userRoutes)
app.use("/api/v1/ambulance", ambulanceRoutes);

export default app 
