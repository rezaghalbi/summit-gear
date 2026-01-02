import { Router } from 'express';
import {
  createBooking,
  getMyBookings,
  getAllBookings,
  updateBookingStatus,
  getBookingById, // <--- Pastikan Controller ini di-import!
} from '../controllers/booking.controller';
import { verifyToken } from '../middlewares/auth.middleware';

const router = Router();

// --- Customer Routes ---
router.post('/', verifyToken, createBooking);
router.get('/my-bookings', verifyToken, getMyBookings);

// --- Admin Routes ---
router.get('/', verifyToken, getAllBookings); // List Semua
router.patch('/:id/status', verifyToken, updateBookingStatus); // Update Status

// --- ROUTE DETAIL (YANG HILANG TADI) ---
router.get('/:id', verifyToken, getBookingById); // <--- TAMBAHKAN INI ✅

export default router;
