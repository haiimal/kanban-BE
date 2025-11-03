// src/services/projectMemberService.js
import supabase from "../config/database.js";

//  Ambil semua member dari project tertentu
export const getAllMembers = async (project_id) => {
  if (!project_id) throw new Error("project_id wajib diisi");

  const { data, error } = await supabase
    .from("project_member")
    .select("*")
    .eq("project_id", project_id);

  if (error) throw new Error(error.message);
  return data;
};

//  Tambah member baru ke project
export const addMember = async (project_id, clerk_user_id, role) => {
  if (!project_id || !clerk_user_id || !role)
    throw new Error("project_id, clerk_user_id, dan role wajib diisi");

  const validRoles = ["admin", "member"];
  if (!validRoles.includes(role)) {
    throw new Error("Role tidak valid. Hanya boleh 'admin' atau 'member'.");
  }

  // Cek duplikat user di project
  const { data: existing, error: checkError } = await supabase
    .from("project_member")
    .select("id")
    .eq("project_id", project_id)
    .eq("clerk_user_id", clerk_user_id)
    .maybeSingle();

  if (checkError) throw new Error(checkError.message);
  if (existing) throw new Error("User sudah terdaftar di project ini.");

  // Tambah member baru
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

//  Hapus member berdasarkan ID
export const removeMember = async (id) => {
  if (!id) throw new Error("ID member wajib diisi");

  const { error } = await supabase.from("project_member").delete().eq("id", id);
  if (error) throw new Error(error.message);

  return true;
};

