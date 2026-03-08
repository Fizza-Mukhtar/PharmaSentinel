// src/pages/distributor/DistributorInventory.js
import React, { useState, useEffect } from "react";
import {
  Card,
  Button,
  Badge,
  Form,
  Row,
  Col,
  Alert,
  Modal,
  Spinner,
} from "react-bootstrap";
import { FaQrcode } from "react-icons/fa";
import DistributorLayout from "../../../components/distributor/Distributorlayout";
import { getDistributorInventory } from "../../../services/api";

export default function DistributorInventory() {
  const [showQrModal, setShowQrModal] = useState(false);
  const [selectedQr, setSelectedQr] = useState({ url: "", batchId: "", name: "" });
  const [loading, setLoading] = useState(true);
  const [inventory, setInventory] = useState([]);
  const [filteredInventory, setFilteredInventory] = useState([]);
  const [error, setError] = useState(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [lowStockOnly, setLowStockOnly] = useState(false);

  const openBatchQR = (batch) => {
    const qrUrl = batch.qr_code_url || `http://localhost:8000/medicine/api/qr/${batch.batch_id}/`;
    setSelectedQr({ url: qrUrl, batchId: batch.batch_id, name: batch.medicine_name });
    setShowQrModal(true);
  };

  useEffect(() => {
    loadInventory();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, statusFilter, lowStockOnly, inventory]);

  const loadInventory = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getDistributorInventory();
      setInventory(data.inventory || []);
      setFilteredInventory(data.inventory || []);
    } catch (err) {
      setError(err.detail || "Failed to load inventory");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...inventory];

    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.medicine_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.batch_id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "ALL") {
      filtered = filtered.filter((item) => {
        if (statusFilter === "VALID") return item.expiry_status === "SAFE";
        if (statusFilter === "NEAR_EXPIRY") return item.expiry_status === "NEAR_EXPIRY";
        if (statusFilter === "EXPIRED") return item.expiry_status === "EXPIRED";
        return true;
      });
    }

    if (lowStockOnly) {
      filtered = filtered.filter((item) => item.low_stock);
    }

    setFilteredInventory(filtered);
  };

  const getStatusBadge = (status) => {
    if (status === "SAFE") return <Badge bg="success">Valid</Badge>;
    if (status === "NEAR_EXPIRY") return <Badge bg="warning">Near Expiry</Badge>;
    if (status === "EXPIRED") return <Badge bg="danger">Expired</Badge>;
    return <Badge bg="secondary">Unknown</Badge>;
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setStatusFilter("ALL");
    setLowStockOnly(false);
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
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1 fw-bold">Distributor Inventory</h2>
          <p className="text-muted mb-0">Manage and monitor your medicine stock</p>
        </div>
        <Button variant="outline-primary" onClick={loadInventory} size="sm">
          Refresh
        </Button>
      </div>

      {error && <Alert variant="danger" dismissible onClose={() => setError(null)}>{error}</Alert>}

      {/* Summary Cards */}
      <Row className="mb-4 g-3">
        <Col lg={3} md={6}>
          <Card className="border-0 shadow-sm text-center h-100">
            <Card.Body>
              <h3 className="mb-1 fw-bold text-primary">{inventory.length}</h3>
              <small className="text-muted text-uppercase" style={{ fontSize: '0.75rem' }}>Total Batches</small>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={3} md={6}>
          <Card className="border-0 shadow-sm text-center h-100">
            <Card.Body>
              <h3 className="mb-1 fw-bold text-success">{inventory.reduce((sum, item) => sum + (item.remaining_quantity || 0), 0)}</h3>
              <small className="text-muted text-uppercase" style={{ fontSize: '0.75rem' }}>Total Units</small>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={3} md={6}>
          <Card className="border-0 shadow-sm text-center h-100">
            <Card.Body>
              <h3 className="mb-1 fw-bold text-warning">{inventory.filter((item) => item.expiry_status === "NEAR_EXPIRY").length}</h3>
              <small className="text-muted text-uppercase" style={{ fontSize: '0.75rem' }}>Near Expiry</small>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={3} md={6}>
          <Card className="border-0 shadow-sm text-center h-100">
            <Card.Body>
              <h3 className="mb-1 fw-bold text-danger">{inventory.filter((item) => item.expiry_status === "EXPIRED").length}</h3>
              <small className="text-muted text-uppercase" style={{ fontSize: '0.75rem' }}>Expired</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card className="border-0 shadow-sm mb-4">
        <Card.Body>
          <Row className="align-items-end g-3">
            <Col lg={4} md={6}>
              <Form.Group>
                <Form.Label className="fw-semibold small">Search</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Search by batch ID or medicine name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col lg={3} md={6}>
              <Form.Group>
                <Form.Label className="fw-semibold small">Status</Form.Label>
                <Form.Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <option value="ALL">All Status</option>
                  <option value="VALID">Valid</option>
                  <option value="NEAR_EXPIRY">Near Expiry</option>
                  <option value="EXPIRED">Expired</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col lg={3} md={6}>
              <Form.Check 
                type="checkbox" 
                label="Show Low Stock Only" 
                checked={lowStockOnly} 
                onChange={(e) => setLowStockOnly(e.target.checked)} 
              />
            </Col>
            <Col lg={2} md={6}>
              <Button variant="outline-secondary" className="w-100" onClick={handleClearFilters}>
                Clear Filters
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Inventory Table */}
      <Card className="border-0 shadow-sm">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="mb-0 fw-bold">Inventory Items ({filteredInventory.length})</h5>
          </div>

          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th className="fw-semibold">Batch ID</th>
                  <th className="fw-semibold">Medicine Name</th>
                  <th className="fw-semibold">Manufacturer</th>
                  <th className="fw-semibold">Total Qty</th>
                  <th className="fw-semibold">Remaining</th>
                  <th className="fw-semibold">Manufacture Date</th>
                  <th className="fw-semibold">Expiry Date</th>
                  <th className="fw-semibold">Status</th>
                  <th className="fw-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInventory.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="text-center text-muted py-4">No inventory items found</td>
                  </tr>
                ) : (
                  filteredInventory.map((item) => (
                    <tr key={item.batch_id}>
                      <td>
                        <code className="px-2 py-1 bg-light rounded">{item.batch_id}</code>
                        {item.low_stock && <Badge bg="warning" className="ms-2">Low Stock</Badge>}
                      </td>
                      <td><strong>{item.medicine_name}</strong></td>
                      <td>{item.manufacturer}</td>
                      <td>{item.total_received || 0}</td>
                      <td><strong>{item.remaining_quantity || 0}</strong></td>
                      <td>{item.manufacture_date ? new Date(item.manufacture_date).toLocaleDateString() : "N/A"}</td>
                      <td>{item.expiry_date ? new Date(item.expiry_date).toLocaleDateString() : "N/A"}</td>
                      <td>{getStatusBadge(item.expiry_status)}</td>
                      <td>
                        <div className="d-flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline-primary" 
                            onClick={() => openBatchQR(item)} 
                            disabled={!item.qr_code_url && !item.batch_id}
                          >
                            <FaQrcode /> QR
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline-success" 
                            onClick={() => (window.location.href = `/dashboard/distributor/transfer?batch=${item.batch_id}`)} 
                            disabled={item.expiry_status === "EXPIRED"}
                          >
                            Transfer
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card.Body>
      </Card>

      {/* QR Modal */}
      <Modal show={showQrModal} onHide={() => setShowQrModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>QR Code - {selectedQr.batchId}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          <h6 className="mb-3">{selectedQr.name}</h6>
          {selectedQr.url ? (
            <img src={selectedQr.url} alt={selectedQr.batchId} style={{ maxWidth: "100%", maxHeight: "400px" }} />
          ) : (
            <p className="text-muted">No QR Code available</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowQrModal(false)} size="sm">Close</Button>
          {selectedQr.url && (
            <Button variant="primary" onClick={() => window.open(selectedQr.url, "_blank")} size="sm">
              Download
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </DistributorLayout>
  );
}