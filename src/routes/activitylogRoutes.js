import { Router } from "express";
import { getLogsByCard, getLogsByProject } from "../controllers/activitylogController.js";

const router = Router();

router.get("/card/:card_id", getLogsByCard);
router.get("/project/:project_id", getLogsByProject);

export default router;