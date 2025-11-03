// src/services/projectService.js
import supabase from "../config/database.js";

// Ambil semua project di mana user jadi member / admin
export const getAllProjects = async (clerkId) => {
  const { data, error } = await supabase
    .from("project_member")
    .select(`
      project (
        id,
        name,
        description,
        created_at
      ),
      role,
      clerk_user_id
    `)
    .eq("clerk_user_id", clerkId)
    .order("project.created_at", { ascending: false });

  if (error) throw new Error(error.message);

  // Flatten hasil (karena Supabase nested)
  return data.map((row) => ({
    ...row.project,
    role: row.role,
  }));
};

// Ambil project by ID
export const getProjectById = async (id) => {
  const { data, error } = await supabase
    .from("project")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    const err = new Error("Project tidak ditemukan");
    err.statusCode = 404;
    throw err;
  }

  return data;
};

// Buat project baru 
export const createProject = async (name, description, clerkId) => {
  if (!name) {
    const err = new Error("Nama project wajib diisi");
    err.statusCode = 400;
    throw err;
  }

  if (!clerkId) {
    const err = new Error("User belum terautentikasi dengan Clerk");
    err.statusCode = 401;
    throw err;
  }

  // Insert project
  const { data: project, error: projectError } = await supabase
    .from("project")
    .insert([{ name, description, created_at: new Date().toISOString() }])
    .select()
    .single();

  if (projectError) throw new Error(projectError.message);

  // Tambah admin ke project_member
  const { error: memberError } = await supabase.from("project_member").insert([{
    project_id: project.id,
    clerk_user_id: clerkId,
    role: "admin",
    joined_at: new Date().toISOString(),
  }]);

  if (memberError) throw new Error(memberError.message);

  return project;
};

// Update project
export const updateProject = async (id, name, description) => {
  const { data, error } = await supabase
    .from("project")
    .update({ name, description })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    const err = new Error("Gagal mengupdate project");
    err.statusCode = 400;
    throw err;
  }

  return data;
};

// Hapus project
export const deleteProject = async (id) => {
  const { error } = await supabase.from("project").delete().eq("id", id);
  if (error) {
    const err = new Error("Gagal menghapus project");
    err.statusCode = 400;
    throw err;
  }
  return true;
};
