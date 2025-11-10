// src/services/cardsService.js
import supabase from "../config/database.js";

// Helper: ambil role user berdasarkan column_id
const getUserRoleByColumn = async (columns_id, clerkId) => {
  // Ambil boards_id dari column
  const { data: column } = await supabase
    .from("columns")
    .select("boards_id")
    .eq("id", columns_id)
    .single();

  if (!column) throw new Error("Column tidak ditemukan.");

  // Ambil project_id dari board
  const { data: board } = await supabase
    .from("boards")
    .select("project_id")
    .eq("id", column.boards_id)
    .single();

  if (!board) throw new Error("Board tidak ditemukan.");

  // Cek apakah user adalah member dari project
  const { data: member } = await supabase
    .from("project_member")
    .select("role")
    .eq("project_id", board.project_id)
    .eq("clerk_user_id", clerkId)
    .maybeSingle();

  if (!member) throw new Error("Kamu bukan member dari project ini.");

  return member.role; // 'admin' atau 'member'
};

// GET cards (member dan admin bisa)
export const getCardsByColumn = async (columns_id, clerkId) => {
  if (!columns_id) throw new Error("columns_id wajib diisi.");

  // Pastikan user anggota project
  await getUserRoleByColumn(columns_id, clerkId);

  const { data, error } = await supabase
    .from("cards")
    .select("*")
    .eq("columns_id", columns_id)
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return data;
};

// CREATE card (admin only)
export const createCard = async (columns_id, title, description, due_date, clerkId) => {
  if (!columns_id || !title) throw new Error("columns_id dan title wajib diisi.");

  const role = await getUserRoleByColumn(columns_id, clerkId);
  if (role !== "admin") throw new Error("Hanya admin yang bisa menambahkan card.");

  const { data, error } = await supabase
    .from("cards")
    .insert([
      {
        columns_id,
        title,
        description: description || null,
        due_date: due_date || null,
        created_at: new Date().toISOString(),
      },
    ])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

// UPDATE card (member bisa pindahin antar kolom, admin bisa ubah isi)
export const updateCard = async (id, fieldsToUpdate, clerkId) => {
  if (!id) throw new Error("id wajib diisi.");

  // Ambil column asal
  const { data: card } = await supabase
    .from("cards")
    .select("columns_id")
    .eq("id", id)
    .single();

  if (!card) throw new Error("Card tidak ditemukan.");

  const role = await getUserRoleByColumn(card.columns_id, clerkId);

  // Member hanya boleh pindahin kolom
  const keys = Object.keys(fieldsToUpdate);
  const hanyaPindah = keys.length === 1 && keys.includes("columns_id");

  if (role === "member" && !hanyaPindah) {
    throw new Error("Member hanya boleh memindahkan card antar kolom.");
  }

  const { data, error } = await supabase
    .from("cards")
    .update(fieldsToUpdate)
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

// DELETE card (admin only)
export const deleteCard = async (id, clerkId) => {
  if (!id) throw new Error("id wajib diisi.");

  // Ambil column_id dari card
  const { data: card } = await supabase
    .from("cards")
    .select("columns_id")
    .eq("id", id)
    .single();

  if (!card) throw new Error("Card tidak ditemukan.");

  const role = await getUserRoleByColumn(card.columns_id, clerkId);
  if (role !== "admin") throw new Error("Hanya admin yang bisa menghapus card.");

  const { error } = await supabase.from("cards").delete().eq("id", id);
  if (error) throw new Error(error.message);

  return true;
};
