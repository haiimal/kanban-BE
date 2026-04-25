import * as notificationsService from "../services/notificationsService.js";

export const getNotifications = async (req, res) => {
  try {
    const data = await notificationsService.getNotifications(req.clerkId);
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
    await notificationsService.markAllAsRead(req.clerkId);
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