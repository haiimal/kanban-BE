// src/services/projectMemberService.js
import supabase from "../config/database.js";

export const getAllMembers = async (project_id, requesterId) => {
  if (!project_id) throw new Error("project_id wajib diisi");

  // cek requester adalah member project
  const { data: memberCheck, error: checkErr } = await supabase
    .from("project_member")
    .select("id")
    .eq("project_id", project_id)
    .eq("clerk_user_id", requesterId)
    .maybeSingle();

  if (checkErr) throw new Error(checkErr.message);
  if (!memberCheck) throw new Error("Kamu bukan bagian dari project ini");

  // ambil semua member
  const { data, error } = await supabase
    .from("project_member")
    .select("id, clerk_user_id, role, joined_at")
    .eq("project_id", project_id);

  if (error) throw new Error(error.message);

  return data;
};

export const addMember = async (project_id, clerk_user_id, role, requesterId) => {
  if (!project_id || !clerk_user_id || !role) {
    throw new Error("project_id, clerk_user_id, dan role wajib diisi");
  }

  // cek requester admin
  const { data: adminCheck, error: adminErr } = await supabase
    .from("project_member")
    .select("role")
    .eq("project_id", project_id)
    .eq("clerk_user_id", requesterId)
    .single();

  if (adminErr) throw new Error(adminErr.message);
  if (!adminCheck) throw new Error("Kamu bukan member project ini");
  if (adminCheck.role !== "admin") throw new Error("Hanya admin yang bisa menambah member");

  // validasi role
  const validRoles = ["Admin", "Member"];
  if (!validRoles.includes(role)) throw new Error("Role tidak valid");

  // cek user sudah ada
  const { data: existing } = await supabase
    .from("project_member")
    .select("id")
    .eq("project_id", project_id)
    .eq("clerk_user_id", clerk_user_id)
    .maybeSingle();

  if (existing) throw new Error("User sudah terdaftar di project ini");

  // tambah member
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

export const removeMember = async (id, requesterId) => {
  if (!id) throw new Error("ID member wajib diisi");

  // ambil member yang mau dihapus
  const { data: member, error: memberErr } = await supabase
    .from("project_member")
    .select("project_id, clerk_user_id")
    .eq("id", id)
    .single();

  if (memberErr) throw new Error(memberErr.message);
  if (!member) throw new Error("Member tidak ditemukan");

  // cek requester admin
  const { data: adminCheck } = await supabase
    .from("project_member")
    .select("role")
    .eq("project_id", member.project_id)
    .eq("clerk_user_id", requesterId)
    .single();

  if (!adminCheck || adminCheck.role !== "admin") {
    throw new Error("Hanya admin yang bisa menghapus member");
  }

  // admin tidak boleh hapus diri sendiri
  if (member.clerk_user_id === requesterId) {
    throw new Error("Admin tidak boleh menghapus dirinya sendiri");
  }

  // hapus
  const { error } = await supabase
    .from("project_member")
    .delete()
    .eq("id", id);

  if (error) throw new Error(error.message);

  return true;
};
