// src/services/projectMemberService.js
import supabase from "../config/database.js";

//  Ambil semua member dari project tertentu
export const getAllMembers = async (project_id, requesterId) => {
  if (!project_id) throw new Error("project_id wajib diisi");

  // Cek apakah requester adalah member project
  const { data: memberCheck } = await supabase
    .from("project_member")
    .select("id")
    .eq("project_id", project_id)
    .eq("clerk_user_id", requesterId)
    .maybeSingle();

  if (!memberCheck) throw new Error("Kamu bukan bagian dari project ini");

  // Ambil semua member dari project
  const { data, error } = await supabase
    .from("project_member")
    .select("id, clerk_user_id, role, joined_at")
    .eq("project_id", project_id);

  if (error) throw new Error(error.message);
  return data;
};

//  Tambah member baru (hanya admin yang bisa nambah)
export const addMember = async (project_id, clerk_user_id, role, requesterId) => {
  if (!project_id || !clerk_user_id || !role) {
    throw new Error("project_id, clerk_user_id, dan role wajib diisi");
  }

  // Pastikan requester adalah admin project
  const { data: adminCheck, error: adminError } = await supabase
    .from("project_member")
    .select("role")
    .eq("project_id", project_id)
    .eq("clerk_user_id", requesterId)
    .single();

  if (adminError || !adminCheck) throw new Error("Kamu bukan member dari project ini");
  if (adminCheck.role !== "admin") throw new Error("Hanya admin yang bisa menambah member");

  // Validasi role
  const validRoles = ["admin", "member"];
  if (!validRoles.includes(role)) throw new Error("Role tidak valid. Hanya boleh 'admin' atau 'member'.");

  // Cek apakah user sudah terdaftar di project
  const { data: existing } = await supabase
    .from("project_member")
    .select("id")
    .eq("project_id", project_id)
    .eq("clerk_user_id", clerk_user_id)
    .maybeSingle();

  if (existing) throw new Error("User sudah terdaftar di project ini.");

  // Tambahkan member baru
  const { data, error } = await supabase
    .from("project_member")
    .insert([
      {
        project_id,
        clerk_user_id,
        role,
        joined_at: new Date().toISOString(),
      },
    ])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

//  Hapus member berdasarkan ID (hanya admin yang bisa, admin tidak bisa hapus diri sendiri)
export const removeMember = async (id, requesterId) => {
  if (!id) throw new Error("ID member wajib diisi");

  // Ambil data member yang mau dihapus
  const { data: member, error: memberError } = await supabase
    .from("project_member")
    .select("project_id, clerk_user_id")
    .eq("id", id)
    .single();

  if (memberError || !member) throw new Error("Member tidak ditemukan");

  // Pastikan requester adalah admin di project yang sama
  const { data: adminCheck } = await supabase
    .from("project_member")
    .select("role")
    .eq("project_id", member.project_id)
    .eq("clerk_user_id", requesterId)
    .single();

  if (!adminCheck || adminCheck.role !== "admin") {
    throw new Error("Hanya admin yang bisa menghapus member");
  }

  // Admin tidak bisa menghapus dirinya sendiri
  if (member.clerk_user_id === requesterId) {
    throw new Error("Admin tidak dapat menghapus dirinya sendiri dari project");
  }

  // Hapus member
  const { error } = await supabase.from("project_member").delete().eq("id", id);
  if (error) throw new Error(error.message);

  return true;
};
