// src/routes/projectRoutes.js
import { Router } from "express";
import {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
} from "../controllers/projectController.js";
import { requirePlatformPM } from "../middleware/platformRoleMiddleware.js";

const router = Router();

/**
 * GET    /api/projects         → Lihat semua project milik user login
 * GET    /api/projects/:id     → Lihat detail project tertentu
 * POST   /api/projects         → Buat project baru (PM platform-level only)
 * PUT    /api/projects/:id     → Update project (PM project-level only)
 * DELETE /api/projects/:id     → Hapus project (PM project-level only)
 */
router.get("/", getAllProjects);
router.get("/:id", getProjectById);
router.post("/", requirePlatformPM, createProject);
router.put("/:id", updateProject);
router.delete("/:id", deleteProject);

export default router;