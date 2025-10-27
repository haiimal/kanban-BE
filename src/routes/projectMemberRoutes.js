// src/routes/projectMemberRoutes.js
import { Router } from "express";
import {
  getAllMembers,
  addMember,
  removeMember,
} from "../controllers/projectMemberController.js";

const router = Router();

router.get("/:project_id", getAllMembers);
router.post("/", addMember);
router.delete("/:id", removeMember);

export default router;
