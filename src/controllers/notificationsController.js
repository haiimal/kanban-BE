import * as notificationsService from "../services/notificationsService.js";

export const getNotifications = async (req, res) => {
  try {
    // ← FIX: teruskan ?project_id dari FE, sebelumnya diabaikan
    const data = await notificationsService.getNotifications(req.clerkId, req.query.project_id);
    res.json({ success: true, data });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

export const markAsRead = async (req, res) => {
  try {
    await notificationsService.markAsRead(req.params.id, req.clerkId);
    res.json({ success: true, message: "Notifikasi ditandai sudah dibaca" });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

export const markAllAsRead = async (req, res) => {
  try {
    // ← FIX: teruskan ?project_id dari FE, sebelumnya diabaikan
    await notificationsService.markAllAsRead(req.clerkId, req.query.project_id);
    res.json({ success: true, message: "Semua notifikasi ditandai sudah dibaca" });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

export const deleteNotification = async (req, res) => {
  try {
    await notificationsService.deleteNotification(req.params.id, req.clerkId);
    res.json({ success: true, message: "Notifikasi dihapus" });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};