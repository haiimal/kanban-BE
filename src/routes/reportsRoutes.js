import { Router } from "express";
import * as reportController from "../controllers/reportController.js";

const router = Router();

router.get("/project/:project_id", reportController.getProjectReport);

export default router;