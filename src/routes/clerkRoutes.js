// src/routes/clerkRoutes.js
import { Router } from "express";
import { listClerkUsers } from "../controllers/clerkController.js";

const router = Router();

// GET semua user Clerk
router.get("/", listClerkUsers);

export default router;
