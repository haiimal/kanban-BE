import { Router } from "express";
import {
  getColumnsByBoard,
  createColumn,
  updateColumn,
  deleteColumn,
} from "../controllers/columnsController.js";

const router = Router();

router.get("/:boards_id", getColumnsByBoard); // ambil semua columns di board
router.post("/", createColumn);               // buat column baru
router.put("/:id", updateColumn);             // update nama column
router.delete("/:id", deleteColumn);          // hapus column

export default router;
