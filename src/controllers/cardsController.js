// src/controllers/cardsController.js
import * as cardsService from "../services/cardsService.js";

// CARDS
export const getCardsByColumn = async (req, res) => {
  try {
    const data = await cardsService.getCardsByColumn(req.params.columns_id, req.clerkId);
    res.json({ success: true, data });
  } catch (err) {
    res.status(403).json({ success: false, error: err.message });
  }
};

export const createCard = async (req, res) => {
  try {
    const { columns_id, title, description, due_date } = req.body;
    const data = await cardsService.createCard(columns_id, title, description, due_date, req.clerkId);
    res.status(201).json({ success: true, data });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

export const updateCard = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, due_date, columns_id, progress } = req.body;
    const fields = {};
    if (title !== undefined) fields.title = title;
    if (description !== undefined) fields.description = description;
    if (due_date !== undefined) fields.due_date = due_date;
    if (columns_id !== undefined) fields.columns_id = columns_id;
    if (progress !== undefined) fields.progress = progress;

    const data = await cardsService.updateCard(id, fields, req.clerkId);
    res.json({ success: true, data });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

export const deleteCard = async (req, res) => {
  try {
    await cardsService.deleteCard(req.params.id, req.clerkId);
    res.json({ success: true, message: "Card berhasil dihapus" });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// ATTACHMENTS
export const getAttachments = async (req, res) => {
  try {
    const data = await cardsService.getAttachments(req.params.card_id, req.clerkId);
    res.json({ success: true, data });
  } catch (err) {
    res.status(403).json({ success: false, error: err.message });
  }
};

export const uploadAttachment = async (req, res) => {
  try {
    const { card_id, file_url, file_name } = req.body;
    const data = await cardsService.uploadAttachment(card_id, file_url, file_name, req.clerkId);
    res.status(201).json({ success: true, data });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

export const deleteAttachment = async (req, res) => {
  try {
    await cardsService.deleteAttachment(req.params.id, req.clerkId);
    res.json({ success: true, message: "Attachment berhasil dihapus" });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// ASSIGN / UNASSIGN
export const assignUser = async (req, res) => {
  try {
    const { card_id, user_id } = req.body;
    await cardsService.assignUser(card_id, user_id, req.clerkId);
    res.json({ success: true, message: "User berhasil di-assign" });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

export const unassignUser = async (req, res) => {
  try {
    const { card_id, user_id } = req.body;
    await cardsService.unassignUser(card_id, user_id, req.clerkId);
    res.json({ success: true, message: "User berhasil di-unassign" });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// CARD MEMBERS
export const getCardMembers = async (req, res) => {
  try {
    const data = await cardsService.getCardMembers(req.params.card_id, req.clerkId);
    res.json({ success: true, data });
  } catch (err) {
    res.status(403).json({ success: false, error: err.message });
  }
};

// PROJECT PROGRESS
export const getProjectProgress = async (req, res) => {
  try {
    const progress = await cardsService.getProjectProgress(req.params.project_id, req.clerkId);
    res.json({ success: true, progress });
  } catch (err) {
    res.status(403).json({ success: false, error: err.message });
  }
};