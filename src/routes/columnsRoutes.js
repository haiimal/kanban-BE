import { Router } from "express";
import {
  getColumnsByBoard,
  createColumn,
  updateColumn,
  deleteColumn,
} from "../controllers/columnsController.js";

const router = Router();

// Semua route siap pakai middleware Clerk
router.get("/:boards_id", getColumnsByBoard);
router.post("/", createColumn);
router.put("/:id", updateColumn);
router.delete("/:id", deleteColumn);

export default router;
