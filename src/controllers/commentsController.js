import * as commentsService from "../services/commentsService.js";

export const getCommentsByCard = async (req, res) => {
  try {
    const data = await commentsService.getCommentsByCard(req.params.card_id, req.clerkId);
    res.json({ success: true, data });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

export const createComment = async (req, res) => {
  try {
    const { card_id, content } = req.body;
    const data = await commentsService.createComment(card_id, content, req.clerkId);
    res.status(201).json({ success: true, data });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

export const updateComment = async (req, res) => {
  try {
    const { content } = req.body;
    const data = await commentsService.updateComment(req.params.id, content, req.clerkId);
    res.json({ success: true, data });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

export const deleteComment = async (req, res) => {
  try {
    await commentsService.deleteComment(req.params.id, req.clerkId);
    res.json({ success: true, message: "Komentar berhasil dihapus" });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};