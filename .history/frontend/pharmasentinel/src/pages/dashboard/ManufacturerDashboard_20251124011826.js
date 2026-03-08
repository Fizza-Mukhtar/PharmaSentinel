// src/pages/dashboard/manufacturer/ManufacturerDashboard.js
import React from "react";
import { Outlet, Link, NavLink } from "react-router-dom";
import { Container, Button } from "react-bootstrap";
import LogoutButton from "../../components/LogoutButton";
import "./dashboard.css"; // custom CSS for sidebar & glass cards

export default function ManufacturerDashboard() {
  const username = JSON.parse(localStorage.getItem("user"))?.username;

  return (
    <div className="dashboard-wrapper d-flex">
      {/* Sidebar */}
      <nav className="sidebar bg-dark text-white">
        <div className="sidebar-header p-3">
          <h5>Manufacturer</h5>
          <p>{username}</p>
        </div>
        <ul className="list-unstyled ps-0">
          <li><NavLink to="create" className="sidebar-link">Create Batch</NavLink></li>
          <li><NavLink to="view" className="sidebar-link">View Batches</NavLink></li>
          <li><NavLink to="transfer" className="sidebar-link">Transfer Batch</NavLink></li>
          <li><NavLink to="transfers" className="sidebar-link">View Transfers</NavLink></li>
          <li><NavLink to="verify" className="sidebar-link">Verify Blockchain</NavLink></li>
          <li><NavLink to="analytics" className="sidebar-link">Analytics</NavLink></li>
          <li><NavLink to="profile" className="sidebar-link">Profile</NavLink></li>
          <li><LogoutButton className="btn btn-sm btn-outline-light m-3" /></li>
        </ul>
      </nav>

      {/* Main content */}
      <div className="main-content p-4 flex-fill">
        <Outlet />
      </div>
    </div>
  );
}
CSS (dashboard.css)

css
Copy code
.dashboard-wrapper {
  height: 100vh;
  overflow: hidden;
}

.sidebar {
  width: 220px;
  min-width: 220px;
  background-color: #0d1117;
  color: white;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.sidebar-link {
  display: block;
  padding: 10px 15px;
  color: white;
  text-decoration: none;
  transition: background 0.2s;
}

.sidebar-link.active, .sidebar-link:hover {
  background-color: #4169e1; /* royal blue */
  border-radius: 5px;
}

.main-content {
  overflow-y: auto;
  background: #f5f5f5;
}

.glass-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(12px);
  border-radius: 15px;
  padding: 20px;
  margin-bottom: 20px;
  transition: transform 0.3s, box-shadow 0.3s;
}

.glass-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 20px rgba(0,0,0,0.2);
}