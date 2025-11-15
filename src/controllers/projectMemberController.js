// src/controllers/projectMemberController.js
import * as projectMemberService from "../services/projectMemberService.js";

export const getAllMembers = async (req, res) => {
  const { project_id } = req.params;

  try {
    if (!req.clerkId) {
      return res.status(401).json({ success: false, error: "Unauthorized. Harus login dulu." });
    }

    const data = await projectMemberService.getAllMembers(project_id, req.clerkId);

    res.status(200).json({
      success: true,
      message: "Berhasil mengambil semua member",
      project_id,
      data,
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

export const addMember = async (req, res) => {
  const { project_id, clerk_user_id, role } = req.body;

  try {
    if (!req.clerkId) {
      return res.status(401).json({ success: false, error: "Unauthorized. Harus login dulu." });
    }

    const data = await projectMemberService.addMember(
      project_id,
      clerk_user_id,
      role,
      req.clerkId
    );

    res.status(201).json({
      success: true,
      message: "Berhasil menambahkan member baru ke project",
      data,
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

export const removeMember = async (req, res) => {
  const { id } = req.params;

  try {
    if (!req.clerkId) {
      return res.status(401).json({ success: false, error: "Unauthorized. Harus login dulu." });
    }

    await projectMemberService.removeMember(id, req.clerkId);

    res.status(200).json({
      success: true,
      message: `Member dengan ID ${id} berhasil dihapus`,
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};
