import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import { connectDB } from './config/db';

import http from 'http';
import { Server } from 'socket.io';
import Message from './models/Message';

import authRoutes from './routes/authRoutes';
import complaintRoutes from './routes/complaintRoutes';
import communityRoutes from './routes/communityRoutes';
import adminRoutes from './routes/adminRoutes';
import User from './models/User';
import Complaint from './models/Complaint';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/admin', adminRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'active', message: 'CitySync Routing API Nominal' });
});

// Public stats endpoint — no auth required (used on landing page)
app.get('/api/stats', async (_req, res) => {
  try {
    const [totalComplaints, resolvedComplaints, totalAdmins] = await Promise.all([
      Complaint.countDocuments(),
      Complaint.countDocuments({ status: 'Resolved' }),
      User.countDocuments({ role: 'admin' }),
    ]);
    res.json({ totalComplaints, resolvedComplaints, totalAdmins });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch stats' });
  }
});

connectDB();

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

// Track users linked to regions
const connectedUsers = new Map<string, { city: string; userName: string }>();

const emitActiveUsers = (city: string) => {
  const usersInCity = Array.from(connectedUsers.values())
    .filter((u) => u.city === city)
    .map((u) => u.userName);
  
  // Deduplicate and send
  io.to(city).emit('activeUsers', Array.from(new Set(usersInCity)));
};

io.on('connection', (socket) => {
  socket.on('joinCity', (payload: { city: string; userName: string }) => {
    socket.join(payload.city);
    connectedUsers.set(socket.id, { city: payload.city, userName: payload.userName });
    emitActiveUsers(payload.city);
  });

  socket.on('sendMessage', async (data: { text: string; userId: string; authorName: string; city: string }) => {
    try {
      const user = await User.findById(data.userId);
      const msg = await Message.create({
        text: data.text,
        user: data.userId,
        authorName: data.authorName,
        city: data.city
      });

      // Broadcast with authority flag if user is an admin
      const payload = {
        ...msg.toObject(),
        isAuthority: user?.role === 'admin'
      };

      io.to(data.city).emit('newMessage', payload);
    } catch (err) {
      console.error('Grid payload persist error', err);
    }
  });

  socket.on('disconnect', () => {
    const user = connectedUsers.get(socket.id);
    if (user) {
      connectedUsers.delete(socket.id);
      emitActiveUsers(user.city);
    }
  });
});

server.listen(PORT, () => {
  console.log(`CitySync Intelligence Unit active on port ${PORT}`);
});
