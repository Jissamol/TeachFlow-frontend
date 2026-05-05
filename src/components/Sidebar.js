import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Layout.css';

const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: '📊' },
    { name: 'Teaching & Learning', path: '/pbas/teaching', icon: '📚' },
    { name: 'Student Support', path: '/pbas/student-support', icon: '🎓' },
    { name: 'Research', path: '/pbas/research', icon: '🔬' },
    { name: 'Academic Contributions', path: '/pbas/academic', icon: '🏆' },
    { name: 'Institutional Responsibility', path: '/pbas/institutional', icon: '🏛️' },
    { name: 'Reports', path: '/pbas/report', icon: '📄' },
    { name: 'Profile', path: '/profile', icon: '👤' },
  ];

  return (
    <div className="custom-sidebar">
      <div className="sidebar-header">
        <h2 className="sidebar-brand">TeachFlow</h2>
      </div>
      <ul className="sidebar-nav">
        {menuItems.map((item, index) => (
          <li key={index} className={`sidebar-item ${location.pathname === item.path ? 'active' : ''}`}>
            <Link to={item.path} className="sidebar-link">
              <span className="sidebar-icon">{item.icon}</span>
              <span className="sidebar-text">{item.name}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;
