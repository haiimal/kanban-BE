// controllers/boardsController.js

// Ambil semua board berdasarkan project_id
const getAllBoards = async (req, res) => {
  console.log("GET /api/boards/:project_id hit");
  const { project_id } = req.params;
  const boards = [
    { id: 1, project_id, name: "Board To Do" },
    { id: 2, project_id, name: "Board In Progress" },
  ];
  res.json({
    message: `Success get all boards for project ${project_id}`,
    data: boards,
  });
};

// Buat board baru
const createBoard = async (req, res) => {
  console.log("POST /api/boards hit");
  const { project_id, name } = req.body;
  res.status(201).json({
    message: "Board created (dummy)",
    data: { id: 100, project_id, name },
  });
};

// Hapus board berdasarkan id
const deleteBoard = async (req, res) => {
  console.log("DELETE /api/boards/:id hit");
  const { id } = req.params;
  res.json({
    message: `Board ${id} deleted (dummy)`,
  });
};

export { getAllBoards, createBoard, deleteBoard };
