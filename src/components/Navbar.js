import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Layout.css';

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <nav className="custom-navbar">
      <div className="navbar-left">
        {/* Placeholder for menu toggle if needed for mobile */}
        <span className="navbar-title">Welcome to TeachFlow</span>
      </div>
      <div className="navbar-right">
        <div className="navbar-profile">
          <span className="profile-icon">👤</span>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
