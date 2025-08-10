import { Router } from "express";
import { 
    registerHospital, 
    loginHospital, 
    logoutHospital, 
    updateInventory 
} from "../controllers/hospital.controller/hospital.controller.js";
import { hospitalRefreshTokenMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

// Public routes
router.route("/register").post(registerHospital);
router.route("/login").post(loginHospital);

// Protected routes (require authentication)
router.route("/logout").post(hospitalRefreshTokenMiddleware, logoutHospital);

router.route("/inventory").patch(hospitalRefreshTokenMiddleware, updateInventory);

// Corrected /me route
router.route("/me").get(hospitalRefreshTokenMiddleware, (req, res) => {
    // Only send the req.hospital object, not the entire req object
    return res.status(200).json({
        success: true,
        hospital: req.hospital 
    });
});

export default router;
