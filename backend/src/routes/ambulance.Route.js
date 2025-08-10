import { Router } from "express";
import { registerAmbulance, loginAmbulance, logoutAmbulance, updateStatus } from "../controllers/ambulance.controllers/ambulance.controller.js";
import {AmbulanceverifyMiddleware, AmbulancerefreshTokenmiddleware} from "../middlewares/auth.middleware.js"
const router = Router();

router.route("/register").post(registerAmbulance);
router.route("/login").post(loginAmbulance)


router.route("/status").patch(AmbulanceverifyMiddleware,  updateStatus);
router.route("/auth/logout").post(AmbulanceverifyMiddleware, logoutAmbulance)
router.route("/me").get(AmbulancerefreshTokenmiddleware, (req, res)=>{
  res.json({
    ambulance: req.ambulance
  })
})
export default router