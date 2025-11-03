// src/services/boardsService.js
import supabase from "../config/database.js";

//  Ambil semua board berdasarkan project_id
export const getBoardsByProject = async (project_id) => {
  if (!project_id) throw new Error("project_id wajib diisi");

  const { data, error } = await supabase
    .from("boards")
    .select("*")
    .eq("project_id", project_id)
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return data;
};

//  Tambah board baru
export const createBoard = async (project_id, name) => {
  if (!project_id || !name)
    throw new Error("project_id dan name wajib diisi");

  const { data, error } = await supabase
    .from("boards")
    .insert([
      {
        project_id,
        name,
        created_at: new Date().toISOString(),
      },
    ])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

//  Update nama board
export const updateBoard = async (id, name) => {
  if (!id || !name) throw new Error("id dan name wajib diisi");

  const { data, error } = await supabase
    .from("boards")
    .update({ name })
    .eq("id", id)
    .select()
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) throw new Error("Board tidak ditemukan");

  return data;
};

//  Hapus board
export const deleteBoard = async (id) => {
  if (!id) throw new Error("id wajib diisi");

  const { error } = await supabase.from("boards").delete().eq("id", id);
  if (error) throw new Error(error.message);

  return true;
};
