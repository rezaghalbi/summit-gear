import { Router } from 'express';
import {
  createGear,
  getAllGears,
  getGearById,
  updateGear,
  deleteGear,
} from '../controllers/gear.controller';
import { verifyToken } from '../middlewares/auth.middleware';
import { uploader } from '../middlewares/multer';

const router = Router();

// Jalur PUBLIC (Tanpa Token)
router.get('/', getAllGears);
router.get('/:id', getGearById);

// jalur admin (Dengan Token)
router.post('/', verifyToken, uploader.single('image'), createGear);
router.patch('/:id', verifyToken, updateGear);
router.delete('/:id', verifyToken, deleteGear);

export default router;
