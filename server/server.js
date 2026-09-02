import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import connectDB from './config/db.js';
import errorHandler from './middleware/errorHandler.js';
import authRoutes from './routes/authRoutes.js';
import workerRoutes from './routes/workerRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import customerRoutes from './routes/customerRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import jwt from 'jsonwebtoken';
import User from './models/User.js';

dotenv.config();

const port = process.env.PORT || 5000;
const app = express();
const allowedOrigins = [
  process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
];

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: allowedOrigins,
  })
);

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'ODForce API is running' });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/worker', workerRoutes);
app.use('/api/upload', uploadRoutes);
// Future phases
app.use('/api/customers', customerRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', (req, res) => res.status(404).json({ message: 'Not implemented yet' }));
app.use('/api/wallet', (req, res) => res.status(404).json({ message: 'Not implemented yet' }));
app.use('/api/reviews', (req, res) => res.status(404).json({ message: 'Not implemented yet' }));

app.use(errorHandler);

const httpServer = createServer(app);

// Socket.io
const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
  },
});

app.set('io', io);

io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    const user = await User.findById(decoded.id).select('_id role isActive');
    if (!user || !user.isActive) return next(new Error('Not authorized'));
    socket.user = user;
    next();
  } catch {
    next(new Error('Not authorized'));
  }
});

io.on('connection', (socket) => {
  console.log('A user connected via WebSocket');

  socket.join(`user:${socket.user._id}`);

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

// Start server
if (process.env.MONGO_URI) {
  connectDB().then(() => {
    httpServer.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  });
} else {
  console.log('No MONGO_URI provided — running without DB');
  httpServer.listen(port, () => {
    console.log(`Server running on port ${port} (No DB)`);
  });
}
