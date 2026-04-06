// src/routes/cardsRoutes.js
import { Router } from "express";
import * as cardsController from "../controllers/cardsController.js";

const router = Router();

// CARDS
router.get("/:columns_id", cardsController.getCardsByColumn);
router.post("/", cardsController.createCard);
router.put("/:id", cardsController.updateCard);
router.delete("/:id", cardsController.deleteCard);

// ATTACHMENTS
router.get("/attachments/:card_id", cardsController.getAttachments);
router.post("/attachments", cardsController.uploadAttachment);
router.delete("/attachments/:id", cardsController.deleteAttachment);

// ASSIGN / UNASSIGN
router.post("/assign", cardsController.assignUser);
router.post("/unassign", cardsController.unassignUser);

// CARD MEMBERS
router.get("/members/:card_id", cardsController.getCardMembers);

// PROJECT PROGRESS
router.get("/progress/:project_id", cardsController.getProjectProgress);

export default router;