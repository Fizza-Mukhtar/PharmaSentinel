import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { logoutUser } from '../../services/api';
import './ManufacturerDashboard.css';

// Import all sub-components
import DashboardHome from './manufacturer/DashboardHome';
import CreateBatch from './manufacturer/CreateBatch';
import ViewBatches from './manufacturer/ViewBatches';
import TransferBatch from './manufacturer/TransferBatch';
import ViewTransfers from './manufacturer/ViewTransfers';
import Analytics from './manufacturer/Analytics';
import VerifyBlockchain from './manufacturer/VerifyBlockchain';
import Profile from './manufacturer/Profile';
import Settings from './manufacturer/Settings';

const ManufacturerDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('user'));

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logoutUser();
      navigate('/login');
    }
  };

  const menuItems = [
    { id: 'dashboard', icon: '📊', label: 'Dashboard' },
    { id: 'create', icon: '➕', label: 'Create Batch' },
    { id: 'batches', icon: '📦', label: 'View Batches' },
    { id: 'transfer', icon: '🔄', label: 'Transfer Batch' },
    { id: 'transfers', icon: '📋', label: 'View Transfers' },
    { id: 'analytics', icon: '📈', label: 'Analytics' },
    { id: 'verify', icon: '🔗', label: 'Verify Blockchain' },
    { id: 'profile', icon: '👤', label: 'Profile' },
    { id: 'settings', icon: '⚙️', label: 'Settings' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <DashboardHome />;
      case 'create': return <CreateBatch />;
      case 'batches': return <ViewBatches />;
      case 'transfer': return <TransferBatch />;
      case 'transfers': return <ViewTransfers />;
      case 'analytics': return <Analytics />;
      case 'verify': return <VerifyBlockchain />;
      case 'profile': return <Profile />;
      case 'settings': return <Settings />;
      default: return <DashboardHome />;
    }
  };

  return (
    <div className={`manufacturer-dashboard ${isDark ? 'dark' : 'light'}`}>
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <div className="logo">💊</div>
          {sidebarOpen && <h2>MediChain</h2>}
        </div>

        <nav className="sidebar-nav">
          {menuItems.map(item => (
            <button
              key={item.id}
              className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
              title={item.label}
            >
              <span className="nav-icon">{item.icon}</span>
              {sidebarOpen && <span className="nav-label">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="nav-item logout-btn" onClick={handleLogout} title="Logout">
            <span className="nav-icon">🚪</span>
            {sidebarOpen && <span className="nav-label">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="dashboard-main">
        {/* Top Bar */}
        <header className="top-bar">
          <button className="toggle-sidebar" onClick={() => setSidebarOpen(!sidebarOpen)}>
            ☰
          </button>
          
          <div className="top-bar-right">
            <button className="theme-toggle" onClick={toggleTheme}>
              {isDark ? '☀️' : '🌙'}
            </button>
            <div className="user-info">
              <span className="user-name">{user?.username || 'User'}</span>
              <span className="user-role">{user?.role || 'Manufacturer'}</span>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="content-area">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default ManufacturerDashboard;