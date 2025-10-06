// Import Router dari Express
import { Router } from 'express';

// Import controller functions
import {
  getAllBoards,
  createBoard,
  deleteBoard
} from '../controllers/boardsController.js';

// Buat router baru
const router = Router();

// ===============================
// Routes boards
// ===============================

// Ambil semua boards berdasarkan project_id
router.get('/:project_id', getAllBoards);

// Buat board baru
router.post('/', createBoard);

// Hapus board berdasarkan id
router.delete('/:id', deleteBoard);

// Export router sebagai default
export default router;
