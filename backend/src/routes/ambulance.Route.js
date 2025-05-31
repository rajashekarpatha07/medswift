import { Router } from "express";
import { registerAmbulance, loginAmbulance, logoutAmbulance } from "../controllers/AmbulanceControllers/Ambulance.controller.js";
import {  verifyTokenForAmbulanceMiddleware } from "../middlewares/auth.middleware.js";
const router = Router();

router.route("/register").post(registerAmbulance);
router.route("/login").post(loginAmbulance);

// Secure route
router.route("/logout").post(verifyTokenForAmbulanceMiddleware, logoutAmbulance);

export default router;