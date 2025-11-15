// src/routes/columnsRoutes.js
import { Router } from "express";
import {
  getColumnsByBoard,
  createColumn,
  updateColumn,
  deleteColumn,
} from "../controllers/columnsController.js";

const router = Router();

/**
 * GET    /api/columns/:boards_id → Ambil semua kolom di board
 * POST   /api/columns           → Buat kolom baru (admin only)
 * PUT    /api/columns/:id       → Ubah nama kolom (admin only)
 * DELETE /api/columns/:id       → Hapus kolom (admin only)
 */
router.get("/:boards_id", getColumnsByBoard);
router.post("/", createColumn);
router.put("/:id", updateColumn);
router.delete("/:id", deleteColumn);

export default router;
