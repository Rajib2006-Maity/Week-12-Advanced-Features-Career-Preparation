import React, { useState } from 'react';
import { useSocket } from '../hooks/useSocket.js';

const NotificationBell = () => {
  const { notifications, setNotifications } = useSocket();
  const [open, setOpen] = useState(false);
  const unreadCount = notifications.length;

  return (
    <div className="notification-bell">
      <button
        type="button"
        aria-label="Notifications"
        onClick={() => setOpen((prev) => !prev)}
        className="notification-bell__toggle"
      >
        🔔 {unreadCount > 0 && <span className="notification-bell__badge">{unreadCount}</span>}
      </button>

      {open && (
        <div className="notification-bell__dropdown">
          {notifications.length === 0 && <p className="notification-bell__empty">No notifications yet</p>}
          {notifications.map((n) => (
            <div key={n._id || `${n.type}-${n.createdAt}`} className="notification-bell__item">
              {n.text}
            </div>
          ))}
          {notifications.length > 0 && (
            <button type="button" className="notification-bell__clear" onClick={() => setNotifications([])}>
              Clear all
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
