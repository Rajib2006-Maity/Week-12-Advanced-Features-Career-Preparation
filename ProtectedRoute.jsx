import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

// Redirects to /login if there's no authenticated user; shows nothing
// while the initial /auth/me check is still in flight to avoid a flash.
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

export default ProtectedRoute;
