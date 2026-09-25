import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Layout.css';

const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Teaching & Learning', path: '/pbas/teaching' },
    { name: 'Student Support', path: '/pbas/student-support' },
    { name: 'Research', path: '/pbas/research' },
    { name: 'Academic Contributions', path: '/pbas/academic' },
    { name: 'Institutional Responsibility', path: '/pbas/institutional' },
    { name: 'Reports', path: '/pbas/report' },
    { name: 'Profile', path: '/profile' },
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
              <span className="sidebar-text">{item.name}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;
