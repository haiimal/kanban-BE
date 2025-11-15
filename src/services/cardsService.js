// src/services/cardsService.js
import supabase from "../config/database.js";

// Helper → dapatkan role user berdasarkan columns_id
const getUserRoleByColumn = async (columns_id, clerkId) => {
  // Ambil boards_id dari column
  const { data: column, error: colErr } = await supabase
    .from("columns")
    .select("boards_id")
    .eq("id", columns_id)
    .single();

  if (colErr) throw new Error(colErr.message);
  if (!column) throw new Error("Column tidak ditemukan.");

  // Ambil project_id dari board
  const { data: board, error: boardErr } = await supabase
    .from("boards")
    .select("project_id")
    .eq("id", column.boards_id)
    .single();

  if (boardErr) throw new Error(boardErr.message);
  if (!board) throw new Error("Board tidak ditemukan.");

  // Cek membership
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

// GET cards
export const getCardsByColumn = async (columns_id, clerkId) => {
  if (!columns_id) throw new Error("columns_id wajib diisi.");

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

// UPDATE card (admin full edit, member hanya pindahkan column)
export const updateCard = async (id, fieldsToUpdate, clerkId) => {
  if (!id) throw new Error("id wajib diisi.");

  // Ambil kolom asal card
  const { data: card, error: cardErr } = await supabase
    .from("cards")
    .select("columns_id")
    .eq("id", id)
    .single();

  if (cardErr) throw new Error(cardErr.message);
  if (!card) throw new Error("Card tidak ditemukan.");

  const role = await getUserRoleByColumn(card.columns_id, clerkId);

  // Jika member → hanya boleh pindah column
  const keys = Object.keys(fieldsToUpdate);
  const hanyaPindahKolom = keys.length === 1 && keys.includes("columns_id");

  if (role === "member" && !hanyaPindahKolom) {
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

  // Ambil column asal card
  const { data: card, error: cardErr } = await supabase
    .from("cards")
    .select("columns_id")
    .eq("id", id)
    .single();

  if (cardErr) throw new Error(cardErr.message);
  if (!card) throw new Error("Card tidak ditemukan.");

  const role = await getUserRoleByColumn(card.columns_id, clerkId);
  if (role !== "admin") {
    throw new Error("Hanya admin yang boleh menghapus card.");
  }

  const { error } = await supabase.from("cards").delete().eq("id", id);

  if (error) throw new Error(error.message);
  return true;
};
