import { Router } from "express";
import { registerAmbulance, loginAmbulance, logoutAmbulance, updateAmbulanceStatus, getAmbulanceData, refreshAccessToken } from "../controllers/AmbulanceControllers/Ambulance.controller.js";
import {  verifyTokenForAmbulanceMiddleware } from "../middlewares/auth.middleware.js";
const router = Router();

router.route("/register").post(registerAmbulance);
router.route("/login").post(loginAmbulance);

// Secure route
router.route("/logout").post(verifyTokenForAmbulanceMiddleware, logoutAmbulance);
router.route("/status").patch( verifyTokenForAmbulanceMiddleware, updateAmbulanceStatus);
router.route("/me").get( verifyTokenForAmbulanceMiddleware, getAmbulanceData)
router.route("/refresh-token").post(refreshAccessToken)


export default router;