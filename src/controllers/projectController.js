import supabase from "../config/database.js";


// Ambil semua project

const getAllProjects = async (req, res) => {
  console.log("GET /api/projects hit");

  try {
    const { data, error } = await supabase.from("project").select("*").order("created_at", { ascending: false });

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


// Ambil project berdasarkan id

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


// Buat project baru

const createProject = async (req, res) => {
  console.log("POST /api/projects hit");
  const { name, description } = req.body;

  try {
    if (!name) {
      return res.status(400).json({ error: "Nama project wajib diisi" });
    }

    const { data, error } = await supabase
      .from("project")
      .insert([{ name, description, created_at: new Date().toISOString() }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      message: "Project created successfully",
      data,
    });
  } catch (err) {
    console.error("Supabase Error:", err.message);
    res.status(500).json({ error: "Gagal membuat project" });
  }
};


// Update project

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


// Hapus project

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

export { getAllProjects, getProjectById, createProject, updateProject, deleteProject };
