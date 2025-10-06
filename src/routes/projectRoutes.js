// Import Router dari Express
import { Router } from 'express';

// Import controller functions
import {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject
} from '../controllers/projectController.js';

// Buat router baru
const router = Router();

// ===============================
// Routes CRUD projects
// ===============================

// Ambil semua projects
router.get('/', getAllProjects);

// Ambil project berdasarkan id
router.get('/:id', getProjectById);

// Buat project baru
router.post('/', createProject);

// Update project berdasarkan id
router.put('/:id', updateProject);

// Hapus project berdasarkan id
router.delete('/:id', deleteProject);

// Export router sebagai default
export default router;
