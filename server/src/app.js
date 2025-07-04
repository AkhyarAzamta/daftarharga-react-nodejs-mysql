import express from 'express';
import cors from 'cors';
import router from './routes/route.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// Middleware
app.use(
  cors({ origin: process.env.CORS_ORIGIN || '*', methods: ['GET', 'POST'] })
);
app.use(express.json());

// Routes
app.use('/api', router);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, error: 'Internal Server Error' });
});

export default app;