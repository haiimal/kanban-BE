// src/services/boardsService.js
import supabase from "../config/database.js";

// Cek apakah user termasuk member project
const isProjectMember = async (project_id, clerkId) => {
  const { data } = await supabase
    .from("project_member")
    .select("role")
    .eq("project_id", project_id)
    .eq("clerk_user_id", clerkId)
    .maybeSingle();
  return data;
};

// Ambil semua board berdasarkan project_id
export const getBoardsByProject = async (project_id, clerkId) => {
  if (!project_id) throw new Error("project_id wajib diisi");

  const member = await isProjectMember(project_id, clerkId);
  if (!member) throw new Error("Kamu tidak memiliki akses ke project ini.");

  const { data, error } = await supabase
    .from("boards")
    .select("*")
    .eq("project_id", project_id)
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return data;
};

// Tambah board baru (hanya admin)
export const createBoard = async (project_id, name, clerkId) => {
  if (!project_id || !name) throw new Error("project_id dan name wajib diisi");

  const member = await isProjectMember(project_id, clerkId);
  if (!member) throw new Error("Kamu bukan member project ini.");
  if (member.role !== "admin") throw new Error("Hanya admin yang bisa membuat board.");

  const { data, error } = await supabase
    .from("boards")
    .insert([{ project_id, name, created_at: new Date().toISOString() }])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

// Update nama board (hanya admin project)
export const updateBoard = async (id, name, clerkId) => {
  if (!id || !name) throw new Error("id dan name wajib diisi");

  // Ambil project_id dari board
  const { data: board } = await supabase.from("boards").select("project_id").eq("id", id).single();
  if (!board) throw new Error("Board tidak ditemukan");

  const member = await isProjectMember(board.project_id, clerkId);
  if (!member) throw new Error("Kamu bukan member project ini.");
  if (member.role !== "admin") throw new Error("Hanya admin yang bisa mengedit board.");

  const { data, error } = await supabase
    .from("boards")
    .update({ name })
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

// Hapus board (hanya admin project)
export const deleteBoard = async (id, clerkId) => {
  if (!id) throw new Error("id wajib diisi");

  // Ambil project_id dari board
  const { data: board } = await supabase.from("boards").select("project_id").eq("id", id).single();
  if (!board) throw new Error("Board tidak ditemukan");

  const member = await isProjectMember(board.project_id, clerkId);
  if (!member) throw new Error("Kamu bukan member project ini.");
  if (member.role !== "admin") throw new Error("Hanya admin yang bisa menghapus board.");

  const { error } = await supabase.from("boards").delete().eq("id", id);
  if (error) throw new Error(error.message);

  return true;
};
