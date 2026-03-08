// src/pages/shopkeeper/ShopkeeperInventory.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Row, Col, Card, Form, Button, Spinner, Badge, Table } from "react-bootstrap";
import ShopkeeperLayout from "../../../components/shopkeeper/ShopkeeperLayout";
import { getShopkeeperInventory } from "../../../services/api";

export default function ShopkeeperInventory() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [inventory, setInventory] = useState([]);
  
  const [searchName, setSearchName] = useState("");
  const [expiryFilter, setExpiryFilter] = useState("All");
  const [lowStockOnly, setLowStockOnly] = useState(false);

  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    setLoading(true);
    try {
      const response = await getShopkeeperInventory();
      console.log("Inventory response:", response);
      setInventory(response.inventory || []);
    } catch (error) {
      console.error("Failed to load inventory:", error);
      alert("Failed to load inventory");
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setSearchName("");
    setExpiryFilter("All");
    setLowStockOnly(false);
  };

  const filteredInventory = inventory.filter((item) => {
    if (searchName && !item.medicine_name.toLowerCase().includes(searchName.toLowerCase())) {
      return false;
    }
    if (expiryFilter !== "All") {
      if (expiryFilter === "SAFE" && item.expiry_status !== "SAFE") return false;
      if (expiryFilter === "NEAR_EXPIRY" && item.expiry_status !== "NEAR_EXPIRY") return false;
      if (expiryFilter === "EXPIRED" && item.expiry_status !== "EXPIRED") return false;
    }
    if (lowStockOnly && !item.low_stock) return false;
    return true;
  });

  const totalBatches = filteredInventory.length;
  const totalQuantity = filteredInventory.reduce((sum, item) => sum + (item.remaining_quantity || 0), 0);
  const lowStockCount = filteredInventory.filter(item => item.low_stock).length;
  const expiringSoon = filteredInventory.filter(item => item.expiry_status === "NEAR_EXPIRY").length;
  const expired = filteredInventory.filter(item => item.expiry_status === "EXPIRED").length;

  if (loading) {
    return (
      <ShopkeeperLayout>
        <div className="text-center py-5">
          <Spinner animation="border" variant="success" />
          <p className="mt-3 text-muted">Loading inventory...</p>
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
            <i className="bi bi-box-seam me-2" style={{ color: "#10b981" }}></i>
            My Inventory
          </h2>
          <p className="text-muted mb-0">View and manage your medicine stock</p>
        </div>
        <Button variant="outline-secondary" onClick={loadInventory}>
          <i className="bi bi-arrow-clockwise me-2"></i>
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <Row className="mb-4">
        {[
          { label: "Total Batches", value: totalBatches, icon: "bi-box-seam", color: "#10b981" },
          { label: "Total Stock", value: totalQuantity, icon: "bi-stack", color: "#3b82f6" },
          { label: "Low Stock", value: lowStockCount, icon: "bi-exclamation-triangle", color: "#f59e0b" },
          { label: "Expiring Soon", value: expiringSoon, icon: "bi-clock-history", color: "#f97316" },
          { label: "Expired", value: expired, icon: "bi-x-circle", color: "#ef4444" },
        ].map((stat, idx) => (
          <Col md={2} key={idx} className="mb-3">
            <Card className="border-0 shadow-sm" style={{ borderLeft: `4px solid ${stat.color}` }}>
              <Card.Body className="text-center">
                <div style={{ fontSize: "2rem", color: stat.color, marginBottom: "0.5rem" }}>
                  <i className={`bi ${stat.icon}`}></i>
                </div>
                <h3 className="mb-0 fw-bold" style={{ color: stat.color }}>{stat.value}</h3>
                <small className="text-muted">{stat.label}</small>
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
            Search & Filter
          </h6>
          <Row className="align-items-end">
            <Col md={4}>
              <Form.Group>
                <Form.Label className="fw-semibold small">Medicine Name</Form.Label>
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
                <Form.Label className="fw-semibold small">Expiry Status</Form.Label>
                <Form.Select value={expiryFilter} onChange={(e) => setExpiryFilter(e.target.value)}>
                  <option value="All">All Status</option>
                  <option value="SAFE">Safe</option>
                  <option value="NEAR_EXPIRY">Expiring Soon</option>
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

      {/* Inventory Table */}
      <Card className="border-0 shadow-sm">
        <Card.Body>
          <h5 className="mb-3 fw-semibold" style={{ color: "#10b981" }}>
            <i className="bi bi-list-check me-2"></i>
            Inventory List ({filteredInventory.length} items)
          </h5>

          {filteredInventory.length > 0 ? (
            <div className="table-responsive">
              <Table hover>
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
                  {filteredInventory.map((item) => (
                    <tr key={item.batch_id}>
                      <td>
                        <code className="px-2 py-1" style={{ backgroundColor: "#f3f4f6", borderRadius: "4px" }}>
                          {item.batch_id}
                        </code>
                      </td>
                      <td className="fw-semibold">{item.medicine_name}</td>
                      <td className="text-muted">{item.manufacturer || "N/A"}</td>
                      <td>
                        <Badge bg={item.low_stock ? "warning" : "success"}>
                          {item.remaining_quantity || 0} units
                        </Badge>
                      </td>
                      <td>
                        {item.expiry_date ? (
                          <div className="small">{new Date(item.expiry_date).toLocaleDateString()}</div>
                        ) : (
                          "N/A"
                        )}
                      </td>
                      <td>
                        <Badge
                          bg={
                            item.expiry_status === "SAFE"
                              ? "success"
                              : item.expiry_status === "NEAR_EXPIRY"
                              ? "warning"
                              : "danger"
                          }
                        >
                          {item.expiry_status === "SAFE"
                            ? "Safe"
                            : item.expiry_status === "NEAR_EXPIRY"
                            ? "Expiring Soon"
                            : "Expired"}
                        </Badge>
                        {item.low_stock && (
                          <Badge bg="warning" className="ms-1">
                            <i className="bi bi-exclamation-triangle me-1"></i>
                            Low
                          </Badge>
                        )}
                      </td>
                      <td>
                        <Button
                          variant="outline-success"
                          size="sm"
                          onClick={() => navigate("/dashboard/shopkeeper/sell", { state: { batch: item } })}
                          disabled={item.expiry_status === "EXPIRED" || (item.remaining_quantity || 0) === 0}
                        >
                          <i className="bi bi-cart-plus me-1"></i>
                          Sell
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-5">
              <i className="bi bi-box-seam" style={{ fontSize: "4rem", color: "#d1d5db" }}></i>
              <h5 className="text-muted mt-3">No inventory found</h5>
              <p className="text-muted small">Try adjusting your filters</p>
            </div>
          )}
        </Card.Body>
      </Card>
    </ShopkeeperLayout>
  );
}