const User = require('../models/User');
const Notification = require('../models/Notification');

// GET /api/users/:username
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findOne({ username: req.params.username }).select(
      'name username avatarUrl bio followers following createdAt'
    );
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.status(200).json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

// PUT /api/users/:id/follow
exports.toggleFollow = async (req, res, next) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: "You can't follow yourself" });
    }

    const target = await User.findById(req.params.id);
    if (!target) return res.status(404).json({ success: false, message: 'User not found' });

    const isFollowing = target.followers.some((id) => id.toString() === req.user._id.toString());

    if (isFollowing) {
      target.followers = target.followers.filter((id) => id.toString() !== req.user._id.toString());
      req.user.following = req.user.following.filter((id) => id.toString() !== target._id.toString());
    } else {
      target.followers.push(req.user._id);
      req.user.following.push(target._id);

      const notification = await Notification.create({
        recipient: target._id,
        sender: req.user._id,
        type: 'follow',
        text: `${req.user.name} started following you`
      });
      req.io.to(`user-${target._id}`).emit('notification', notification);
    }

    await Promise.all([target.save(), req.user.save()]);
    res.status(200).json({ success: true, following: !isFollowing });
  } catch (err) {
    next(err);
  }
};
