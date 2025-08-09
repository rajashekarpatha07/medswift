import { Router } from "express";
import { registerHospital, loginHospital, logoutHospital, updateInventory } from "../controllers/hospital.controller/hospital.controller.js";
// TODO:Hospital Middleware
// import { HospitalVerifyMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(registerHospital);
router.route("/login").post(loginHospital);

// This route should be protected
router.route("/logout").post(/* HospitalVerifyMiddleware, */ logoutHospital);
router.route("/inventory/:hospitalId").patch(/* HospitalVerifyMiddleware, */ updateInventory);


export default router;