// src/controllers/projectMemberController.js
import * as projectMemberService from "../services/projectMemberService.js";

// GET all members
export const getAllMembers = async (req, res) => {
  console.log("GET/api/project-members/:project_id hit");
  const { project_id } = req.params;

  try {
    const data = await projectMemberService.getAllMembers(project_id);
    res.json({
      message: `Success get all members for project ${project_id}`,
      data,
    });
  } catch (err) {
    console.error("Supabase Error:", err.message);
    res.status(500).json({ error: "Gagal mengambil data member" });
  }
};

// POST add member
export const addMember = async (req, res) => {
  console.log("POST /api/project-members hit");
  try {
    const headerClerkId = req.headers["x-clerk-id"];
    const { project_id, clerk_user_id, role } = req.body;
    const finalClerkId = headerClerkId || clerk_user_id;

    if (!finalClerkId) {
      return res
        .status(400)
        .json({ error: "Clerk ID tidak ditemukan (dari header atau body)." });
    }

    const data = await projectMemberService.addMember(
      project_id,
      finalClerkId,
      role
    );

    res.status(201).json({
      message: "Project member added successfully",
      data,
    });
  } catch (err) {
    console.error("Supabase Error:", err.message);
    res.status(400).json({ error: err.message });
  }
};

// DELETE member
export const removeMember = async (req, res) => {
  console.log("DELETE /api/project-members/:id hit");
  const { id } = req.params;

  try {
    await projectMemberService.removeMember(id);
    res.json({ message: `Member ${id} removed successfully` });
  } catch (err) {
    console.error("Supabase Error:", err.message);
    res.status(500).json({ error: "Gagal menghapus member" });
  }
};
