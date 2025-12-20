import { Router } from 'express';
import { register } from '../controllers/auth.controller';

const router = Router();

// Metode POST karena kita mengirim data rahasia
router.post('/register', register);

export default router;
