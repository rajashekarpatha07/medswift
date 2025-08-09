import { Router } from "express";

import { getAllAmbulances, getAllTrips } from "../controllers/admin.controller/admin.controller.js";
// import { AdminverifyMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

// router.use(AdminverifyMiddleware);

// Route to get all ambulances
router.route("/ambulances").get(getAllAmbulances);

// Route to get all trips
router.route("/trips").get(getAllTrips);

export default router;
