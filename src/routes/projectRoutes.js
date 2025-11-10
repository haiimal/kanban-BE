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

// Semua endpoint wajib login Clerk
router.use(requireAuth());

/**
 * GET    /api/projects         → Lihat semua project milik user login
 * GET    /api/projects/:id     → Lihat detail project tertentu
 * POST   /api/projects         → Tambah project baru (otomatis jadi admin)
 * PUT    /api/projects/:id     → Update project (admin only)
 * DELETE /api/projects/:id     → Hapus project (admin only)
 */
router.get("/", getAllProjects);
router.get("/:id", getProjectById);
router.post("/", createProject);
router.put("/:id", updateProject);
router.delete("/:id", deleteProject);

export default router;
