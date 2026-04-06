// src/services/projectService.js
import supabase from "../config/database.js";

// Ambil semua project di mana user jadi member
export const getAllProjects = async (clerkId) => {
  const { data, error } = await supabase
    .from("project_member")
    .select(`
      role,
      clerk_user_id,
      project:project_id (
        id,
        name,
        description,
        created_at
      )
    `)
    .eq("clerk_user_id", clerkId)
    .order("created_at", {
      referencedTable: "project",
      ascending: false,
    });

  if (error) throw new Error(error.message);

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

// Buat project baru → PM otomatis + default board & columns
export const createProject = async (name, description, clerkId) => {
  if (!name) throw new Error("Nama project wajib diisi");
  if (!clerkId) throw new Error("User belum terautentikasi");

  // Buat project
  const { data: project, error: projectError } = await supabase
    .from("project")
    .insert([{ name, description, created_at: new Date().toISOString() }])
    .select()
    .single();
  if (projectError) throw new Error(projectError.message);

  // Tambah PM ke project_member
  const { error: memberError } = await supabase.from("project_member").insert([
    {
      project_id: project.id,
      clerk_user_id: clerkId,
      role: "PM",
      joined_at: new Date().toISOString(),
    },
  ]);
  if (memberError) throw new Error(memberError.message);

  //  Buat default board
  const { data: board, error: boardError } = await supabase
    .from("boards")
    .insert([{ project_id: project.id, name: "Main Board", created_at: new Date().toISOString() }])
    .select()
    .single();
  if (boardError) throw new Error(boardError.message);

  //  Buat default columns: To Do, In Progress, Done
  const defaultColumns = ["To Do", "In Progress", "Done"];
  const { error: columnsError } = await supabase.from("columns").insert(
    defaultColumns.map((name) => ({
      boards_id: board.id,
      name,
      created_at: new Date().toISOString(),
    }))
  );
  if (columnsError) throw new Error(columnsError.message);

  return project;
};

// Update project → hanya PM
export const updateProject = async (id, name, description, clerkId) => {
  const { data: member, error: checkError } = await supabase
    .from("project_member")
    .select("role")
    .eq("project_id", id)
    .eq("clerk_user_id", clerkId)
    .single();

  if (checkError || !member) throw new Error("User tidak terdaftar di project ini");
  if (member.role !== "PM") throw new Error("Hanya PM yang boleh mengubah project ini");

  const { data, error } = await supabase
    .from("project")
    .update({ name, description })
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error("Gagal mengupdate project");

  return data;
};

// Hapus project → hanya PM
export const deleteProject = async (id, clerkId) => {
  const { data: member, error: checkError } = await supabase
    .from("project_member")
    .select("role")
    .eq("project_id", id)
    .eq("clerk_user_id", clerkId)
    .single();

  if (checkError || !member) throw new Error("User tidak terdaftar di project ini");
  if (member.role !== "PM") throw new Error("Hanya PM yang boleh menghapus project ini");

  const { error } = await supabase.from("project").delete().eq("id", id);
  if (error) throw new Error("Gagal menghapus project");

  return true;
};