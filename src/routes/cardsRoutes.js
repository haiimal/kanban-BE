// Import Router dari Express
import { Router } from 'express';

// Import controller functions
import {
  getAllCards,
  createCard,
  deleteCard
} from '../controllers/cardsController.js';

// Buat router baru
const router = Router();

// ===============================
// Routes cards
// ===============================

// Ambil semua cards berdasarkan columns_id
router.get('/:columns_id', getAllCards);

// Buat card baru
router.post('/', createCard);

// Hapus card berdasarkan id
router.delete('/:id', deleteCard);

// Export router sebagai default
export default router;
