// src/controllers/projectMemberController.js
import * as projectMemberService from "../services/projectMemberService.js";

// GET semua member dalam 1 project
export const getAllMembers = async (req, res) => {
  const { project_id } = req.params;

  try {
    if (!req.clerkId) {
      return res.status(401).json({ success: false, error: "Unauthorized. Harus login dulu." });
    }

    const data = await projectMemberService.getAllMembers(project_id);
    res.status(200).json({
      success: true,
      message: `Berhasil mengambil semua member untuk project ${project_id}`,
      data,
    });
  } catch (err) {
    console.error("Error getAllMembers:", err.message);
    res.status(400).json({ success: false, error: err.message });
  }
};

// POST - Tambah member baru ke project
export const addMember = async (req, res) => {
  const { project_id, clerk_user_id, role } = req.body;

  try {
    if (!req.clerkId) {
      return res.status(401).json({ success: false, error: "Unauthorized. Harus login dulu." });
    }

    const data = await projectMemberService.addMember(project_id, clerk_user_id, role, req.clerkId);

    res.status(201).json({
      success: true,
      message: "Berhasil menambahkan member baru ke project",
      data,
    });
  } catch (err) {
    console.error("Error addMember:", err.message);
    res.status(400).json({ success: false, error: err.message });
  }
};

// DELETE - Hapus member dari project
export const removeMember = async (req, res) => {
  const { id } = req.params;

  try {
    if (!req.clerkId) {
      return res.status(401).json({ success: false, error: "Unauthorized. Harus login dulu." });
    }

    await projectMemberService.removeMember(id, req.clerkId);
    res.status(200).json({
      success: true,
      message: `Member ${id} berhasil dihapus dari project`,
    });
  } catch (err) {
    console.error("Error removeMember:", err.message);
    res.status(400).json({ success: false, error: err.message });
  }
};
