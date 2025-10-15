// controllers/projectMemberController.js

// Ambil semua member dari project tertentu
const getAllMembers = async (req, res) => {
  console.log("GET /api/project-members/:project_id hit");
  const { project_id } = req.params;
  const members = [
    { id: 1, project_id, clerk_user_id: "user_abc123", role: "admin" },
    { id: 2, project_id, clerk_user_id: "user_xyz456", role: "member" },
  ];
  res.json({
    message: `Success get all members for project ${project_id}`,
    data: members,
  });
};

// Tambah member baru ke project
const addMember = async (req, res) => {
  console.log("POST /api/project-members hit");

  // Ambil Clerk ID dari header (kalau ada)
  const headerClerkId = req.headers['x-clerk-id'];
  // Ambil data dari body
  const { project_id, clerk_user_id, role } = req.body;

  // Gunakan Clerk ID dari header kalau tersedia, kalau tidak pakai yang dari body
  const finalClerkId = headerClerkId || clerk_user_id;

  res.status(201).json({
    message: "Project member added (dummy)",
    data: {
      id: 99,
      project_id,
      clerk_user_id: finalClerkId,
      role,
      source: headerClerkId
        ? "Clerk ID diterima dari header"
        : "Clerk ID diterima dari body",
    },
  });
};

// Hapus member berdasarkan id
const removeMember = async (req, res) => {
  console.log("DELETE /api/project-members/:id hit");
  const { id } = req.params;
  res.json({
    message: `Member ${id} removed (dummy)`,
  });
};

export { getAllMembers, addMember, removeMember };
