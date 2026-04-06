import * as activityLogService from "../services/activitylogService.js";

export const getLogsByCard = async (req, res) => {
  try {
    const data = await activityLogService.getLogsByCard(req.params.card_id, req.clerkId);
    res.json({ success: true, data });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

export const getLogsByProject = async (req, res) => {
  try {
    const data = await activityLogService.getLogsByProject(req.params.project_id, req.clerkId);
    res.json({ success: true, data });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};