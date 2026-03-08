// src/pages/dashboard/ManufacturerDashboard.js
import React from "react";
import { Container } from "react-bootstrap";
import RoleRoute from "../../components/RoleRoute";
import ProtectedRoute from "../../components/ProtectedRoute";
import LogoutButton from "../../components/LogoutButton";

export default function ManufacturerDashboard() {
  const username = JSON.parse(localStorage.getItem("user"))?.username;

  return (
    <ProtectedRoute>
      <RoleRoute roles={["manufacturer"]}>
        <Container className="py-5">
          <h2>Manufacturer Dashboard</h2>
          <p>Welcome, {username}</p>
          <LogoutButton className="mb-3" />
          <div className="card p-3 mt-3">
            <p>Manage production, inventory, and shipment of medicines.</p>
          </div>
        </Container>
      </RoleRoute>
    </ProtectedRoute>
  );
}