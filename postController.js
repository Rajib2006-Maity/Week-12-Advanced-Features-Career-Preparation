const Post = require('../models/Post');
const Notification = require('../models/Notification');

// GET /api/posts?page=1&limit=10  - paginated feed, newest first
exports.getFeed = async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit, 10) || 10, 50);
    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      Post.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('author', 'name username avatarUrl')
        .populate('comments.author', 'name username avatarUrl')
        .lean(),
      Post.countDocuments()
    ]);

    res.status(200).json({
      success: true,
      page,
      totalPages: Math.ceil(total / limit),
      totalPosts: total,
      posts
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/posts
exports.createPost = async (req, res, next) => {
  try {
    const { text, mediaUrl, mediaType, mediaPublicId } = req.body;

    if (!text && !mediaUrl) {
      return res.status(400).json({ success: false, message: 'Post must have text or media' });
    }

    const post = await Post.create({
      author: req.user._id,
      text,
      mediaUrl,
      mediaType: mediaType || 'none',
      mediaPublicId
    });

    const populated = await post.populate('author', 'name username avatarUrl');
    res.status(201).json({ success: true, post: populated });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/posts/:id
exports.deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this post' });
    }

    await post.deleteOne();
    res.status(200).json({ success: true, message: 'Post deleted' });
  } catch (err) {
    next(err);
  }
};

// PUT /api/posts/:id/like  - toggles like, emits realtime notification via req.io
exports.toggleLike = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    const userId = req.user._id.toString();
    const alreadyLiked = post.likes.some((id) => id.toString() === userId);

    if (alreadyLiked) {
      post.likes = post.likes.filter((id) => id.toString() !== userId);
    } else {
      post.likes.push(req.user._id);

      if (post.author.toString() !== userId) {
        const notification = await Notification.create({
          recipient: post.author,
          sender: req.user._id,
          type: 'like',
          post: post._id,
          text: `${req.user.name} liked your post`
        });
        req.io.to(`user-${post.author}`).emit('notification', notification);
      }
    }

    await post.save();
    res.status(200).json({ success: true, likesCount: post.likes.length, liked: !alreadyLiked });
  } catch (err) {
    next(err);
  }
};

// POST /api/posts/:id/comments
exports.addComment = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    const comment = { author: req.user._id, text: req.body.text, createdAt: new Date() };
    post.comments.push(comment);
    await post.save();

    if (post.author.toString() !== req.user._id.toString()) {
      const notification = await Notification.create({
        recipient: post.author,
        sender: req.user._id,
        type: 'comment',
        post: post._id,
        text: `${req.user.name} commented on your post`
      });
      req.io.to(`user-${post.author}`).emit('notification', notification);
    }

    const populated = await post.populate('comments.author', 'name username avatarUrl');
    res.status(201).json({ success: true, comments: populated.comments });
  } catch (err) {
    next(err);
  }
};
