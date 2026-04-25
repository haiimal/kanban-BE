import { Router } from "express";
import * as commentsController from "../controllers/commentsController.js";

const router = Router();

router.get("/:card_id", commentsController.getCommentsByCard);
router.post("/", commentsController.createComment);
router.put("/:id", commentsController.updateComment);
router.delete("/:id", commentsController.deleteComment);

export default router;