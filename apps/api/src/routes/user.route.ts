import { Router } from 'express';
import { getAllUsers, updateProfile } from '../controllers/user.controller';
import { verifyToken } from '../middlewares/auth.middleware';

const router = Router();

// Route Admin: Lihat semua user
router.get('/', verifyToken, getAllUsers);

// Route User: Edit Profil sendiri
router.patch('/profile', verifyToken, updateProfile);

export default router;
