import React from "react";
import { Outlet, Link, NavLink } from "react-router-dom";
import { Container, Button } from "react-bootstrap";
import LogoutButton from "../../components/LogoutButton";
import "./.css"; // custom CSS for sidebar & glass cards

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