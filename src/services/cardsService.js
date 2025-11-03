// src/services/cardsService.js
import supabase from "../config/database.js";

//  Ambil semua cards berdasarkan columns_id
export const getCardsByColumn = async (columns_id) => {
  if (!columns_id) throw new Error("columns_id wajib diisi.");

  const { data, error } = await supabase
    .from("cards")
    .select("*")
    .eq("columns_id", columns_id)
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return data;
};

//  Tambah card baru
export const createCard = async (columns_id, title, description, due_date) => {
  if (!columns_id || !title) throw new Error("columns_id dan title wajib diisi.");

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

//  Update card berdasarkan id
export const updateCard = async (id, fieldsToUpdate) => {
  if (!id) throw new Error("id wajib diisi.");

  const { data, error } = await supabase
    .from("cards")
    .update(fieldsToUpdate)
    .eq("id", id)
    .select()
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) throw new Error("Card tidak ditemukan.");

  return data;
};

//  Hapus card berdasarkan id
export const deleteCard = async (id) => {
  if (!id) throw new Error("id wajib diisi.");

  const { error } = await supabase.from("cards").delete().eq("id", id);
  if (error) throw new Error(error.message);

  return true;
};
