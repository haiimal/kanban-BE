import { Router } from "express";
import {
  getBoardsByProject,
  createBoard,
  updateBoard,
  deleteBoard,
} from "../controllers/boardsController.js";

const router = Router();

router.get("/:project_id", getBoardsByProject);
router.post("/", createBoard);
router.put("/:id", updateBoard);
router.delete("/:id", deleteBoard);

export default router;
