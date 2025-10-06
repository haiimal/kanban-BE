// Import Supabase client
import supabase from '../config/database.js';

// ===============================
// Ambil semua boards berdasarkan project_id
// ===============================
export const getAllBoards = async (req, res) => {
  const { project_id } = req.params;
  const { data, error } = await supabase
    .from('boards')
    .select('*')
    .eq('project_id', project_id);
  
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
};

// ===============================
// Buat board baru
// ===============================
export const createBoard = async (req, res) => {
  const { project_id } = req.body;
  const { data, error } = await supabase
    .from('boards')
    .insert([{ project_id }])
    .select()
    .single();
  
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
};

// ===============================
// Hapus board
// ===============================
export const deleteBoard = async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase
    .from('boards')
    .delete()
    .eq('id', id);
  
  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: 'Board deleted' });
};
