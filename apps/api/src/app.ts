import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.route';

const app: Express = express();

// Middleware
app.use(cors());
app.use(express.json());

// Route Test (Health Check)
app.get('/', (req, res) => {
  res.send('SummitGear API Ready! 🚀');
});

app.use('/api/auth', authRoutes);


export default app;
