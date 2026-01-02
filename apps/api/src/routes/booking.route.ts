import { Router } from 'express';
import {
  createBooking,
  getMyBookings,
  getAllBookings,
  updateBookingStatus,
  getBookingById,
} from '../controllers/booking.controller';
import { verifyToken } from '../middlewares/auth.middleware';

const router = Router();

// --- Customer Routes ---
router.post('/', verifyToken, createBooking);
router.get('/my-bookings', verifyToken, getMyBookings);

// --- Admin Routes ---
router.get('/', verifyToken, getAllBookings);
router.patch('/:id/status', verifyToken, updateBookingStatus);
router.get('/:id', verifyToken, getBookingById);

export default router;
