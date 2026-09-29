const Message = require('../models/Message');

// Builds a stable, order-independent chat room id from two user ids.
const buildChatId = (a, b) => [a, b].sort().join('_');

// GET /api/messages/:otherUserId - chat history between the logged-in user and another user
exports.getHistory = async (req, res, next) => {
  try {
    const chatId = buildChatId(req.user._id.toString(), req.params.otherUserId);
    const messages = await Message.find({ chatId }).sort({ createdAt: 1 }).limit(200);
    res.status(200).json({ success: true, chatId, messages });
  } catch (err) {
    next(err);
  }
};

exports.buildChatId = buildChatId;
