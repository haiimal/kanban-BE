// src/routes/projectMemberRoutes.js
import { Router } from "express";
import {
  getAllMembers,
  addMember,
  removeMember,
} from "../controllers/projectMemberController.js";
import { requireAuth } from "@clerk/express";

const router = Router();

// Semua route wajib login
router.use(requireAuth());

/**
 * GET    /api/project-members/:project_id → Ambil semua member dari project
 * POST   /api/project-members            → Tambah member baru (admin only)
 * DELETE /api/project-members/:id        → Hapus member dari project (admin only)
 */
router.get("/:project_id", getAllMembers);
router.post("/", addMember);
router.delete("/:id", removeMember);

export default router;
