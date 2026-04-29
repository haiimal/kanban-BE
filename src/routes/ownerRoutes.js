// src/routes/ownerRoutes.js
import { Router } from "express";
import { requireOwner } from "../middleware/platformRoleMiddleware.js";
import * as ownerController from "../controllers/ownerController.js";

const router = Router();

// Semua route owner wajib lolos requireOwner middleware
router.use(requireOwner);

// GET /api/owner/summary
// Mengembalikan total project + breakdown per tahun (untuk chart)
router.get("/summary", ownerController.getYearlySummary);

// GET /api/owner/projects?year=2026
// List semua project di tahun tertentu
router.get("/projects", ownerController.getProjectsByYear);

// GET /api/owner/report/:project_id
// Laporan detail satu project (akses tanpa harus jadi member)
router.get("/report/:project_id", ownerController.getProjectReport);

export default router;