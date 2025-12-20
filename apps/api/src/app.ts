import express, { Express, Request, Response } from 'express';
import cors from 'cors';

const app: Express = express();

// Middleware
app.use(cors());
app.use(express.json()); // Agar bisa baca JSON dari body request

// Route Test (Health Check)
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    message: 'SummitGear API is running! 🚀',
    timestamp: new Date(),
  });
});

export default app;
