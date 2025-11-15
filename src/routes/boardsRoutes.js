// src/routes/boardsRoutes.js
import { Router } from "express";
import {
  getBoardsByProject,
  createBoard,
  updateBoard,
  deleteBoard,
} from "../controllers/boardsController.js";

const router = Router();

/**
 * GET    /api/boards/:project_id → Ambil semua board dari project
 * POST   /api/boards            → Buat board baru (admin only)
 * PUT    /api/boards/:id        → Update nama board (admin only)
 * DELETE /api/boards/:id        → Hapus board (admin only)
 */
router.get("/:project_id", getBoardsByProject);
router.post("/", createBoard);
router.put("/:id", updateBoard);
router.delete("/:id", deleteBoard);

export default router;
