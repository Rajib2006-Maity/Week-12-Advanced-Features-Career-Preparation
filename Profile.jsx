import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import api from '../api/api.js';
import { useAuth } from '../context/AuthContext.jsx';

const Profile = () => {
  const { username } = useParams();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data } = await api.get(`/users/${username}`);
      setProfile(data.user);
      setIsFollowing(data.user.followers.some((id) => id === currentUser?.id));
    };
    load();
  }, [username, currentUser]);

  const handleFollow = async () => {
    const { data } = await api.put(`/users/${profile._id}/follow`);
    setIsFollowing(data.following);
  };

  if (!profile) return <p>Loading profile…</p>;

  const isOwnProfile = currentUser?.username === profile.username;

  return (
    <div className="profile-page">
      <Helmet>
        <title>{profile.name} (@{profile.username}) — Connectly</title>
      </Helmet>

      <img src={profile.avatarUrl || '/default-avatar.png'} alt={profile.name} className="profile-page__avatar" />
      <h1>{profile.name}</h1>
      <p>@{profile.username}</p>
      {profile.bio && <p className="profile-page__bio">{profile.bio}</p>}

      <div className="profile-page__stats">
        <span>{profile.followers.length} followers</span>
        <span>{profile.following.length} following</span>
      </div>

      {!isOwnProfile && (
        <button type="button" onClick={handleFollow}>
          {isFollowing ? 'Unfollow' : 'Follow'}
        </button>
      )}

      {!isOwnProfile && (
        <Link to={`/chat/${profile._id}`} className="profile-page__message-link">
          Message
        </Link>
      )}
    </div>
  );
};

export default Profile;
