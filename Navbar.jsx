import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import NotificationBell from './NotificationBell.jsx';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <header className="navbar">
      <Link to="/" className="navbar__brand">
        Connectly
      </Link>

      {user && (
        <nav className="navbar__actions">
          <NotificationBell />
          <Link to={`/profile/${user.username}`} className="navbar__profile-link">
            {user.name}
          </Link>
          <button type="button" onClick={logout} className="navbar__logout">
            Log out
          </button>
        </nav>
      )}
    </header>
  );
};

export default Navbar;
