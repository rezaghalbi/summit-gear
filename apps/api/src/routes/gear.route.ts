import { Router } from 'express';
import {
  createGear,
  getAllGears,
  getGearById,
} from '../controllers/gear.controller';
import { verifyToken } from '../middlewares/auth.middleware';
import { uploader } from '../middlewares/multer';

const router = Router();

// Jalur PUBLIC (Tanpa Token)
router.get('/', getAllGears);
router.get('/:id', getGearById);

router.post('/', verifyToken, uploader.single('image'), createGear);

export default router;
