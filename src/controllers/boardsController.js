import supabase from "../config/database.js";

// Ambil semua board berdasarkan project_id
const getBoardsByProject = async (req, res) => {
  console.log("GET /api/boards/:project_id hit");
  const { project_id } = req.params;

  try {
    const { data, error } = await supabase
      .from("boards")
      .select("*")
      .eq("project_id", project_id)
      .order("created_at", { ascending: true });

    if (error) throw error;

    res.json({
      message: `Success get all boards for project ${project_id}`,
      data,
    });
  } catch (err) {
    console.error("Supabase Error:", err.message);
    res.status(500).json({ error: "Gagal mengambil data boards" });
  }
};

// Tambah board baru di project tertentu
const createBoard = async (req, res) => {
  console.log("POST /api/boards hit");
  const { project_id, name } = req.body;

  try {
    if (!project_id || !name) {
      return res.status(400).json({ error: "project_id dan name wajib diisi" });
    }

    const { data, error } = await supabase
      .from("boards")
      .insert([
        {
          project_id,
          name,
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      message: "Board created successfully",
      data,
    });
  } catch (err) {
    console.error("Supabase Error:", err.message);
    res.status(500).json({ error: "Gagal membuat board" });
  }
};

// Edit nama board
const updateBoard = async (req, res) => {
  console.log("PUT /api/boards/:id hit");
  const { id } = req.params;
  const { name } = req.body;

  try {
    const { data, error } = await supabase
      .from("boards")
      .update({ name })
      .eq("id", id)
      .select();

    if (error) throw error;

    if (!data || data.length === 0) {
      return res.status(404).json({ error: "Board tidak ditemukan" });
    }

    res.json({
      message: `Board ${id} updated successfully`,
      data: data[0],
    });
  } catch (err) {
    console.error("Supabase Error:", err.message);
    res.status(500).json({ error: "Gagal mengupdate board" });
  }
};

// Hapus board berdasarkan id
const deleteBoard = async (req, res) => {
  console.log("DELETE /api/boards/:id hit");
  const { id } = req.params;

  try {
    const { error } = await supabase.from("boards").delete().eq("id", id);
    if (error) throw error;

    res.json({ message: `Board ${id} deleted successfully` });
  } catch (err) {
    console.error("Supabase Error:", err.message);
    res.status(500).json({ error: "Gagal menghapus board" });
  }
};

export { getBoardsByProject, createBoard, updateBoard, deleteBoard };
