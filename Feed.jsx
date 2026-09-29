import React, { useEffect, useState, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import api from '../api/api.js';
import PostCard from '../components/PostCard.jsx';
import UploadForm from '../components/UploadForm.jsx';

const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [media, setMedia] = useState(null);

  const loadPage = useCallback(async (pageNum) => {
    setLoading(true);
    const { data } = await api.get(`/posts?page=${pageNum}&limit=10`);
    setPosts((prev) => (pageNum === 1 ? data.posts : [...prev, ...data.posts]));
    setTotalPages(data.totalPages);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadPage(1);
  }, [loadPage]);

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!text.trim() && !media) return;

    const { data } = await api.post('/posts', {
      text,
      mediaUrl: media?.mediaUrl,
      mediaType: media?.mediaType,
      mediaPublicId: media?.mediaPublicId
    });

    setPosts((prev) => [data.post, ...prev]);
    setText('');
    setMedia(null);
  };

  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    loadPage(next);
  };

  return (
    <div className="feed-page">
      <Helmet>
        <title>Your feed — Connectly</title>
      </Helmet>

      <form onSubmit={handleCreatePost} className="post-composer">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="What's on your mind?"
          maxLength={2000}
        />
        <UploadForm onUploaded={setMedia} />
        <button type="submit">Post</button>
      </form>

      <div className="post-list">
        {posts.map((post) => (
          <PostCard key={post._id} post={post} />
        ))}
      </div>

      {loading && <p className="feed-page__loading">Loading posts…</p>}
      {!loading && page < totalPages && (
        <button type="button" onClick={loadMore} className="feed-page__load-more">
          Load more
        </button>
      )}
    </div>
  );
};

export default Feed;
