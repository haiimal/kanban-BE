// src/controllers/projectController.js
import * as projectService from "../services/projectService.js";

// GET all projects
export const getAllProjects = async (req, res) => {
  try {
    const data = await projectService.getAllProjects();
    res.json({ success: true, message: "Success get all projects", data });
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

// CREATE project
export const createProject = async (req, res) => {
  const { name, description } = req.body;
  const clerkId = req.clerkId; // Ambil dari middleware

  try {
    const project = await projectService.createProject(name, description, clerkId);
    res.status(201).json({
      success: true,
      message: "Project created successfully with default board and admin member",
      data: project,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
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
