import * as reportService from "../services/reportService.js";

export const getProjectReport = async (req, res) => {
  try {
    const data = await reportService.getProjectReport(req.params.project_id, req.clerkId);
    res.json({ success: true, data });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};