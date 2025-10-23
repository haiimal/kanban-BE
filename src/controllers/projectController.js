import supabase from "../config/database.js";

const getAllProjects = async (req, res) => {
  console.log("GET /api/projects hit");
  try {
    const { data, error } = await supabase
      .from("project")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    res.json({
      message: "Success get all projects",
      data,
    });
  } catch (err) {
    console.error("Supabase Error:", err.message);
    res.status(500).json({ error: "Gagal mengambil data projects" });
  }
};

const getProjectById = async (req, res) => {
  console.log("GET /api/projects/:id hit");
  const { id } = req.params;

  try {
    const { data, error } = await supabase
      .from("project")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;

    res.json({
      message: `Success get project with id ${id}`,
      data,
    });
  } catch (err) {
    console.error("Supabase Error:", err.message);
    res.status(404).json({ error: "Project tidak ditemukan" });
  }
};

// buat project baru + otomatis tambah ke project_member
const createProject = async (req, res) => {
  console.log("POST /api/projects hit");

  const { name, description } = req.body;
  const clerkId = req.headers["x-clerk-id"]; //ambil dari header frontend

  try {
    if (!name) {
      return res.status(400).json({ error: "Nama project wajib diisi" });
    }
    if (!clerkId) {
      return res.status(400).json({ error: "Clerk ID tidak ditemukan di header" });
    }

    // Insert project ke table project
    const { data: project, error: projectError } = await supabase
      .from("project")
      .insert([{ name, description, created_at: new Date().toISOString() }])
      .select()
      .single();

    if (projectError) throw projectError;

    // Insert otomatis ke project_member sebagai admin
    const { error: memberError } = await supabase.from("project_member").insert([
      {
        project_id: project.id,
        clerk_user_id: clerkId,
        role: "admin",
        joined_at: new Date().toISOString(),
      },
    ]);

    if (memberError) throw memberError;

    res.status(201).json({
      message: "Project created successfully & added to project_member as admin",
      data: project,
    });
  } catch (err) {
    console.error("Supabase Error:", err.message);
    res.status(500).json({ error: "Gagal membuat project" });
  }
};

const updateProject = async (req, res) => {
  console.log("PUT /api/projects/:id hit");
  const { id } = req.params;
  const { name, description } = req.body;

  try {
    const { data, error } = await supabase
      .from("project")
      .update({ name, description })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    res.json({
      message: `Project ${id} updated successfully`,
      data,
    });
  } catch (err) {
    console.error("Supabase Error:", err.message);
    res.status(500).json({ error: "Gagal mengupdate project" });
  }
};

const deleteProject = async (req, res) => {
  console.log("DELETE /api/projects/:id hit");
  const { id } = req.params;

  try {
    const { error } = await supabase.from("project").delete().eq("id", id);
    if (error) throw error;

    res.json({ message: `Project ${id} deleted successfully` });
  } catch (err) {
    console.error("Supabase Error:", err.message);
    res.status(500).json({ error: "Gagal menghapus project" });
  }
};

export {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
};
