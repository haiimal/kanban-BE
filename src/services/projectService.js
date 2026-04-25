// src/services/projectService.js
import supabase from "../config/database.js";

// =============================
// GET ALL PROJECTS (by user)
// =============================
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
        deadline,
        created_at
      )
    `)
    .eq("clerk_user_id", clerkId)
    .order("created_at", { referencedTable: "project", ascending: false });

  if (error) throw new Error(error.message);
  return data.map((row) => ({ ...row.project, role: row.role }));
};

// =============================
// GET PROJECT BY ID
// =============================
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

// =============================
// CREATE PROJECT (otomatis jadi PM + default board & columns)
// =============================
export const createProject = async (name, description, deadline, clerkId) => {
  if (!name) throw new Error("Nama project wajib diisi");
  if (!clerkId) throw new Error("User belum terautentikasi");

  // Buat project
  const { data: project, error: projectError } = await supabase
    .from("project")
    .insert([{ name, description, deadline: deadline || null, created_at: new Date().toISOString() }])
    .select()
    .single();
  if (projectError) throw new Error(projectError.message);

  // Tambah pembuat sebagai PM
  const { error: memberError } = await supabase.from("project_member").insert([{
    project_id: project.id,
    clerk_user_id: clerkId,
    role: "PM",
    joined_at: new Date().toISOString(),
  }]);
  if (memberError) throw new Error(memberError.message);

  // Buat default board
  const { data: board, error: boardError } = await supabase
    .from("boards")
    .insert([{ project_id: project.id, name: "Main Board", created_at: new Date().toISOString() }])
    .select()
    .single();
  if (boardError) throw new Error(boardError.message);

  // Buat default columns dengan type
  const defaultColumns = [
    { name: "To Do", type: "todo" },
    { name: "In Progress", type: "in_progress" },
    { name: "Done", type: "done" },
  ];
  const { error: columnsError } = await supabase.from("columns").insert(
    defaultColumns.map((col) => ({
      boards_id: board.id,
      name: col.name,
      type: col.type,
      created_at: new Date().toISOString(),
    }))
  );
  if (columnsError) throw new Error(columnsError.message);

  return project;
};

// =============================
// UPDATE PROJECT (PM only)
// =============================
export const updateProject = async (id, name, description, deadline, clerkId) => {
  // Cek role user di project ini
  const { data: member, error: checkError } = await supabase
    .from("project_member")
    .select("role")
    .eq("project_id", id)
    .eq("clerk_user_id", clerkId)
    .single();

  if (checkError || !member) throw new Error("User tidak terdaftar di project ini");
  if (member.role !== "PM") throw new Error("Hanya PM yang boleh mengubah project ini");

  // Hanya update field yang dikirim
  const updateFields = {};
  if (name !== undefined) updateFields.name = name;
  if (description !== undefined) updateFields.description = description;
  if (deadline !== undefined) updateFields.deadline = deadline;

  const { data, error } = await supabase
    .from("project")
    .update(updateFields)
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error("Gagal mengupdate project");
  return data;
};

// =============================
// DELETE PROJECT (PM only)
// =============================
export const deleteProject = async (id, clerkId) => {
  // Cek role user di project ini
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