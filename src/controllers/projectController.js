// src/controllers/projectController.js
import * as projectService from "../services/projectService.js";

export const getAllProjects = async (req, res) => {
  try {
    if (!req.clerkId) return res.status(401).json({ success: false, error: "Unauthorized. Please log in first." });

    const data = await projectService.getAllProjects(req.clerkId);
    res.json({ success: true, message: "Success get all projects for this user", data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const getProjectById = async (req, res) => {
  try {
    const data = await projectService.getProjectById(req.params.id);
    res.json({ success: true, message: "Success get project", data });
  } catch (err) {
    res.status(404).json({ success: false, error: err.message });
  }
};

export const createProject = async (req, res) => {
  const { name, description, deadline } = req.body; // ← tambah deadline
  const clerkId = req.clerkId;

  try {
    const project = await projectService.createProject(name, description, deadline, clerkId); // ← fix
    res.status(201).json({
      success: true,
      message: "Project created successfully and user set as PM",
      data: project,
    });
  } catch (err) {
    res.status(err.statusCode || 500).json({ success: false, error: err.message });
  }
};

export const updateProject = async (req, res) => {
  const clerkId = req.clerkId;
  const { id } = req.params;
  const { name, description, deadline } = req.body; // ← tambah deadline

  try {
    const data = await projectService.updateProject(id, name, description, deadline, clerkId); // ← fix
    res.json({ success: true, message: "Project updated successfully", data });
  } catch (err) {
    res.status(err.statusCode || 500).json({ success: false, error: err.message });
  }
};

export const deleteProject = async (req, res) => {
  const clerkId = req.clerkId;
  const { id } = req.params;

  try {
    await projectService.deleteProject(id, clerkId);
    res.json({ success: true, message: "Project deleted successfully" });
  } catch (err) {
    res.status(err.statusCode || 500).json({ success: false, error: err.message });
  }
};