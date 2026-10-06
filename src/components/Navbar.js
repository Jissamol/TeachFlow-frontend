import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './Layout.css';

const Navbar = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) return;
    try {
      const res = await fetch('http://127.0.0.1:8000/api/pbas/notifications/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unread_count || 0);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  const markAsRead = async (id, actionUrl) => {
    const token = localStorage.getItem('access_token');
    try {
      await fetch(`http://127.0.0.1:8000/api/pbas/notifications/${id}/mark-read/`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchNotifications();
    } catch (err) {}
    if (actionUrl) {
      setShowDropdown(false);
      navigate(actionUrl);
    }
  };

  const markAllAsRead = async () => {
    const token = localStorage.getItem('access_token');
    try {
      await fetch('http://127.0.0.1:8000/api/pbas/notifications/mark-all-read/', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchNotifications();
    } catch (err) {}
  };

  const deleteNotification = async (e, id) => {
    e.stopPropagation();
    const token = localStorage.getItem('access_token');
    try {
      await fetch(`http://127.0.0.1:8000/api/pbas/notifications/${id}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchNotifications();
    } catch (err) {}
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    localStorage.removeItem('profile_picture');
    navigate('/');
  };

  return (
    <nav className="custom-navbar">
      <div className="navbar-left">
        <span className="navbar-title">Welcome to TeachFlow</span>
      </div>
      
      <div className="navbar-right">
        {/* Notification Bell Dropdown */}
        <div className="notif-wrapper" ref={dropdownRef} style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <button 
            className="notif-bell-btn" 
            onClick={() => setShowDropdown(!showDropdown)}
            title="Notifications"
            style={{
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: '50%',
              width: '42px',
              height: '42px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: '1.2rem',
              position: 'relative',
              transition: 'all 0.2s ease'
            }}
          >
            🔔
            {unreadCount > 0 && (
              <span className="notif-badge" style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                background: '#ef4444',
                color: 'white',
                fontSize: '0.7rem',
                fontWeight: 800,
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 6px rgba(239,68,68,0.4)'
              }}>
                {unreadCount}
              </span>
            )}
          </button>

          {showDropdown && (
            <div className="notif-dropdown" style={{
              position: 'absolute',
              top: '52px',
              right: 0,
              width: '360px',
              maxHeight: '480px',
              background: 'white',
              borderRadius: '16px',
              boxShadow: '0 15px 35px rgba(0,0,0,0.15)',
              border: '1px solid #e2e8f0',
              zIndex: 1000,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <div style={{
                padding: '16px 20px',
                borderBottom: '1px solid #f1f5f9',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: '#faf8f5'
              }}>
                <div style={{ fontWeight: 800, color: '#1a4d2e', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  🔔 Faculty Notifications
                </div>
                {unreadCount > 0 && (
                  <button 
                    onClick={markAllAsRead} 
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#166534',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      textDecoration: 'underline'
                    }}
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div style={{ overflowY: 'auto', flexGrow: 1, padding: '8px 0' }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: '30px 20px', textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>
                    🌱 No new notifications. You're all caught up!
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div 
                      key={n.id} 
                      onClick={() => markAsRead(n.id, n.action_url)}
                      style={{
                        padding: '14px 20px',
                        borderBottom: '1px solid #f8fafc',
                        background: n.is_read ? '#ffffff' : '#f0fdf4',
                        cursor: 'pointer',
                        transition: 'background 0.2s ease',
                        position: 'relative',
                        display: 'flex',
                        gap: '12px',
                        alignItems: 'flex-start'
                      }}
                    >
                      <span style={{ fontSize: '1.2rem', marginTop: '2px' }}>{n.icon || '🔔'}</span>
                      <div style={{ flexGrow: 1 }}>
                        <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#1e293b', marginBottom: '2px' }}>
                          {n.title}
                        </div>
                        <div style={{ fontSize: '0.82rem', color: '#475569', lineHeight: 1.4 }}>
                          {n.message}
                        </div>
                      </div>
                      <button 
                        onClick={(e) => deleteNotification(e, n.id)}
                        title="Dismiss"
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#94a3b8',
                          fontSize: '0.8rem',
                          cursor: 'pointer',
                          padding: '2px'
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  ))
                )}
              </div>

              <div style={{
                padding: '10px 20px',
                borderTop: '1px solid #f1f5f9',
                background: '#faf8f5',
                textAlign: 'center',
                fontSize: '0.78rem',
                color: '#64748b',
                fontWeight: 600
              }}>
                TeachFlow Faculty Appraisal System
              </div>
            </div>
          )}
        </div>

        <div className="navbar-profile">
          <span className="profile-icon">👤</span>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

