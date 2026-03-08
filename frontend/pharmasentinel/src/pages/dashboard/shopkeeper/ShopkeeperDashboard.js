// src/pages/shopkeeper/ShopkeeperDashboard.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Row, Col, Card, Form, Button, Spinner, Badge } from "react-bootstrap";
import ShopkeeperLayout from "../../../components/shopkeeper/ShopkeeperLayout";
import {
  getShopkeeperDashboard,
  getShopkeeperInventory,
  exportShopkeeperInventoryCSV,
} from "../../../services/api";

export default function ShopkeeperDashboard() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalBatches: 0,
    totalStock: 0,
    totalSales: 0,
    pendingIncoming: 0,
    lowStock: 0,
    expiringSoon: 0,
    expired: 0,
  });

  const [searchName, setSearchName] = useState("");
  const [expiryFilter, setExpiryFilter] = useState("All Batches");
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [inventory, setInventory] = useState([]);
  const [exportingReport, setExportingReport] = useState(null);

  const user = JSON.parse(localStorage.getItem("user"));
  const username = user?.username || "Shopkeeper";

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [dashboardData, inventoryData] = await Promise.all([
        getShopkeeperDashboard(),
        getShopkeeperInventory(),
      ]);

      const dashboard = dashboardData.dashboard || {};
      const inventoryStats = dashboard.inventory || {};
      const salesStats = dashboard.sales || {};
      const transferStats = dashboard.transfers || {};

      setStats({
        totalBatches: inventoryStats.total_batches || 0,
        totalStock: inventoryStats.total_quantity || 0,
        totalSales: salesStats.total_sales || 0,
        pendingIncoming: transferStats.pending_incoming || 0,
        lowStock: inventoryStats.low_stock_count || 0,
        expiringSoon: inventoryStats.expiring_soon || 0,
        expired: inventoryStats.expired_count || 0,
      });

      setInventory(inventoryData.inventory || []);
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

  const filteredInventory = inventory.filter((item) => {
    if (searchName && !item.medicine_name.toLowerCase().includes(searchName.toLowerCase())) {
      return false;
    }
    if (expiryFilter !== "All Batches") {
      if (expiryFilter === "SAFE" && item.expiry_status !== "SAFE") return false;
      if (expiryFilter === "EXPIRING_SOON" && item.expiry_status !== "NEAR_EXPIRY") return false;
      if (expiryFilter === "EXPIRED" && item.expiry_status !== "EXPIRED") return false;
    }
    if (lowStockOnly && !item.low_stock) return false;
    return true;
  });

  const handleExport = async (exportFn, reportName) => {
    try {
      setExportingReport(reportName);
      const blob = await exportFn();
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${reportName.replace(/ /g, "_")}.csv`);
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
      <ShopkeeperLayout>
        <div className="text-center py-5">
          <Spinner animation="border" variant="success" />
          <p className="mt-3 text-muted">Loading dashboard...</p>
        </div>
      </ShopkeeperLayout>
    );
  }

  return (
    <ShopkeeperLayout>
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" />

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">
            Welcome, <span style={{ color: "#10b981" }}>{username}</span>
          </h2>
          <p className="text-muted mb-0">Manage your shop inventory and track sales</p>
        </div>
        <div className="d-flex gap-2">
          <Button
            variant="success"
            onClick={() => handleExport(exportShopkeeperInventoryCSV, "Shopkeeper Inventory")}
            disabled={exportingReport !== null}
          >
            {exportingReport === "Shopkeeper Inventory" ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Exporting...
              </>
            ) : (
              <>
                <i className="bi bi-file-earmark-spreadsheet me-2"></i>
                Export Inventory
              </>
            )}
          </Button>
          <Button variant="success" onClick={() => navigate("/dashboard/shopkeeper/sell")}>
            <i className="bi bi-cart-plus me-2"></i>
            Sell Medicine
          </Button>
          <Button variant="outline-secondary" onClick={loadDashboardData}>
            <i className="bi bi-arrow-clockwise"></i>
          </Button>
        </div>
      </div>

      {/* Stats Cards Row 1 */}
      <Row className="mb-4">
        {[
          { label: "Total Medicines", value: stats.totalBatches, color: "#10b981", icon: "bi-box-seam", subtext: "Available batches" },
          { label: "Total Stock", value: stats.totalStock, color: "#3b82f6", icon: "bi-stack", subtext: "Units available" },
          { label: "Total Sales", value: stats.totalSales, color: "#8b5cf6", icon: "bi-graph-up", subtext: "Completed sales" },
          { label: "Pending Incoming", value: stats.pendingIncoming, color: "#f59e0b", icon: "bi-inbox", subtext: "Awaiting confirmation" },
        ].map((card, idx) => (
          <Col md={3} key={idx}>
            <Card className="border-0 shadow-sm h-100" style={{ borderLeft: `4px solid ${card.color}` }}>
              <Card.Body>
                <div className="d-flex align-items-center gap-3">
                  <div style={{ fontSize: "2.5rem", color: card.color }}>
                    <i className={`bi ${card.icon}`}></i>
                  </div>
                  <div>
                    <h3 className="mb-0 fw-bold" style={{ color: card.color }}>{card.value}</h3>
                    <div className="text-muted small fw-semibold">{card.label}</div>
                    <small className="text-muted" style={{ fontSize: "0.7rem" }}>{card.subtext}</small>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Stats Cards Row 2 - Alerts */}
      <Row className="mb-4">
        {[
          { label: "Low Stock", value: stats.lowStock, color: "#f59e0b", icon: "bi-exclamation-triangle", bgColor: "#fef3c7" },
          { label: "Expiring Soon", value: stats.expiringSoon, color: "#f97316", icon: "bi-clock-history", bgColor: "#ffedd5" },
          { label: "Expired", value: stats.expired, color: "#ef4444", icon: "bi-x-circle", bgColor: "#fee2e2" },
        ].map((card, idx) => (
          <Col md={4} key={idx}>
            <Card className="border-0 shadow-sm" style={{ backgroundColor: card.bgColor, borderLeft: `4px solid ${card.color}` }}>
              <Card.Body>
                <div className="d-flex align-items-center gap-3">
                  <div style={{ fontSize: "2.5rem", color: card.color }}>
                    <i className={`bi ${card.icon}`}></i>
                  </div>
                  <div>
                    <h2 className="mb-0 fw-bold" style={{ color: card.color }}>{card.value}</h2>
                    <div className="fw-semibold" style={{ color: card.color, fontSize: "0.9rem" }}>{card.label}</div>
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
          <h6 className="mb-3 fw-semibold" style={{ color: "#10b981" }}>
            <i className="bi bi-funnel me-2"></i>
            Search & Filter Inventory
          </h6>
          <Row className="align-items-end">
            <Col md={4}>
              <Form.Group>
                <Form.Label className="fw-semibold small">Search Medicine</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Search by medicine name..."
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label className="fw-semibold small">Expiry Status</Form.Label>
                <Form.Select value={expiryFilter} onChange={(e) => setExpiryFilter(e.target.value)}>
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
                label="Show Low Stock Only"
                checked={lowStockOnly}
                onChange={(e) => setLowStockOnly(e.target.checked)}
                className="fw-semibold"
              />
            </Col>
            <Col md={2}>
              <Button variant="outline-secondary" onClick={handleClear} className="w-100">
                <i className="bi bi-x-lg me-2"></i>
                Clear
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Quick Actions */}
      <h5 className="mb-3 fw-semibold" style={{ color: "#10b981" }}>
        <i className="bi bi-lightning me-2"></i>
        Quick Actions
      </h5>
      <Row className="mb-4">
        {[
          { icon: "bi-inbox", label: "Incoming Stock", path: "/dashboard/shopkeeper/incoming", color: "#f59e0b" },
          { icon: "bi-box-seam", label: "My Inventory", path: "/dashboard/shopkeeper/inventory", color: "#10b981" },
          { icon: "bi-cart-plus", label: "Sell Medicine", path: "/dashboard/shopkeeper/sell", color: "#3b82f6" },
          { icon: "bi-graph-up", label: "Sales History", path: "/dashboard/shopkeeper/sales-history", color: "#8b5cf6" },
          { icon: "bi-shield-check", label: "Verify Medicine", path: "/dashboard/shopkeeper/verify", color: "#06b6d4" },
          { icon: "bi-file-earmark-text", label: "Reports", path: "/dashboard/shopkeeper/reports", color: "#ec4899" },
        ].map((action, idx) => (
          <Col md={4} lg={2} key={idx} className="mb-3">
            <Card
              className="border-0 shadow-sm text-center h-100"
              style={{ cursor: "pointer", transition: "all 0.2s" }}
              onClick={() => navigate(action.path)}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "0 8px 16px rgba(0,0,0,0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
              }}
            >
              <Card.Body className="p-3">
                <div style={{ fontSize: "2.5rem", color: action.color, marginBottom: "0.5rem" }}>
                  <i className={`bi ${action.icon}`}></i>
                </div>
                <h6 className="mb-0 fw-semibold" style={{ fontSize: "0.9rem" }}>{action.label}</h6>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Inventory Table */}
      <Card className="border-0 shadow-sm">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="mb-0 fw-semibold" style={{ color: "#10b981" }}>
              <i className="bi bi-box-seam me-2"></i>
              Current Inventory Preview
            </h5>
            <Button variant="link" onClick={() => navigate("/dashboard/shopkeeper/inventory")} style={{ textDecoration: "none", color: "#10b981" }}>
              View Full Inventory <i className="bi bi-arrow-right ms-1"></i>
            </Button>
          </div>

          {filteredInventory.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead style={{ backgroundColor: "#f9fafb" }}>
                  <tr>
                    <th>Batch ID</th>
                    <th>Medicine Name</th>
                    <th>Manufacturer</th>
                    <th>Available</th>
                    <th>Expiry Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInventory.slice(0, 8).map((item) => (
                    <tr key={item.batch_id}>
                      <td>
                        <code className="px-2 py-1" style={{ backgroundColor: "#f3f4f6", borderRadius: "4px", fontSize: "0.85rem" }}>
                          {item.batch_id}
                        </code>
                      </td>
                      <td className="fw-semibold">{item.medicine_name}</td>
                      <td className="text-muted">{item.manufacturer}</td>
                      <td>
                        <Badge bg={item.low_stock ? "warning" : "success"}>
                          {item.remaining_quantity || item.quantity} units
                        </Badge>
                      </td>
                      <td>{item.expiry_date ? new Date(item.expiry_date).toLocaleDateString() : "N/A"}</td>
                      <td>
                        <Badge bg={item.expiry_status === "SAFE" ? "success" : item.expiry_status === "NEAR_EXPIRY" ? "warning" : "danger"}>
                          {item.expiry_status === "SAFE" ? "Safe" : item.expiry_status === "NEAR_EXPIRY" ? "Expiring" : "Expired"}
                        </Badge>
                      </td>
                      <td>
                        <Button
                          variant="outline-success"
                          size="sm"
                          onClick={() => navigate("/dashboard/shopkeeper/sell", { state: { batch: item } })}
                          disabled={item.expiry_status === "EXPIRED" || (item.remaining_quantity || item.quantity) === 0}
                        >
                          <i className="bi bi-cart-plus me-1"></i>
                          Sell
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-5">
              <i className="bi bi-box-seam" style={{ fontSize: "4rem", color: "#d1d5db" }}></i>
              <h5 className="text-muted mt-3">No inventory found</h5>
              <p className="text-muted small">
                {searchName || expiryFilter !== "All Batches" || lowStockOnly
                  ? "Try adjusting your filters"
                  : "Accept incoming stock to get started"}
              </p>
            </div>
          )}
        </Card.Body>
      </Card>
    </ShopkeeperLayout>
  );
}