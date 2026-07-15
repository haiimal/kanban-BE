// src/services/columnsService.js
import supabase from "../config/database.js";
import { notifyProjectMembers } from "./notificationsService.js";

// =============================
//  HELPER: ACTIVITY LOG
// =============================
const createActivityLog = async ({ card_id = null, project_id = null, clerk_user_id, action, description }) => {
  await supabase.from("activity_logs").insert([{ card_id, project_id, clerk_user_id, action, description }]);
};

// =============================
//  HELPER: ROLE CHECK
// =============================
const getUserRoleByBoard = async (boards_id, clerkId) => {
  const { data: board, error: boardErr } = await supabase
    .from("boards")
    .select("project_id")
    .eq("id", boards_id)
    .single();

  if (boardErr || !board) throw new Error("Board tidak ditemukan.");

  const { data: member, error: memberErr } = await supabase
    .from("project_member")
    .select("role")
    .eq("project_id", board.project_id)
    .eq("clerk_user_id", clerkId)
    .maybeSingle();

  if (memberErr || !member) throw new Error("Kamu bukan member dari project ini.");

  return { role: member.role, project_id: board.project_id };
};

// =============================
// GET columns (semua member bisa lihat)
// =============================
export const getColumnsByBoard = async (boards_id, clerkId) => {
  if (!boards_id) throw new Error("boards_id wajib diisi.");

  await getUserRoleByBoard(boards_id, clerkId);

  const { data, error } = await supabase
    .from("columns")
    .select("*")
    .eq("boards_id", boards_id)
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return data;
};

// =============================
// CREATE column (PM only)
// =============================
export const createColumn = async (boards_id, name, type = "other", clerkId) => {
  if (!boards_id || !name) throw new Error("boards_id dan name wajib diisi.");

  const validTypes = ["todo", "in_progress", "done", "other"];
  if (!validTypes.includes(type)) throw new Error("Type tidak valid. Pilih: todo, in_progress, done, other");

  const { role, project_id } = await getUserRoleByBoard(boards_id, clerkId);
  if (role !== "PM") throw new Error("Hanya PM yang bisa membuat column.");

  const { data, error } = await supabase
    .from("columns")
    .insert([{ boards_id, name, type, created_at: new Date().toISOString() }])
    .select()
    .single();

  if (error) throw new Error(error.message);

  await createActivityLog({
    project_id,
    clerk_user_id: clerkId,
    action: "CREATE_COLUMN",
    description: `Menambahkan kolom baru "${name}"`,
  });

  await notifyProjectMembers({
    project_id,
    actorClerkId: clerkId,
    type: "CREATE_COLUMN",
    message: `Kolom baru "${name}" ditambahkan`,
  });

  return data;
};

// =============================
// UPDATE column (PM only)
// =============================
export const updateColumn = async (id, name, type, clerkId) => {
  if (!id || !name) throw new Error("id dan name wajib diisi.");

  const validTypes = ["todo", "in_progress", "done", "other"];
  if (type && !validTypes.includes(type)) {
    throw new Error("Type tidak valid. Pilih: todo, in_progress, done, other");
  }

  const { data: column, error: colErr } = await supabase
    .from("columns")
    .select("boards_id, name, type") // ambil type lama
    .eq("id", id)
    .single();

  if (colErr || !column) throw new Error("Column tidak ditemukan.");

  const { role, project_id } = await getUserRoleByBoard(column.boards_id, clerkId);
  if (role !== "PM") throw new Error("Hanya PM yang bisa mengedit column.");

  // ambil type lama
  const oldType = column.type;

  const updateFields = {};
  if (type) updateFields.type = type;

  const { data, error } = await supabase
    .from("columns")
    .update(updateFields)
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);

  // log hanya kalau berubah
  if (type && oldType !== type) {
    await createActivityLog({
      project_id,
      clerk_user_id: clerkId,
      action: "UPDATE_COLUMN",
      description: `Mengubah kolom "${column.name}" dari "${oldType}" menjadi "${type}"`,
    });

    await notifyProjectMembers({
      project_id,
      actorClerkId: clerkId,
      type: "UPDATE_COLUMN",
      message: `Kolom "${column.name}" diubah dari "${oldType}" menjadi "${type}"`,
    });
  }

  return data;
};

// =============================
// DELETE column (PM only)
// =============================
export const deleteColumn = async (id, clerkId) => {
  if (!id) throw new Error("id wajib diisi.");

  const { data: column, error: colErr } = await supabase
    .from("columns")
    .select("boards_id, name")
    .eq("id", id)
    .single();

  if (colErr || !column) throw new Error("Column tidak ditemukan.");

  const { role, project_id } = await getUserRoleByBoard(column.boards_id, clerkId);
  if (role !== "PM") throw new Error("Hanya PM yang bisa menghapus column.");

  const { error } = await supabase.from("columns").delete().eq("id", id);
  if (error) throw new Error(error.message);

  await createActivityLog({
    project_id,
    clerk_user_id: clerkId,
    action: "DELETE_COLUMN",
    description: `Menghapus kolom "${column.name}"`,
  });

  await notifyProjectMembers({
    project_id,
    actorClerkId: clerkId,
    type: "DELETE_COLUMN",
    message: `Kolom "${column.name}" telah dihapus`,
  });

  return true;
};