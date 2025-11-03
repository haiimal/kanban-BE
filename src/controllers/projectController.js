// src/controllers/projectController.js
import * as projectService from "../services/projectService.js";

// GET all projects (user hanya bisa lihat project yang dia ikut)
export const getAllProjects = async (req, res) => {
  try {
    if (!req.clerkId) {
      return res.status(401).json({ success: false, error: "Unauthorized. Please log in first." });
    }

    const data = await projectService.getAllProjects(req.clerkId);
    res.json({ success: true, message: "Success get all projects for this user", data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// GET project by ID
export const getProjectById = async (req, res) => {
  try {
    const data = await projectService.getProjectById(req.params.id);
    res.json({ success: true, message: "Success get project", data });
  } catch (err) {
    res.status(404).json({ success: false, error: err.message });
  }
};

// CREATE project (tanpa auto board default)
export const createProject = async (req, res) => {
  const { name, description } = req.body;
  const clerkId = req.clerkId;

  try {
    const project = await projectService.createProject(name, description, clerkId);
    res.status(201).json({
      success: true,
      message: "Project created successfully and user set as admin",
      data: project,
    });
  } catch (err) {
    res.status(err.statusCode || 500).json({ success: false, error: err.message });
  }
};

// UPDATE project
export const updateProject = async (req, res) => {
  try {
    const data = await projectService.updateProject(
      req.params.id,
      req.body.name,
      req.body.description
    );
    res.json({ success: true, message: "Project updated successfully", data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// DELETE project
export const deleteProject = async (req, res) => {
  try {
    await projectService.deleteProject(req.params.id);
    res.json({ success: true, message: "Project deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
