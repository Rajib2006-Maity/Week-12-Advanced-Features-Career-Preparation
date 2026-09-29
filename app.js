const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');

const { applySecurityMiddleware } = require('./middleware/security');
const { errorHandler, notFound } = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const messageRoutes = require('./routes/messageRoutes');
const userRoutes = require('./routes/userRoutes');

// Builds and returns a configured Express app. Accepts the Socket.io instance
// so controllers can emit real-time events via req.io without a circular import.
const createApp = (io) => {
  const app = express();

  app.use(
    cors({
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      credentials: true
    })
  );

  applySecurityMiddleware(app);

  app.use(express.json({ limit: '10kb' })); // small limit mitigates JSON body DoS
  app.use(cookieParser());

  if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('dev'));
  }

  // Makes the Socket.io instance available to every controller as req.io
  app.use((req, res, next) => {
    req.io = io;
    next();
  });

  app.get('/api/health', (req, res) => res.status(200).json({ success: true, status: 'ok' }));

  app.use('/api/auth', authRoutes);
  app.use('/api/posts', postRoutes);
  app.use('/api/upload', uploadRoutes);
  app.use('/api/messages', messageRoutes);
  app.use('/api/users', userRoutes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
};

module.exports = createApp;
