// controllers/projectController.js

// Ambil semua project
const getAllProjects = async (req, res) => {
  console.log("GET /api/projects hit");
  const projects = [
    { id: 1, name: "Project Alpha", description: "Test project 1" },
    { id: 2, name: "Project Beta", description: "Test project 2" },
  ];
  res.json({ message: "Success get all projects", data: projects });
};

// Ambil project berdasarkan id
const getProjectById = async (req, res) => {
  console.log("GET /api/projects/:id hit");
  const { id } = req.params;
  const project = { id, name: "Project Alpha", description: "Example project" };
  res.json({ message: `Success get project with id ${id}`, data: project });
};

// Buat project baru
const createProject = async (req, res) => {
  console.log("POST /api/projects hit");
  const { name, description } = req.body;
  res.status(201).json({
    message: "Project created (dummy)",
    data: { id: 999, name, description },
  });
};

// Update project
const updateProject = async (req, res) => {
  console.log("PUT /api/projects/:id hit");
  const { id } = req.params;
  const { name, description } = req.body;
  res.json({
    message: `Project ${id} updated (dummy)`,
    data: { id, name, description },
  });
};

// Hapus project
const deleteProject = async (req, res) => {
  console.log("DELETE /api/projects/:id hit");
  const { id } = req.params;
  res.json({ message: `Project ${id} deleted (dummy)` });
};

export { getAllProjects, getProjectById, createProject, updateProject, deleteProject };
