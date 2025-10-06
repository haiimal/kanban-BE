// Import Supabase client
import supabase from '../config/database.js';

// ===============================
// Ambil semua columns berdasarkan boards_id
// ===============================
export const getAllColumns = async (req, res) => {
  const { boards_id } = req.params;
  const { data, error } = await supabase
    .from('columns')
    .select('*')
    .eq('boards_id', boards_id);
  
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
};

// ===============================
// Buat column baru
// ===============================
export const createColumn = async (req, res) => {
  const { boards_id, name } = req.body;
  const { data, error } = await supabase
    .from('columns')
    .insert([{ boards_id, name }])
    .select()
    .single();
  
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
};

// ===============================
// Hapus column
// ===============================
export const deleteColumn = async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase
    .from('columns')
    .delete()
    .eq('id', id);
  
  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: 'Column deleted' });
};
