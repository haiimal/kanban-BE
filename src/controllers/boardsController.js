// src/controllers/boardsController.js
import * as boardsService from "../services/boardsService.js";

// GET semua board berdasarkan project_id
export const getBoardsByProject = async (req, res) => {
  const { project_id } = req.params;

  try {
    if (!req.clerkId) {
      return res.status(401).json({ error: "Unauthorized. Please log in first." });
    }

    const data = await boardsService.getBoardsByProject(project_id);
    res.status(200).json({
      success: true,
      message: `Berhasil mengambil semua board untuk project ${project_id}`,
      data,
    });
  } catch (err) {
    console.error("Error getBoardsByProject:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};

// POST tambah board baru
export const createBoard = async (req, res) => {
  const { project_id, name } = req.body;

  try {
    if (!req.clerkId) {
      return res.status(401).json({ error: "Unauthorized. Please log in first." });
    }

    const data = await boardsService.createBoard(project_id, name);
    res.status(201).json({
      success: true,
      message: "Board berhasil dibuat",
      data,
    });
  } catch (err) {
    console.error("Error createBoard:", err.message);
    res.status(400).json({ success: false, error: err.message });
  }
};

// PUT update nama board
export const updateBoard = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  try {
    if (!req.clerkId) {
      return res.status(401).json({ error: "Unauthorized. Please log in first." });
    }

    const data = await boardsService.updateBoard(id, name);
    res.status(200).json({
      success: true,
      message: `Board ${id} berhasil diperbarui`,
      data,
    });
  } catch (err) {
    console.error("Error updateBoard:", err.message);
    res.status(400).json({ success: false, error: err.message });
  }
};

// DELETE board
export const deleteBoard = async (req, res) => {
  const { id } = req.params;

  try {
    if (!req.clerkId) {
      return res.status(401).json({ error: "Unauthorized. Please log in first." });
    }

    await boardsService.deleteBoard(id);
    res.status(200).json({
      success: true,
      message: `Board ${id} berhasil dihapus`,
    });
  } catch (err) {
    console.error("Error deleteBoard:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};
