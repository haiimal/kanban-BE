import { Router } from "express";
import {
  getCardsByColumn,
  createCard,
  updateCard,
  deleteCard,
} from "../controllers/cardsController.js";

const router = Router();

router.get("/:columns_id", getCardsByColumn); // ambil semua cards berdasarkan column
router.post("/", createCard);                 // buat card baru
router.put("/:id", updateCard);               // update card
router.delete("/:id", deleteCard);            // hapus card

export default router;
