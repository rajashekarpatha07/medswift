import { Router } from "express";
import {
  registerUser,
  loginUser,
  logoutUser
} from "../controllers/user.controllers/user.controller.js";
import { UserverifyMiddleware, refreshTokenmiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);

//secure routes
router.route("/auth/logout").post(UserverifyMiddleware, logoutUser )
router.route("/me").get(refreshTokenmiddleware, (req, res)=>{
  res.json({
    user: req.user
  })
})

export default router;
