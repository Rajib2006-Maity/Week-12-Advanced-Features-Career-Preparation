const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Message = require('../models/Message');
const Notification = require('../models/Notification');
const { buildChatId } = require('../controllers/messageController');

// Verifies the JWT passed in the Socket.io handshake before allowing a connection.
// Without this, anyone could connect and join arbitrary user/chat rooms.
const socketAuthMiddleware = async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Authentication required'));

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return next(new Error('User not found'));

    socket.user = user;
    next();
  } catch (err) {
    next(new Error('Invalid or expired token'));
  }
};

const registerSocketHandlers = (io) => {
  io.use(socketAuthMiddleware);

  io.on('connection', (socket) => {
    const userId = socket.user._id.toString();
    console.log(`Socket connected: ${socket.id} (user ${userId})`);

    // Every authenticated user automatically joins their personal room,
    // which is how we push notifications to them from anywhere in the app.
    socket.join(`user-${userId}`);

    socket.on('join-chat', (otherUserId) => {
      const chatId = buildChatId(userId, otherUserId);
      socket.join(`chat-${chatId}`);
    });

    socket.on('send-message', async ({ receiverId, content }) => {
      try {
        if (!content || !content.trim()) return;

        const chatId = buildChatId(userId, receiverId);
        const message = await Message.create({
          chatId,
          sender: userId,
          receiver: receiverId,
          content: content.trim()
        });

        io.to(`chat-${chatId}`).emit('new-message', message);

        const notification = await Notification.create({
          recipient: receiverId,
          sender: userId,
          type: 'message',
          text: `${socket.user.name} sent you a message`
        });
        io.to(`user-${receiverId}`).emit('notification', notification);
      } catch (err) {
        socket.emit('error-message', 'Failed to send message');
      }
    });

    socket.on('typing', ({ receiverId, isTyping }) => {
      const chatId = buildChatId(userId, receiverId);
      socket.to(`chat-${chatId}`).emit('user-typing', { userId, isTyping });
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id} (user ${userId})`);
    });
  });
};

module.exports = registerSocketHandlers;
