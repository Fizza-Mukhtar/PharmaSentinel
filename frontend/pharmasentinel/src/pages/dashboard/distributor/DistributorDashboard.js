// src/pages/distributor/DistributorDashboard.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Row, Col, Card, Form, Button, Spinner, Badge } from "react-bootstrap";
import DistributorLayout from "../../../components/distributor/Distributorlayout";
import {
  getDistributorStats,
  getDistributorInventory,
  getDistributorIncoming,
  exportDistributorInventoryCSV,
} from "../../../services/api";

export default function DistributorDashboard() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalBatches: 0,
    inStock: 0,
    totalTransfers: 0,
    verified: 0,
  });

  const [searchName, setSearchName] = useState("");
  const [expiryFilter, setExpiryFilter] = useState("All Batches");
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [batches, setBatches] = useState([]);
  const [exportingReport, setExportingReport] = useState(null);

  const username = JSON.parse(localStorage.getItem("user"))?.username;

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [reportData, inventoryData, incomingData] = await Promise.all([
        getDistributorStats(),
        getDistributorInventory(),
        getDistributorIncoming(),
      ]);

      const totalStock =
        inventoryData.inventory?.reduce(
          (sum, item) => sum + (item.remaining_quantity || 0),
          0
        ) || 0;

      const totalBatches = inventoryData.total_batches || 0;
      const pendingIncoming = incomingData.incoming_batches?.length || 0;

      setStats({
        totalBatches: totalBatches,
        inStock: totalStock,
        totalTransfers: pendingIncoming,
        verified: totalBatches,
      });

      setBatches(inventoryData.inventory || []);
    } catch (error) {
      console.error("Failed to load dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setSearchName("");
    setExpiryFilter("All Batches");
    setLowStockOnly(false);
  };

  const filteredBatches = batches.filter((batch) => {
    if (
      searchName &&
      !batch.medicine_name.toLowerCase().includes(searchName.toLowerCase())
    ) {
      return false;
    }
    if (expiryFilter !== "All Batches") {
      if (expiryFilter === "SAFE" && batch.expiry_status !== "SAFE")
        return false;
      if (
        expiryFilter === "EXPIRING_SOON" &&
        batch.expiry_status !== "NEAR_EXPIRY"
      )
        return false;
      if (expiryFilter === "EXPIRED" && batch.expiry_status !== "EXPIRED")
        return false;
    }
    if (lowStockOnly && !batch.low_stock) {
      return false;
    }
    return true;
  });

  const handleExport = async (exportFn, reportName) => {
    try {
      setExportingReport(reportName);

      const blob = await exportFn();
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${reportName.replace(" ", "_")}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Export failed:", error);
      alert("Failed to export report");
    } finally {
      setExportingReport(null);
    }
  };

  if (loading) {
    return (
      <DistributorLayout>
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
        </div>
      </DistributorLayout>
    );
  }

  return (
    <DistributorLayout>
      {/* Welcome Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1 fw-bold">Welcome back, {username}</h2>
          <p className="text-muted mb-0">
            Monitor your distributor inventory and operations
          </p>
        </div>
        <div className="d-flex gap-2">
          <Button
            variant="outline-primary"
            onClick={() =>
              handleExport(exportDistributorInventoryCSV, "Inventory Report")
            }
            disabled={exportingReport !== null}
            size="sm"
          >
            {exportingReport === "Inventory Report" ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Exporting...
              </>
            ) : (
              "Export CSV"
            )}
          </Button>
          <Button
            variant="primary"
            onClick={() => navigate("/dashboard/distributor/transfer")}
            size="sm"
          >
            Transfer to Warehouse
          </Button>
          <Button
            variant="light"
            onClick={loadDashboardData}
            size="sm"
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <Row className="mb-4 g-3">
        {[
          { label: "Total Batches", value: stats.totalBatches, color: "#6366f1" },
          { label: "In Stock", value: stats.inStock, color: "#10b981" },
          { label: "Pending Transfers", value: stats.totalTransfers, color: "#f59e0b" },
          { label: "Verified", value: stats.verified, color: "#06b6d4" },
        ].map((card, idx) => (
          <Col lg={3} md={6} key={idx}>
            <Card className="border-0 shadow-sm h-100" style={{ borderLeft: `4px solid ${card.color}` }}>
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h3 className="mb-1 fw-bold" style={{ color: card.color }}>{card.value}</h3>
                    <small className="text-muted text-uppercase" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>{card.label}</small>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Filters */}
      <Card className="border-0 shadow-sm mb-4">
        <Card.Body>
          <Row className="align-items-end g-3">
            <Col lg={4} md={6}>
              <Form.Group>
                <Form.Label className="fw-semibold small">Search Medicine</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Search by name..."
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col lg={3} md={6}>
              <Form.Group>
                <Form.Label className="fw-semibold small">Expiry Status</Form.Label>
                <Form.Select
                  value={expiryFilter}
                  onChange={(e) => setExpiryFilter(e.target.value)}
                >
                  <option>All Batches</option>
                  <option value="SAFE">Safe</option>
                  <option value="EXPIRING_SOON">Expiring Soon</option>
                  <option value="EXPIRED">Expired</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col lg={3} md={6}>
              <Form.Check
                type="checkbox"
                label="Low Stock Only"
                checked={lowStockOnly}
                onChange={(e) => setLowStockOnly(e.target.checked)}
              />
            </Col>
            <Col lg={2} md={6}>
              <Button variant="outline-secondary" onClick={handleClear} className="w-100">
                Clear Filters
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Quick Actions */}
      <h5 className="mb-3 fw-bold">Quick Actions</h5>
      <Row className="mb-4 g-3">
        {[
          { label: "Incoming Batches", path: "/dashboard/distributor/incoming", color: "#f59e0b" },
          { label: "Manage Inventory", path: "/dashboard/distributor/inventory", color: "#10b981" },
          { label: "Transfer Batch", path: "/dashboard/distributor/transfer", color: "#3b82f6" },
          { label: "Verify Blockchain", path: "/dashboard/distributor/verify", color: "#06b6d4" },
        ].map((action, idx) => (
          <Col lg={3} md={6} key={idx}>
            <Card
              className="border-0 shadow-sm text-center h-100"
              style={{ cursor: "pointer", transition: "transform 0.2s" }}
              onClick={() => navigate(action.path)}
              onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-2px)"}
              onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
            >
              <Card.Body className="py-4">
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "8px",
                    backgroundColor: `${action.color}15`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 1rem",
                    border: `2px solid ${action.color}30`
                  }}
                >
                  <div style={{ width: "24px", height: "24px", backgroundColor: action.color, borderRadius: "4px" }}></div>
                </div>
                <h6 className="mb-0 fw-semibold">{action.label}</h6>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Inventory Table Preview */}
      <Card className="border-0 shadow-sm">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="mb-0 fw-bold">Current Inventory</h5>
            <Button
              variant="link"
              onClick={() => navigate("/dashboard/distributor/inventory")}
              style={{ textDecoration: "none" }}
            >
              View All →
            </Button>
          </div>
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th className="fw-semibold">Batch ID</th>
                  <th className="fw-semibold">Medicine Name</th>
                  <th className="fw-semibold">Quantity</th>
                  <th className="fw-semibold">Expiry Date</th>
                  <th className="fw-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredBatches.slice(0, 5).map((batch) => (
                  <tr key={batch.batch_id}>
                    <td>
                      <code className="px-2 py-1 bg-light rounded">{batch.batch_id}</code>
                    </td>
                    <td className="fw-semibold">{batch.medicine_name}</td>
                    <td>{batch.remaining_quantity}</td>
                    <td>{batch.expiry_date ? new Date(batch.expiry_date).toLocaleDateString() : "N/A"}</td>
                    <td>
                      <Badge
                        bg={
                          batch.expiry_status === "SAFE"
                            ? "success"
                            : batch.expiry_status === "NEAR_EXPIRY"
                            ? "warning"
                            : "danger"
                        }
                      >
                        {batch.expiry_status === "SAFE"
                          ? "Valid"
                          : batch.expiry_status === "NEAR_EXPIRY"
                          ? "Near Expiry"
                          : "Expired"}
                      </Badge>
                    </td>
                  </tr>
                ))}
                {filteredBatches.length === 0 && (
                  <tr>
                    <td colSpan="5" className="text-center text-muted py-4">
                      No batches found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card.Body>
      </Card>
    </DistributorLayout>
  );
}