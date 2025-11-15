// src/routes/cardsRoutes.js
import { Router } from "express";
import {
  getCardsByColumn,
  createCard,
  updateCard,
  deleteCard,
} from "../controllers/cardsController.js";

const router = Router();

/**
 * GET    /api/cards/:columns_id → Ambil semua card dalam kolom
 * POST   /api/cards            → Tambah card (admin only)
 * PUT    /api/cards/:id        → Update card (admin bisa edit, member bisa pindah kolom)
 * DELETE /api/cards/:id        → Hapus card (admin only)
 */
router.get("/:columns_id", getCardsByColumn);
router.post("/", createCard);
router.put("/:id", updateCard);
router.delete("/:id", deleteCard);

export default router;
