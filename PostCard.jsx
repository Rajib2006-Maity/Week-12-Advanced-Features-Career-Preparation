import React, { useState } from 'react';
import api from '../api/api.js';
import { useAuth } from '../context/AuthContext.jsx';

const PostCard = ({ post }) => {
  const { user } = useAuth();
  const [likesCount, setLikesCount] = useState(post.likes?.length || 0);
  const [liked, setLiked] = useState(post.likes?.some((id) => id === user?.id));
  const [comments, setComments] = useState(post.comments || []);
  const [commentText, setCommentText] = useState('');

  const handleLike = async () => {
    // Optimistic update so the UI feels instant; rolled back on failure.
    const previousLiked = liked;
    const previousCount = likesCount;
    setLiked(!liked);
    setLikesCount(likesCount + (liked ? -1 : 1));

    try {
      const { data } = await api.put(`/posts/${post._id}/like`);
      setLiked(data.liked);
      setLikesCount(data.likesCount);
    } catch {
      setLiked(previousLiked);
      setLikesCount(previousCount);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    const { data } = await api.post(`/posts/${post._id}/comments`, { text: commentText });
    setComments(data.comments);
    setCommentText('');
  };

  return (
    <article className="post-card">
      <header className="post-card__header">
        <img
          src={post.author.avatarUrl || '/default-avatar.png'}
          alt={`${post.author.name}'s avatar`}
          className="post-card__avatar"
          loading="lazy"
        />
        <div>
          <p className="post-card__name">{post.author.name}</p>
          <p className="post-card__username">@{post.author.username}</p>
        </div>
      </header>

      {post.text && <p className="post-card__text">{post.text}</p>}

      {post.mediaType === 'image' && (
        <img src={post.mediaUrl} alt="Post attachment" className="post-card__media" loading="lazy" />
      )}
      {post.mediaType === 'video' && (
        <video src={post.mediaUrl} controls className="post-card__media" preload="metadata" />
      )}

      <div className="post-card__actions">
        <button type="button" onClick={handleLike} className={liked ? 'liked' : ''}>
          {liked ? '❤️' : '🤍'} {likesCount}
        </button>
        <span>{comments.length} comments</span>
      </div>

      <ul className="post-card__comments">
        {comments.map((c) => (
          <li key={c._id}>
            <strong>{c.author?.name}: </strong>
            {c.text}
          </li>
        ))}
      </ul>

      <form onSubmit={handleComment} className="post-card__comment-form">
        <input
          type="text"
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder="Write a comment…"
          maxLength={500}
        />
        <button type="submit">Post</button>
      </form>
    </article>
  );
};

export default PostCard;
