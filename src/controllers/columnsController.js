// src/controllers/columnsController.js
import * as columnsService from "../services/columnsService.js";

// 🔹 GET semua column berdasarkan boards_id
export const getColumnsByBoard = async (req, res) => {
  const { boards_id } = req.params;

  try {
    if (!req.clerkId) {
      return res.status(401).json({ error: "Unauthorized. Please log in first." });
    }

    const data = await columnsService.getColumnsByBoard(boards_id);
    res.status(200).json({
      success: true,
      message: `Berhasil mengambil semua columns untuk board ${boards_id}`,
      data,
    });
  } catch (err) {
    console.error("Error getColumnsByBoard:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};

// 🔹 POST tambah column baru
export const createColumn = async (req, res) => {
  const { boards_id, name } = req.body;

  try {
    if (!req.clerkId) {
      return res.status(401).json({ error: "Unauthorized. Please log in first." });
    }

    if (!boards_id || !name) {
      return res.status(400).json({ error: "boards_id dan name wajib diisi." });
    }

    const data = await columnsService.createColumn(boards_id, name);
    res.status(201).json({
      success: true,
      message: "Column berhasil dibuat",
      data,
    });
  } catch (err) {
    console.error("Error createColumn:", err.message);
    res.status(400).json({ success: false, error: err.message });
  }
};

// 🔹 PUT update column
export const updateColumn = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  try {
    if (!req.clerkId) {
      return res.status(401).json({ error: "Unauthorized. Please log in first." });
    }

    const data = await columnsService.updateColumn(id, name);
    res.status(200).json({
      success: true,
      message: `Column ${id} berhasil diperbarui`,
      data,
    });
  } catch (err) {
    console.error("Error updateColumn:", err.message);
    res.status(400).json({ success: false, error: err.message });
  }
};

// 🔹 DELETE column
export const deleteColumn = async (req, res) => {
  const { id } = req.params;

  try {
    if (!req.clerkId) {
      return res.status(401).json({ error: "Unauthorized. Please log in first." });
    }

    await columnsService.deleteColumn(id);
    res.status(200).json({
      success: true,
      message: `Column ${id} berhasil dihapus`,
    });
  } catch (err) {
    console.error("Error deleteColumn:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};
