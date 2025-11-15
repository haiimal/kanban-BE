// src/services/columnsService.js
import supabase from "../config/database.js";

// Helper: ambil role user lewat boards_id → project_id
const getUserRoleByBoard = async (boards_id, clerkId) => {
  // Ambil project_id dari board
  const { data: board, error: boardErr } = await supabase
    .from("boards")
    .select("project_id")
    .eq("id", boards_id)
    .single();

  if (boardErr) throw new Error(boardErr.message);
  if (!board) throw new Error("Board tidak ditemukan.");

  // Cek apakah user adalah member project
  const { data: member, error: memberErr } = await supabase
    .from("project_member")
    .select("role")
    .eq("project_id", board.project_id)
    .eq("clerk_user_id", clerkId)
    .maybeSingle();

  if (memberErr) throw new Error(memberErr.message);
  if (!member) throw new Error("Kamu bukan member dari project ini.");

  return member.role; // 'admin' | 'member'
};

// GET columns (member + admin boleh)
export const getColumnsByBoard = async (boards_id, clerkId) => {
  if (!boards_id) throw new Error("boards_id wajib diisi.");

  const role = await getUserRoleByBoard(boards_id, clerkId);

  const { data, error } = await supabase
    .from("columns")
    .select("*")
    .eq("boards_id", boards_id)
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return data;
};

// CREATE column (admin only)
export const createColumn = async (boards_id, name, clerkId) => {
  if (!boards_id || !name) throw new Error("boards_id dan name wajib diisi.");

  const role = await getUserRoleByBoard(boards_id, clerkId);
  if (role !== "admin") throw new Error("Hanya admin yang bisa membuat column.");

  const { data, error } = await supabase
    .from("columns")
    .insert([{ boards_id, name, created_at: new Date().toISOString() }])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

// UPDATE column (admin only)
export const updateColumn = async (id, name, clerkId) => {
  if (!id || !name) throw new Error("id dan name wajib diisi.");

  // Ambil boards_id dari column
  const { data: column, error: colErr } = await supabase
    .from("columns")
    .select("boards_id")
    .eq("id", id)
    .single();

  if (colErr) throw new Error(colErr.message);
  if (!column) throw new Error("Column tidak ditemukan.");

  const role = await getUserRoleByBoard(column.boards_id, clerkId);
  if (role !== "admin") throw new Error("Hanya admin yang bisa mengedit column.");

  const { data, error } = await supabase
    .from("columns")
    .update({ name })
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

// DELETE column (admin only)
export const deleteColumn = async (id, clerkId) => {
  if (!id) throw new Error("id wajib diisi.");

  // Ambil boards_id dari column
  const { data: column, error: colErr } = await supabase
    .from("columns")
    .select("boards_id")
    .eq("id", id)
    .single();

  if (colErr) throw new Error(colErr.message);
  if (!column) throw new Error("Column tidak ditemukan.");

  const role = await getUserRoleByBoard(column.boards_id, clerkId);
  if (role !== "admin") throw new Error("Hanya admin yang bisa menghapus column.");

  const { error } = await supabase.from("columns").delete().eq("id", id);

  if (error) throw new Error(error.message);

  return true;
};
