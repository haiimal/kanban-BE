// src/controllers/cardsController.js
import * as cardsService from "../services/cardsService.js";

//  GET semua cards berdasarkan columns_id
export const getCardsByColumn = async (req, res) => {
  const { columns_id } = req.params;

  try {
    // pastikan user login
    if (!req.clerkId) {
      return res.status(401).json({ error: "Unauthorized. Please log in first." });
    }

    const data = await cardsService.getCardsByColumn(columns_id);
    res.status(200).json({
      success: true,
      message: `Berhasil mengambil semua cards untuk column ${columns_id}`,
      data,
    });
  } catch (err) {
    console.error("Error getCardsByColumn:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};

//  POST buat card baru
export const createCard = async (req, res) => {
  const { columns_id, title, description, due_date } = req.body;

  try {
    if (!req.clerkId) {
      return res.status(401).json({ error: "Unauthorized. Please log in first." });
    }

    if (!columns_id || !title) {
      return res.status(400).json({ error: "columns_id dan title wajib diisi." });
    }

    const data = await cardsService.createCard(columns_id, title, description, due_date);
    res.status(201).json({
      success: true,
      message: "Card berhasil dibuat",
      data,
    });
  } catch (err) {
    console.error("Error createCard:", err.message);
    res.status(400).json({ success: false, error: err.message });
  }
};

//  PUT update card
export const updateCard = async (req, res) => {
  const { id } = req.params;
  const { title, description, due_date, columns_id } = req.body;

  try {
    if (!req.clerkId) {
      return res.status(401).json({ error: "Unauthorized. Please log in first." });
    }

    const fieldsToUpdate = {
      ...(title && { title }),
      ...(description && { description }),
      ...(due_date && { due_date }),
      ...(columns_id && { columns_id }), // kalau mau pindah column
    };

    const data = await cardsService.updateCard(id, fieldsToUpdate);
    res.status(200).json({
      success: true,
      message: `Card ${id} berhasil diperbarui`,
      data,
    });
  } catch (err) {
    console.error("Error updateCard:", err.message);
    res.status(400).json({ success: false, error: err.message });
  }
};

//  DELETE card
export const deleteCard = async (req, res) => {
  const { id } = req.params;

  try {
    if (!req.clerkId) {
      return res.status(401).json({ error: "Unauthorized. Please log in first." });
    }

    await cardsService.deleteCard(id);
    res.status(200).json({
      success: true,
      message: `Card ${id} berhasil dihapus`,
    });
  } catch (err) {
    console.error("Error deleteCard:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};
