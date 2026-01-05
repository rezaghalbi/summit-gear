import { Router } from 'express';
import {
  createCategory,
  getCategories,
  getCategoryById,
} from '../controllers/category.controller';
import { verifyToken } from '../middlewares/auth.middleware';

const router = Router();

// Urutan: URL -> Middleware (Opsional) -> Controller

// GET bisa diakses semua orang (tanpa verifyToken)
router.get('/', getCategories);
router.get('/:id', getCategoryById);

// POST hanya boleh User yang Login (pakai verifyToken)
// Nanti di real project, kita tambahkan pengecekan Role ADMIN di sini
router.post('/', verifyToken, createCategory);

export default router;
