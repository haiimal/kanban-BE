// Import Router dari Express
import { Router } from 'express';

// Import controller functions
import {
  getAllColumns,
  createColumn,
  deleteColumn
} from '../controllers/columnsController.js';

// Buat router baru
const router = Router();

// ===============================
// Routes columns
// ===============================

// Ambil semua columns berdasarkan boards_id
router.get('/:boards_id', getAllColumns);

// Buat column baru
router.post('/', createColumn);

// Hapus column berdasarkan id
router.delete('/:id', deleteColumn);

// Export router sebagai default
export default router;
