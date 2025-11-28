// src/routes/clerkRoutes.js
import express from "express";
import { fetchClerkUsers } from "../controllers/clerkController.js";

const router = express.Router();

router.get("/", fetchClerkUsers);

export default router;
