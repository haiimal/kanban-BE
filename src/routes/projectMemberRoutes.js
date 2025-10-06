// Import Router dari Express
import { Router } from 'express';

// Import controller functions
import {
  getAllMembers,
  addMember,
  removeMember
} from '../controllers/projectMemberController.js';

// Buat router baru
const router = Router();

// ===============================
// Routes CRUD project members
// ===============================

// Ambil semua members berdasarkan project_id
router.get('/:project_id', getAllMembers);

// Tambah member baru
router.post('/', addMember);

// Hapus member berdasarkan id
router.delete('/:id', removeMember);

// Export router sebagai default
export default router;
