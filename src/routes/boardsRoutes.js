import { Router } from "express";
import {
  getBoardsByProject,
  createBoard,
  updateBoard,
  deleteBoard
} from "../controllers/boardsController.js";

const router = Router();

// Ambil semua boards berdasarkan project_id
router.get("/:project_id", getBoardsByProject);

// Tambah board baru
router.post("/", createBoard);

// Edit nama board
router.put("/:id", updateBoard);

// Hapus board berdasarkan id
router.delete("/:id", deleteBoard);

export default router;
