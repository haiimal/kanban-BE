// src/controllers/columnsController.js
import * as columnsService from "../services/columnsService.js";

// GET semua column berdasarkan boards_id
export const getColumnsByBoard = async (req, res) => {
  const { boards_id } = req.params;

  try {
    if (!req.clerkId) {
      return res.status(401).json({ success: false, error: "Unauthorized. Harus login dulu." });
    }

    const data = await columnsService.getColumnsByBoard(boards_id, req.clerkId);

    res.status(200).json({
      success: true,
      message: "Berhasil mengambil semua columns",
      boards_id,
      data,
    });
  } catch (err) {
    console.error("Error getColumnsByBoard:", err.message);
    res.status(403).json({ success: false, error: err.message });
  }
};

// POST - tambah column (PM only)
export const createColumn = async (req, res) => {
  const { boards_id, name, type } = req.body; // ← tambah type

  try {
    if (!req.clerkId) {
      return res.status(401).json({ success: false, error: "Unauthorized. Harus login dulu." });
    }

    const data = await columnsService.createColumn(boards_id, name, type, req.clerkId); // ← passing type

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

// PUT - update column (PM only)
export const updateColumn = async (req, res) => {
  const { id } = req.params;
  const { name, type } = req.body; // ← tambah type

  try {
    if (!req.clerkId) {
      return res.status(401).json({ success: false, error: "Unauthorized. Harus login dulu." });
    }

    const data = await columnsService.updateColumn(id, name, type, req.clerkId); // ← passing type

    res.status(200).json({
      success: true,
      message: "Column berhasil diperbarui",
      data,
    });
  } catch (err) {
    console.error("Error updateColumn:", err.message);
    res.status(400).json({ success: false, error: err.message });
  }
};

// DELETE column (PM only)
export const deleteColumn = async (req, res) => {
  const { id } = req.params;

  try {
    if (!req.clerkId) {
      return res.status(401).json({ success: false, error: "Unauthorized. Harus login dulu." });
    }

    await columnsService.deleteColumn(id, req.clerkId);

    res.status(200).json({
      success: true,
      message: "Column berhasil dihapus",
    });
  } catch (err) {
    console.error("Error deleteColumn:", err.message);
    res.status(400).json({ success: false, error: err.message });
  }
};