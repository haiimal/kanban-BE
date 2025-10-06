// Import Supabase client
import supabase from '../config/database.js';

// ===============================
// Ambil semua project
// ===============================
export const getAllProjects = async (req, res) => {
  const { data, error } = await supabase.from('project').select('*');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
};

// ===============================
// Ambil project berdasarkan id
// ===============================
export const getProjectById = async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase.from('project').select('*').eq('id', id).single();
  if (error) return res.status(404).json({ error: 'Project not found' });
  res.json(data);
};

// ===============================
// Buat project baru
// ===============================
export const createProject = async (req, res) => {
  const { name, description } = req.body;
  const { data, error } = await supabase
    .from('project')
    .insert([{ name, description }])
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
};

// ===============================
// Update project
// ===============================
export const updateProject = async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;
  const { data, error } = await supabase
    .from('project')
    .update({ name, description })
    .eq('id', id)
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
};

// ===============================
// Hapus project
// ===============================
export const deleteProject = async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase.from('project').delete().eq('id', id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: 'Project deleted' });
};
