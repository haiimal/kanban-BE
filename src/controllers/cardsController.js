// Import Supabase client
import supabase from '../config/database.js';

// ===============================
// Ambil semua cards berdasarkan columns_id
// ===============================
export const getAllCards = async (req, res) => {
  const { columns_id } = req.params;
  const { data, error } = await supabase
    .from('cards')
    .select('*')
    .eq('columns_id', columns_id);
  
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
};

// ===============================
// Buat card baru
// ===============================
export const createCard = async (req, res) => {
  const { columns_id, title, description, due_date } = req.body;
  const { data, error } = await supabase
    .from('cards')
    .insert([{ columns_id, title, description, due_date }])
    .select()
    .single();
  
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
};

// ===============================
// Hapus card
// ===============================
export const deleteCard = async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase
    .from('cards')
    .delete()
    .eq('id', id);
  
  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: 'Card deleted' });
};
