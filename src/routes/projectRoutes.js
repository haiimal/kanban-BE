// src/routes/projectRoutes.js
import { Router } from "express";
import {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
} from "../controllers/projectController.js";
import { requireAuth } from "@clerk/express"; // Middleware wajib login Clerk

const router = Router();

// Semua endpoint wajib login
router.use(requireAuth()); // Semua route dibawah butuh token Clerk

router.get("/", getAllProjects);
router.get("/:id", getProjectById);
router.post("/", createProject);
router.put("/:id", updateProject);
router.delete("/:id", deleteProject);

export default router;
