import supabase from "../config/database.js";


// Ambil semua member dari project tertentu
const getAllMembers = async (req, res) => {
console.log("GET /api/project-members/ hit");
const { project_id } = req.params;
try {
const { data, error } = await supabase
.from("project_member")
.select("*")
.eq("project_id", project_id);

if (error) throw error;

res.json({
  message: `Success get all members for project ${project_id}`,
  data,
});


} catch (err) {
console.error(err.message);
res.status(500).json({ error: "Gagal mengambil data member" });
}
};


// Tambah member baru ke project (dengan validasi role & anti-duplikat)
const addMember = async (req, res) => {
console.log("POST /api/project-members hit");


try {
// Ambil Clerk ID dari header atau body
const headerClerkId = req.headers["x-clerk-id"];
const { project_id, clerk_user_id, role } = req.body;
const finalClerkId = headerClerkId || clerk_user_id;

if (!finalClerkId) {
  return res.status(400).json({
    error: "Clerk ID tidak ditemukan (dari header atau body).",
  });
}

// Validasi role (hanya admin/member)
const validRoles = ["admin", "member"];
if (!validRoles.includes(role)) {
  return res.status(400).json({
    error: "Role tidak valid. Hanya boleh 'admin' atau 'member'.",
  });
}

// Cek apakah user sudah terdaftar di project yang sama
const { data: existing, error: checkError } = await supabase
  .from("project_member")
  .select("id")
  .eq("project_id", project_id)
  .eq("clerk_user_id", finalClerkId)
  .maybeSingle(); // tidak error kalau kosong

if (checkError) throw checkError;
if (existing) {
  return res.status(400).json({
    error: "User sudah terdaftar di project ini.",
  });
}

// Simpan ke Supabase
const { data, error } = await supabase
  .from("project_member")
  .insert([
    {
      project_id,
      clerk_user_id: finalClerkId,
      role,
      joined_at: new Date().toISOString(),
    },
  ])
  .select()
  .single();

if (error) throw error;

res.status(201).json({
  message: "Project member added successfully",
  data,
});


} catch (err) {
console.error("Supabase Error:", err.message);
res.status(500).json({ error: "Gagal menambahkan project member" });
}
};


// Hapus member berdasarkan id
const removeMember = async (req, res) => {
console.log("DELETE /api/project-members/ hit");
const { id } = req.params;

try {
const { error } = await supabase.from("project_member").delete().eq("id", id);
if (error) throw error;

res.json({ message: `Member ${id} removed successfully` });


} catch (err) {
console.error("Supabase Error:", err.message);
res.status(500).json({ error: "Gagal menghapus member" });
}
};




export { getAllMembers, addMember, removeMember };