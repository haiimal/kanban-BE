// src/controllers/ownerController.js
import * as ownerService from "../services/ownerService.js";

// GET /api/owner/summary
export const getYearlySummary = async (req, res) => {
  try {
    const data = await ownerService.getYearlySummary();
    res.json({ success: true, data });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// GET /api/owner/projects?year=2026
export const getProjectsByYear = async (req, res) => {
  try {
    const { year } = req.query;
    if (!year || isNaN(year)) {
      return res.status(400).json({ success: false, error: "Query 'year' wajib diisi dan harus angka." });
    }
    const data = await ownerService.getProjectsByYear(Number(year));
    res.json({ success: true, data });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// GET /api/owner/report/:project_id
export const getProjectReport = async (req, res) => {
  try {
    const { project_id } = req.params;
    if (!project_id) {
      return res.status(400).json({ success: false, error: "project_id wajib diisi." });
    }
    const data = await ownerService.getOwnerProjectReport(project_id);
    res.json({ success: true, data });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};