import * as projectMemberService from "../services/projectMemberService.js";

//  Ambil semua member dalam project
export const getAllMembers = async (req, res) => {
  console.log("GET /api/project-members/:project_id hit");
  const { project_id } = req.params;

  try {
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

//  Tambah member baru ke project
export const addMember = async (req, res) => {
  console.log("POST /api/project-members hit");

  try {
    const { project_id, clerk_user_id, role } = req.body;
    const finalClerkId = req.clerkId || clerk_user_id; // ambil dari token Clerk middleware

    if (!finalClerkId) {
      return res.status(400).json({
        success: false,
        error: "Clerk ID tidak ditemukan (dari token atau body).",
      });
    }

    const data = await projectMemberService.addMember(
      project_id,
      finalClerkId,
      role
    );

    res.status(201).json({
      success: true,
      message: "Berhasil menambahkan member ke project",
      data,
    });
  } catch (err) {
    console.error("Error addMember:", err.message);
    res.status(400).json({ success: false, error: err.message });
  }
};

//  Hapus member dari project
export const removeMember = async (req, res) => {
  console.log("DELETE /api/project-members/:id hit");
  const { id } = req.params;

  try {
    await projectMemberService.removeMember(id);
    res.status(200).json({
      success: true,
      message: `Member ${id} berhasil dihapus dari project`,
    });
  } catch (err) {
    console.error("Error removeMember:", err.message);
    res.status(400).json({ success: false, error: err.message });
  }
};
