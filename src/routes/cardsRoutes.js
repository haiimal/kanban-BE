import { Router } from "express";
import {
  getCardsByColumn,
  createCard,
  updateCard,
  deleteCard,
} from "../controllers/cardsController.js";

const router = Router();

router.get("/:columns_id", getCardsByColumn);
router.post("/", createCard);
router.put("/:id", updateCard);
router.delete("/:id", deleteCard);

export default router;
