// src/controllers/cardsController.js
import * as cardsService from "../services/cardsService.js";

// GET semua cards dalam column
export const getCardsByColumn = async (req, res) => {
  const { columns_id } = req.params;

  try {
    if (!req.clerkId) {
      return res.status(401).json({ error: "Unauthorized. Harus login dulu." });
    }

    const data = await cardsService.getCardsByColumn(columns_id, req.clerkId);
    res.status(200).json({
      success: true,
      message: `Berhasil mengambil semua cards untuk column ${columns_id}`,
      data,
    });
  } catch (err) {
    console.error("Error getCardsByColumn:", err.message);
    res.status(403).json({ success: false, error: err.message });
  }
};

// POST buat card baru (admin only)
export const createCard = async (req, res) => {
  const { columns_id, title, description, due_date } = req.body;

  try {
    if (!req.clerkId) {
      return res.status(401).json({ error: "Unauthorized. Harus login dulu." });
    }

    const data = await cardsService.createCard(columns_id, title, description, due_date, req.clerkId);
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

// PUT update card
export const updateCard = async (req, res) => {
  const { id } = req.params;
  const { title, description, due_date, columns_id } = req.body;

  try {
    if (!req.clerkId) {
      return res.status(401).json({ error: "Unauthorized. Harus login dulu." });
    }

    const data = await cardsService.updateCard(id, { title, description, due_date, columns_id }, req.clerkId);
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

// DELETE card (admin only)
export const deleteCard = async (req, res) => {
  const { id } = req.params;

  try {
    if (!req.clerkId) {
      return res.status(401).json({ error: "Unauthorized. Harus login dulu." });
    }

    await cardsService.deleteCard(id, req.clerkId);
    res.status(200).json({
      success: true,
      message: `Card ${id} berhasil dihapus`,
    });
  } catch (err) {
    console.error("Error deleteCard:", err.message);
    res.status(400).json({ success: false, error: err.message });
  }
};
