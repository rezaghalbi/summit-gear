import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.route';
import categoryRoutes from './routes/category.route';
import gearRoutes from './routes/gear.route';
import bookingRoutes from './routes/booking.route';
import userRouter from './routes/user.route';
import path from 'path';

const app: Express = express();

// Middleware
app.use(
  cors({
    origin: [
      'http://localhost:3000', // Izinkan localhost (untuk testing)
      'https://summit-gear.vercel.app', // Izinkan Domain Frontend Vercel Anda
      // Atau jika mau gampang (tapi kurang aman): origin: '*'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(express.json());

// static files
app.use('/images', express.static(path.join(__dirname, '../public/images')));

// Route Test (Health Check)
app.get('/', (req, res) => {
  res.send('SummitGear API Ready! 🚀');
});

app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/gears', gearRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/users', userRouter);

export default app;
