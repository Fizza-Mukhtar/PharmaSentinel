// src/pages/dashboard/ManufacturerDashboard.js
import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Button, Modal } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBoxes, faExchangeAlt, faCheckCircle, faChartBar, faUser, faSignOutAlt } from "@fortawesome/free-solid-svg-icons";
import LogoutButton from "../../components/LogoutButton";
import axios from "axios";

// Sidebar links
const sidebarLinks = [
  { name: "Create Batch", icon: faBoxes, route: "create-batch" },
  { name: "View Batches", icon: faBoxes, route: "view-batches" },
  { name: "Transfer Batch", icon: faExchangeAlt, route: "transfer-batch" },
  { name: "View Transfers", icon: faExchangeAlt, route: "view-transfers" },
  { name: "Verify Blockchain", icon: faCheckCircle, route: "verify-blockchain" },
  { name: "Analytics", icon: faChartBar, route: "analytics" },
  { name: "Profile", icon: faUser, route: "profile" },
];

export default function ManufacturerDashboard() {
  const username = JSON.parse(localStorage.getItem("user"))?.username;

  // Active page
  const [activePage, setActivePage] = useState("view-batches");

  // Example stats from backend
  const [stats, setStats] = useState({
    total_batches: 0,
    total_quantity: 0,
    total_remaining: 0,
    total_transferred: 0,
  });

  // QR modal
  const [qrModal, setQrModal] = useState({ show: false, url: "" });

  useEffect(() => {
    // Fetch dashboard stats from backend
    axios
      .get("http://localhost:8000/api/manufacturer/dashboard/", {
        headers: {
          Authorization: `Token ${localStorage.getItem("token")}`,
        },
      })
      .then((res) => {
        setStats(res.data);
      })
      .catch((err) => console.log(err));
  }, []);

  return (
    <div className="d-flex" style={{ minHeight: "100vh" }}>
      {/* Sidebar */}
      <div
        className="d-flex flex-column p-3"
        style={{
          width: "220px",
          backgroundColor: "#0d1b2a",
          color: "white",
          minHeight: "100vh",
        }}
      >
        <h3 className="text-center mb-4" style={{ color: "#4169e1" }}>PharmaSentinel</h3>
        {sidebarLinks.map((link) => (
          <Button
            key={link.route}
            variant="link"
            onClick={() => setActivePage(link.route)}
            className={`d-flex align-items-center mb-2 text-start w-100 ${activePage === link.route ? "fw-bold text-primary" : "text-white"}`}
            style={{ textDecoration: "none" }}
          >
            <FontAwesomeIcon icon={link.icon} className="me-2" />
            {link.name}
          </Button>
        ))}
        <div className="mt-auto">
          <LogoutButton />
        </div>
      </div>

      {/* Main content */}
      <Container fluid className="p-4" style={{ backgroundColor: "#f5f5f5" }}>
        <h4>Welcome, {username}</h4>
        <Row className="mt-4 g-4">
          {/* Dashboard Cards */}
          <Col md={3}>
            <Card className="p-3 text-center glass-card">
              <h5>Total Batches</h5>
              <h2>{stats.total_batches}</h2>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="p-3 text-center glass-card">
              <h5>Total Quantity</h5>
              <h2>{stats.total_quantity}</h2>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="p-3 text-center glass-card">
              <h5>Remaining</h5>
              <h2>{stats.total_remaining}</h2>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="p-3 text-center glass-card">
              <h5>Transferred</h5>
              <h2>{stats.total_transferred}</h2>
            </Card>
          </Col>
        </Row>

        {/* Page content */}
        <div className="mt-4">
          {activePage === "create-batch" && <p>Render Create Batch Form here</p>}
          {activePage === "view-batches" && <p>Render Batches List here</p>}
          {activePage === "transfer-batch" && <p>Render Transfer Batch Form here</p>}
          {activePage === "view-transfers" && <p>Render Transfer History here</p>}
          {activePage === "verify-blockchain" && <p>Render Blockchain Verification here</p>}
          {activePage === "analytics" && <p>Render Charts/Analytics here</p>}
          {activePage === "profile" && <p>Render Profile here</p>}
        </div>
      </Container>

      {/* QR Modal */}
      <Modal show={qrModal.show} onHide={() => setQrModal({ show: false, url: "" })} centered>
        <Modal.Header closeButton>
          <Modal.Title>QR Code</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          <img src={qrModal.url} alt="QR Code" className="img-fluid" />
        </Modal.Body>
      </Modal>

      <style jsx="true">{`
        .glass-card {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(12px);
          border-radius: 15px;
          transition: transform 0.3s, box-shadow 0.3s;
        }
        .glass-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 20px rgba(0,0,0,0.2);
        }
      `}</style>
    </div>
  );
}
