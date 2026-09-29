require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');

const connectDB = require('./config/db');
const createApp = require('./app');
const registerSocketHandlers = require('./sockets/socketHandler');

const PORT = process.env.PORT || 5000;

const server = http.createServer();
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
  }
});

const app = createApp(io);
server.on('request', app);

registerSocketHandlers(io);

const start = async () => {
  await connectDB();
  server.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
};

start();

// Prevent the process from crashing silently on unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err.message);
  server.close(() => process.exit(1));
});

module.exports = server;
