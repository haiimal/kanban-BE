// src/routes/projectRoutes.js
import { Router } from "express";
import {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
} from "../controllers/projectController.js";


const router = Router();



/**
 * GET    /api/projects         → Lihat semua project milik user login
 * GET    /api/projects/:id     → Lihat detail project tertentu
 * POST   /api/projects         → Tambah project baru (otomatis jadi PM)
 * PUT    /api/projects/:id     → Update project (PM only)
 * DELETE /api/projects/:id     → Hapus project (PM only)
 */
router.get("/", getAllProjects);
router.get("/:id", getProjectById);
router.post("/", createProject);
router.put("/:id", updateProject);
router.delete("/:id", deleteProject);

export default router;
