import { Router } from "express";
import * as notificationsController from "../controllers/notificationsController.js";

const router = Router();

router.get("/", notificationsController.getNotifications);
router.put("/read-all", notificationsController.markAllAsRead);
router.put("/:id/read", notificationsController.markAsRead);
router.delete("/:id", notificationsController.deleteNotification);

export default router;