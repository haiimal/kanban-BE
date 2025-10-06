// Import Supabase client
import supabase from '../config/database.js';

// ===============================
// Ambil semua members berdasarkan project_id
// ===============================
export const getAllMembers = async (req, res) => {
  const { project_id } = req.params;
  const { data, error } = await supabase
    .from('project_member')
    .select('*')
    .eq('project_id', project_id);
  
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
};

// ===============================
// Tambah member baru
// ===============================
export const addMember = async (req, res) => {
  const { project_id, clerk_user_id, role } = req.body;
  const { data, error } = await supabase
    .from('project_member')
    .insert([{ project_id, clerk_user_id, role }])
    .select()
    .single();
  
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
};

// ===============================
// Hapus member
// ===============================
export const removeMember = async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase
    .from('project_member')
    .delete()
    .eq('id', id);
  
  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: 'Member removed' });
};
