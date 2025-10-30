import supabase from "../config/database.js";

// Ambil semua columns berdasarkan boards_id
export const getColumnsByBoard = async (boards_id) => {
  const { data, error } = await supabase
    .from("columns")
    .select("*")
    .eq("boards_id", boards_id)
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return data;
};

// Tambah column baru
export const createColumn = async (boards_id, name) => {
  if (!boards_id || !name) throw new Error("boards_id dan name wajib diisi.");

  const { data, error } = await supabase
    .from("columns")
    .insert([{ boards_id, name, created_at: new Date().toISOString() }])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

// Update column berdasarkan id
export const updateColumn = async (id, name) => {
  const { data, error } = await supabase
    .from("columns")
    .update({ name })
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

// Hapus column berdasarkan id
export const deleteColumn = async (id) => {
  const { error } = await supabase.from("columns").delete().eq("id", id);
  if (error) throw new Error(error.message);
  return true;
};
