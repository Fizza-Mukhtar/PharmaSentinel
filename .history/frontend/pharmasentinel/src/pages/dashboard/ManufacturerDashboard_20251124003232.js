// src/pages/dashboard/ManufacturerDashboard.jsx
import React, { useEffect, useState } from "react";
import { Container, Row, Col, Button, Spinner } from "react-bootstrap";
import AppNavbar from "../../components/AppNavbar";
import AppSidebar from "../../components/AppSidebar";
import StatsCards from "../../components/StatsCards";
import BatchList from "../../components/BatchList";
import CreateBatchModal from "../../components/CreateBatchModal";
import { fetchDashboardStats, fetchBatches } from "../../services/api";
import "./manufacturer.css";

export default function ManufacturerDashboard() {
  const [username] = useState(JSON.parse(localStorage.getItem("user"))?.username || "Manufacturer");
  const [showCreate, setShowCreate] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [batches, setBatches] = useState([]);

  const loadData = async () => {
    setLoading(true);
    try {
      const s = await fetchDashboardStats();
      const b = await fetchBatches();
      setStats(s);
      setBatches(b);
    } catch (err) {
      console.error("Failed to load dashboard data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="manufacturer-app d-flex">
      <AppSidebar active="dashboard" />
      <div className="flex-fill">
        <AppNavbar username={username} />
        <Container className="py-4">
          <Row className="align-items-center mb-3">
            <Col>
              <h3 className="mb-0">Manufacturer Dashboard</h3>
              <small className="text-muted">Welcome back, {username}</small>
            </Col>
            <Col className="text-end">
              <Button variant="primary" className="me-2" onClick={() => setShowCreate(true)}>
                + Create New Batch
              </Button>
              <Button variant="outline-secondary" onClick={loadData}>
                {loading ? <Spinner animation="border" size="sm" /> : "Refresh"}
              </Button>
            </Col>
          </Row>

          {loading ? (
            <div className="d-flex justify-content-center py-5">
              <Spinner animation="border" role="status" />
            </div>
          ) : (
            <>
              <StatsCards stats={stats} />
              <Row className="mt-4">
                <Col>
                  <h5>Recent Batches</h5>
                  <BatchList batches={batches} onRefresh={loadData} />
                </Col>
              </Row>
            </>
          )}
        </Container>
      </div>

      <CreateBatchModal show={showCreate} onHide={() => setShowCreate(false)} onCreated={loadData} />
    </div>
  );
}
