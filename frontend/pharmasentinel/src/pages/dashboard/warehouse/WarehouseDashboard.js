// src/pages/warehouse/WarehouseDashboard.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Row, Col, Card, Form, Button , Spinner } from "react-bootstrap";

import WarehouseLayout from "../../../components/warehouse/WarehouseLayout";
import { 
  getWarehouseStats, 
  getWarehouseInventory, 
  exportWarehouseInventoryCSV,
  getIncomingBatches 
} from "../../../services/api";

export default function WarehouseDashboard() {
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
        getWarehouseStats(),
        getWarehouseInventory(),
        getIncomingBatches(),
      ]);

      const totalStock = inventoryData.inventory?.reduce(
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
    if (searchName && !batch.medicine_name.toLowerCase().includes(searchName.toLowerCase())) {
      return false;
    }
    if (expiryFilter !== "All Batches") {
      if (expiryFilter === "SAFE" && batch.expiry_status !== "SAFE") return false;
      if (expiryFilter === "EXPIRING_SOON" && batch.expiry_status !== "NEAR_EXPIRY") return false;
      if (expiryFilter === "EXPIRED" && batch.expiry_status !== "EXPIRED") return false;
    }
    if (lowStockOnly && !batch.low_stock) {
      return false;
    }
    return true;
  });


  const handleExport = async (exportFn, reportName) => {
    try {
      setExportingReport(reportName);

      const blob = await exportFn(); // API must return blob
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
      <WarehouseLayout>
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </WarehouseLayout>
    );
  }

  return (
    <WarehouseLayout>
      {/* Welcome Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">Welcome back, {username}</h2>
          <p className="text-muted mb-0">Monitor your warehouse inventory and operations</p>
        </div>
        <div className="d-flex gap-2">
          <Button
                      variant="primary"
                      onClick={() =>
                        handleExport(exportWarehouseInventoryCSV, "Inventory Report")
                      }
                      disabled={exportingReport !== null}
                      className="w-100"
                    >
                      {exportingReport === "Inventory Report" ? (
                        <>
                          <Spinner animation="border" size="sm" className="me-2" />
                          Exporting...
                        </>
                      ) : (
                        "📊 Export CSV"
                      )}
                    </Button>
          <Button variant="primary" onClick={() => navigate("./transfer")}>
            ➕ Transfer to Wholesaler
          </Button>
          <Button 
            variant="outline-secondary" 
            onClick={loadDashboardData}
            style={{ border: "none", background: "none" }}
          >
            🔄
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="border-0 shadow-sm" style={{ borderLeft: "4px solid #6366f1" }}>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "12px",
                    backgroundColor: "#e0e7ff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.5rem",
                    marginBottom: "0.5rem"
                  }}>
                    📊
                  </div>
                  <h3 className="mb-0 fw-bold">{stats.totalBatches}</h3>
                  <small className="text-muted">TOTAL BATCHES</small>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="border-0 shadow-sm" style={{ borderLeft: "4px solid #10b981" }}>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "12px",
                    backgroundColor: "#d1fae5",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.5rem",
                    marginBottom: "0.5rem"
                  }}>
                    📦
                  </div>
                  <h3 className="mb-0 fw-bold">{stats.inStock}</h3>
                  <small className="text-muted">IN STOCK</small>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="border-0 shadow-sm" style={{ borderLeft: "4px solid #f59e0b" }}>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "12px",
                    backgroundColor: "#fef3c7",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.5rem",
                    marginBottom: "0.5rem"
                  }}>
                    🔄
                  </div>
                  <h3 className="mb-0 fw-bold">{stats.totalTransfers}</h3>
                  <small className="text-muted">PENDING TRANSFERS</small>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="border-0 shadow-sm" style={{ borderLeft: "4px solid #06b6d4" }}>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "12px",
                    backgroundColor: "#cffafe",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.5rem",
                    marginBottom: "0.5rem"
                  }}>
                    ✅
                  </div>
                  <h3 className="mb-0 fw-bold">{stats.verified}</h3>
                  <small className="text-muted">VERIFIED</small>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card className="border-0 shadow-sm mb-4">
        <Card.Body>
          <Row className="align-items-end">
            <Col md={4}>
              <Form.Group>
                <Form.Label>Search Medicine</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Search by name..."
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Expiry Status</Form.Label>
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
            <Col md={3}>
              <Form.Check
                type="checkbox"
                label="Low Stock Only"
                checked={lowStockOnly}
                onChange={(e) => setLowStockOnly(e.target.checked)}
              />
            </Col>
            <Col md={2}>
              <Button variant="outline-secondary" onClick={handleClear} className="w-100">
                ✖ Clear
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Quick Actions */}
      <h5 className="mb-3">Quick Actions</h5>
      <Row className="mb-4">
        {[
          { icon: "📥", label: "Incoming Batches", path: "/warehouse/incoming", color: "#f59e0b" },
          { icon: "📦", label: "Manage Inventory", path: "/warehouse/inventory", color: "#10b981" },
          { icon: "🔄", label: "Transfer Batch", path: "/warehouse/transfer", color: "#3b82f6" },
          { icon: "🛡️", label: "Verify Blockchain", path: "/warehouse/verify", color: "#06b6d4" },
        ].map((action, idx) => (
          <Col md={3} key={idx}>
            <Card 
              className="border-0 shadow-sm text-center"
              style={{ cursor: "pointer" }}
              onClick={() => navigate(action.path)}
            >
              <Card.Body>
                <div style={{
                  width: "64px",
                  height: "64px",
                  borderRadius: "12px",
                  backgroundColor: `${action.color}20`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "2rem",
                  margin: "0 auto 1rem"
                }}>
                  {action.icon}
                </div>
                <h6 className="mb-0">{action.label}</h6>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Inventory Table Preview */}
      <Card className="border-0 shadow-sm">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="mb-0">Current Inventory</h5>
            <Button 
              variant="link" 
              onClick={() => navigate("./inventory")}
              style={{ textDecoration: "none" }}
            >
              View All →
            </Button>
          </div>
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Batch ID</th>
                  <th>Medicine Name</th>
                  <th>Quantity</th>
                  <th>Expiry Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredBatches.slice(0, 5).map((batch) => (
                  <tr key={batch.batch_id}>
                    <td><code>{batch.batch_id}</code></td>
                    <td>{batch.medicine_name}</td>
                    <td>{batch.remaining_quantity}</td>
                    <td>{batch.expiry_date || "N/A"}</td>
                    <td>
                      <span className={`badge bg-${
                        batch.expiry_status === "SAFE" ? "success" :
                        batch.expiry_status === "NEAR_EXPIRY" ? "warning" : "danger"
                      }`}>
                        {batch.expiry_status === "SAFE" ? "🟢 Valid" :
                         batch.expiry_status === "NEAR_EXPIRY" ? "🟡 Near Expiry" : "🔴 Expired"}
                      </span>
                    </td>
                  </tr>
                ))}
                {filteredBatches.length === 0 && (
                  <tr>
                    <td colSpan="5" className="text-center text-muted">
                      No batches found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card.Body>
      </Card>
    </WarehouseLayout>
  );
}