import { Router } from "express";
import * as reportController from "../controllers/reportController.js";
import { allowRoles } from "../middleware/authorization.js";

const router = Router();

// Hanya PM project yang bisa akses laporan
router.get("/project/:project_id", allowRoles(["PM"]), reportController.getProjectReport);

export default router;