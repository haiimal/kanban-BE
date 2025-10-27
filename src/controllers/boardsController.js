// src/controllers/boardsController.js
import * as boardsService from "../services/boardsService.js";

// Ambil semua board berdasarkan project_id
export const getBoardsByProject = async (req, res) => {
  console.log("GET /api/boards/:project_id hit");
  const { project_id } = req.params;

  try {
    const data = await boardsService.getBoardsByProject(project_id);
    res.json({
      message: `Success get all boards for project ${project_id}`,
      data,
    });
  } catch (err) {
    console.error("Supabase Error:", err.message);
    res.status(500).json({ error: "Gagal mengambil data boards" });
  }
};

// Tambah board baru di project tertentu
export const createBoard = async (req, res) => {
  console.log("POST /api/boards hit");
  const { project_id, name } = req.body;

  try {
    const data = await boardsService.createBoard(project_id, name);
    res.status(201).json({
      message: "Board created successfully",
      data,
    });
  } catch (err) {
    console.error("Supabase Error:", err.message);
    res.status(400).json({ error: err.message });
  }
};

// Edit nama board
export const updateBoard = async (req, res) => {
  console.log("PUT /api/boards/:id hit");
  const { id } = req.params;
  const { name } = req.body;

  try {
    const data = await boardsService.updateBoard(id, name);
    res.json({
      message: `Board ${id} updated successfully`,
      data,
    });
  } catch (err) {
    console.error("Supabase Error:", err.message);
    res.status(400).json({ error: err.message });
  }
};

// Hapus board berdasarkan id
export const deleteBoard = async (req, res) => {
  console.log("DELETE /api/boards/:id hit");
  const { id } = req.params;

  try {
    await boardsService.deleteBoard(id);
    res.json({ message: `Board ${id} deleted successfully` });
  } catch (err) {
    console.error("Supabase Error:", err.message);
    res.status(500).json({ error: "Gagal menghapus board" });
  }
};
