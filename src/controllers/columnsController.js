import * as columnsService from "../services/columnsService.js";

// GET all columns by boards_id
export const getColumnsByBoard = async (req, res) => {
  console.log("GET /api/columns/:boards_id hit");
  const { boards_id } = req.params;

  try {
    const data = await columnsService.getColumnsByBoard(boards_id);
    res.json({
      message: `Success get all columns for board ${boards_id}`,
      data,
    });
  } catch (err) {
    console.error("Supabase Error:", err.message);
    res.status(500).json({ error: "Gagal mengambil data columns" });
  }
};

// POST create column
export const createColumn = async (req, res) => {
  console.log("POST /api/columns hit");
  const { boards_id, name } = req.body;

  try {
    const data = await columnsService.createColumn(boards_id, name);
    res.status(201).json({
      message: "Column created successfully",
      data,
    });
  } catch (err) {
    console.error("Supabase Error:", err.message);
    res.status(400).json({ error: err.message });
  }
};

// PUT update column
export const updateColumn = async (req, res) => {
  console.log("PUT /api/columns/:id hit");
  const { id } = req.params;
  const { name } = req.body;

  try {
    const data = await columnsService.updateColumn(id, name);
    res.json({
      message: `Column ${id} updated successfully`,
      data,
    });
  } catch (err) {
    console.error("Supabase Error:", err.message);
    res.status(500).json({ error: "Gagal mengupdate column" });
  }
};

// DELETE column
export const deleteColumn = async (req, res) => {
  console.log("DELETE /api/columns/:id hit");
  const { id } = req.params;

  try {
    await columnsService.deleteColumn(id);
    res.json({ message: `Column ${id} deleted successfully` });
  } catch (err) {
    console.error("Supabase Error:", err.message);
    res.status(500).json({ error: "Gagal menghapus column" });
  }
};
