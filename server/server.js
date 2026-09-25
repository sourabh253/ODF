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
import catalogRoutes from './routes/catalogRoutes.js';
import walletRoutes from './routes/walletRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import jwt from 'jsonwebtoken';
import User from './models/User.js';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';

dotenv.config();

const port = process.env.PORT || 5000;
const app = express();
const allowedOrigins = [
  process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  // Vite falls back to 5174 when 5173 is already taken (a second `npm run dev`)
  'http://localhost:5174',
  'http://127.0.0.1:5174',
];

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: allowedOrigins,
  })
);

// Security: sanitize NoSQL injection attempts
app.use(mongoSanitize());

// Security: rate limit auth routes to prevent brute-force
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: { message: 'Too many attempts, please try again after 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'ODForce API is running' });
});

// API routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/worker', workerRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/catalog', catalogRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);

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

      // Auto-expire pending bookings every 60 seconds
      // Uses targeted updateMany to avoid full-document schema validation on stale pre-pivot data.
      // This is a periodic sweep (not per-booking timers) so it survives server restarts.
      setInterval(async () => {
        try {
          const Booking = (await import('./models/Booking.js')).default;
          const Worker = (await import('./models/Worker.js')).default;
          const Notification = (await import('./models/Notification.js')).default;
          const io = app.get('io');

          const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

          // Step 1: Find matching bookings (lean query — just IDs and needed fields, no full doc hydration)
          const expiredBookings = await Booking.find({
            status: 'pending',
            createdAt: { $lt: fiveMinutesAgo },
            autoExpired: { $ne: true },
          }).select('_id customerId workerId').lean();

          if (expiredBookings.length === 0) return;

          // Step 2: Bulk update — skip validation since we're only touching status/autoExpired/expiredAt
          await Booking.updateMany(
            { _id: { $in: expiredBookings.map(b => b._id) } },
            { $set: { status: 'rejected', autoExpired: true, expiredAt: new Date() } },
            { runValidators: false }
          );

          // Step 3: Emit events and create notifications for each expired booking
          for (const booking of expiredBookings) {
            if (io) {
              io.to(`user:${booking.customerId}`).emit('booking_rejected', {
                bookingId: booking._id,
                status: 'rejected',
                autoExpired: true,
              });
            }

            await Notification.create({
              userId: booking.customerId,
              type: 'booking_auto_expired',
              title: 'Booking Request Expired',
              message: 'Your booking request expired because the worker did not respond within 5 minutes.',
              bookingId: booking._id,
            });

            const workerForNotif = await Worker.findById(booking.workerId).select('userId').populate('userId', '_id');
            if (workerForNotif?.userId) {
              await Notification.create({
                userId: workerForNotif.userId._id,
                type: 'booking_auto_expired',
                title: 'Booking Request Expired',
                message: 'A booking request expired because it was not responded to within 5 minutes.',
                bookingId: booking._id,
              });
            }
          }

          console.log(`Auto-expire sweep: ${expiredBookings.length} booking(s) expired`);
        } catch (err) {
          console.error('Auto-expire sweep error:', err.message);
        }
      }, 60 * 1000); // every 60 seconds
    });
  });
} else {
  console.log('No MONGO_URI provided — running without DB');
  httpServer.listen(port, () => {
    console.log(`Server running on port ${port} (No DB)`);
  });
}
