// controllers/columnsController.js

// Ambil semua column berdasarkan boards_id
const getAllColumns = async (req, res) => {
  console.log("GET /api/columns/:boards_id hit");
  const { boards_id } = req.params;
  const columns = [
    { id: 1, boards_id, name: "To Do" },
    { id: 2, boards_id, name: "In Progress" },
    { id: 3, boards_id, name: "Done" },
  ];
  res.json({
    message: `Success get all columns for board ${boards_id}`,
    data: columns,
  });
};

// Buat column baru
const createColumn = async (req, res) => {
  console.log("POST /api/columns hit");
  const { boards_id, name } = req.body;
  res.status(201).json({
    message: "Column created (dummy)",
    data: { id: 500, boards_id, name },
  });
};

// Hapus column berdasarkan id
const deleteColumn = async (req, res) => {
  console.log("DELETE /api/columns/:id hit");
  const { id } = req.params;
  res.json({
    message: `Column ${id} deleted (dummy)`,
  });
};

export { getAllColumns, createColumn, deleteColumn };
