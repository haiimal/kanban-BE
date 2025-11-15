// src/routes/projectMemberRoutes.js
import { Router } from "express";
import {
  getAllMembers,
  addMember,
  removeMember,
} from "../controllers/projectMemberController.js";

const router = Router();


/**
 * GET    /api/project-members/:project_id → Ambil semua member dari project
 * POST   /api/project-members            → Tambah member baru (admin only)
 * DELETE /api/project-members/:id        → Hapus member dari project (admin only)
 */
router.get("/:project_id", getAllMembers);
router.post("/", addMember);
router.delete("/:id", removeMember);

export default router;
