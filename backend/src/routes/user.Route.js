import { Router } from "express";
import { registerUser, loginUser, logoutUser, findNearbyAmbulances} from "../controllers/UserControllers/user.controller.js"
import { verifyTokenMiddleware } from "../middlewares/auth.middleware.js";
const router = Router();

router.route("/register").post( registerUser );
router.route("/login").post( loginUser );

//secure routes
router.route("/logout").post(verifyTokenMiddleware, logoutUser);
router.route("/emergencyRequest").post( verifyTokenMiddleware,findNearbyAmbulances );
router.route("/me").get(verifyTokenMiddleware, (req, res) => {
  res.json({ user: req.user });
});

export default router;
