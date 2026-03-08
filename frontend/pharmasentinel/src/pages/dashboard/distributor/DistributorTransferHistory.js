// src/pages/distributor/DistributorTransferHistory.js
import React, { useState, useEffect } from "react";
import { Card, Button, Badge, Form, Row, Col, Alert, Spinner } from "react-bootstrap";
import DistributorLayout from "../../../components/distributor/Distributorlayout";
import { getDistributorTransferHistory } from "../../../services/api";

export default function DistributorTransferHistory() {
  const [loading, setLoading] = useState(true);
  const [transfers, setTransfers] = useState([]);
  const [filteredTransfers, setFilteredTransfers] = useState([]);
  const [error, setError] = useState(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");

  useEffect(() => {
    loadTransferHistory();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, statusFilter, typeFilter, transfers]);

  const loadTransferHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getDistributorTransferHistory();
      console.log("Transfer history loaded:", data);
      setTransfers(data.history || []);
      setFilteredTransfers(data.history || []);
    } catch (err) {
      console.error("Error loading transfer history:", err);
      setError(err.detail || "Failed to load transfer history");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...transfers];

    if (searchTerm) {
      filtered = filtered.filter(
        (t) =>
          t.batch_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.from_user.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.to_user.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "ALL") {
      filtered = filtered.filter((t) => t.status === statusFilter);
    }

    const user = JSON.parse(localStorage.getItem("user"));
    const username = user?.username || "";

    if (typeFilter === "INCOMING") {
      filtered = filtered.filter((t) => t.to_user === username);
    } else if (typeFilter === "OUTGOING") {
      filtered = filtered.filter((t) => t.from_user === username);
    }

    setFilteredTransfers(filtered);
  };

  const getStatusBadge = (status) => {
    const styles = {
      PENDING: { bg: "warning", text: "Pending" },
      CONFIRMED: { bg: "success", text: "Confirmed" },
      REJECTED: { bg: "danger", text: "Rejected" },
      CANCELLED: { bg: "secondary", text: "Cancelled" },
    };
    
    const style = styles[status] || { bg: "secondary", text: status };
    
    return <Badge bg={style.bg}>{style.text}</Badge>;
  };

  const getTransferType = (transfer) => {
    const user = JSON.parse(localStorage.getItem("user"));
    const username = user?.username || "";
    
    if (transfer.from_user === username) {
      return <Badge bg="primary">Outgoing</Badge>;
    } else if (transfer.to_user === username) {
      return <Badge bg="info">Incoming</Badge>;
    }
    return <Badge bg="secondary">Unknown</Badge>;
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setStatusFilter("ALL");
    setTypeFilter("ALL");
  };

  const getStats = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    const username = user?.username || "";

    return {
      total: transfers.length,
      incoming: transfers.filter((t) => t.to_user === username).length,
      outgoing: transfers.filter((t) => t.from_user === username).length,
      pending: transfers.filter((t) => t.status === "PENDING").length,
      confirmed: transfers.filter((t) => t.status === "CONFIRMED").length,
    };
  };

  const stats = getStats();

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
          <h2 className="mb-1 fw-bold">Transfer History</h2>
          <p className="text-muted mb-0">View all your transfer transactions</p>
        </div>
        <Button variant="outline-primary" onClick={loadTransferHistory} size="sm">
          Refresh
        </Button>
      </div>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Summary Cards */}
      <Row className="mb-4 g-3">
        <Col lg={2} md={4} sm={6}>
          <Card className="border-0 shadow-sm text-center h-100">
            <Card.Body>
              <h3 className="mb-1 fw-bold">{stats.total}</h3>
              <small className="text-muted text-uppercase" style={{ fontSize: '0.75rem' }}>Total Transfers</small>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={2} md={4} sm={6}>
          <Card className="border-0 shadow-sm text-center h-100">
            <Card.Body>
              <h3 className="mb-1 fw-bold text-info">{stats.incoming}</h3>
              <small className="text-muted text-uppercase" style={{ fontSize: '0.75rem' }}>Incoming</small>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={2} md={4} sm={6}>
          <Card className="border-0 shadow-sm text-center h-100">
            <Card.Body>
              <h3 className="mb-1 fw-bold text-primary">{stats.outgoing}</h3>
              <small className="text-muted text-uppercase" style={{ fontSize: '0.75rem' }}>Outgoing</small>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={3} md={6}>
          <Card className="border-0 shadow-sm text-center h-100">
            <Card.Body>
              <h3 className="mb-1 fw-bold text-warning">{stats.pending}</h3>
              <small className="text-muted text-uppercase" style={{ fontSize: '0.75rem' }}>Pending</small>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={3} md={6}>
          <Card className="border-0 shadow-sm text-center h-100">
            <Card.Body>
              <h3 className="mb-1 fw-bold text-success">{stats.confirmed}</h3>
              <small className="text-muted text-uppercase" style={{ fontSize: '0.75rem' }}>Confirmed</small>
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
                  placeholder="Search by batch ID or user..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col lg={3} md={6}>
              <Form.Group>
                <Form.Label className="fw-semibold small">Type</Form.Label>
                <Form.Select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                >
                  <option value="ALL">All Transfers</option>
                  <option value="INCOMING">Incoming Only</option>
                  <option value="OUTGOING">Outgoing Only</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col lg={3} md={6}>
              <Form.Group>
                <Form.Label className="fw-semibold small">Status</Form.Label>
                <Form.Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="ALL">All Status</option>
                  <option value="PENDING">Pending</option>
                  <option value="CONFIRMED">Confirmed</option>
                  <option value="REJECTED">Rejected</option>
                  <option value="CANCELLED">Cancelled</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col lg={2} md={6}>
              <Button variant="outline-secondary" onClick={handleClearFilters} className="w-100">
                Clear Filters
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Transfer History Table */}
      <Card className="border-0 shadow-sm">
        <Card.Body>
          <div className="mb-3">
            <h5 className="mb-0 fw-bold">Transfer Records ({filteredTransfers.length})</h5>
          </div>

          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th className="fw-semibold">Type</th>
                  <th className="fw-semibold">Transfer ID</th>
                  <th className="fw-semibold">Batch ID</th>
                  <th className="fw-semibold">From</th>
                  <th className="fw-semibold">To</th>
                  <th className="fw-semibold">Quantity</th>
                  <th className="fw-semibold">Status</th>
                  <th className="fw-semibold">Date & Time</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransfers.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center text-muted py-4">
                      No transfer history found
                    </td>
                  </tr>
                ) : (
                  filteredTransfers.map((transfer) => (
                    <tr key={transfer.transfer_id}>
                      <td>{getTransferType(transfer)}</td>
                      <td>
                        <code className="px-2 py-1 bg-light rounded">#{transfer.transfer_id}</code>
                      </td>
                      <td>
                        <code className="px-2 py-1 bg-light rounded">{transfer.batch_id}</code>
                      </td>
                      <td className="fw-semibold">{transfer.from_user}</td>
                      <td className="fw-semibold">{transfer.to_user}</td>
                      <td>
                        <Badge bg="secondary">{transfer.quantity} units</Badge>
                      </td>
                      <td>{getStatusBadge(transfer.status)}</td>
                      <td className="text-muted small">{formatTimestamp(transfer.timestamp)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card.Body>
      </Card>

      {/* Legend */}
      <Card className="border-0 shadow-sm mt-4 bg-light">
        <Card.Body>
          <h6 className="mb-3 fw-bold">Transfer Status Guide</h6>
          <Row className="g-3">
            <Col md={3}>
              <p className="mb-0">
                {getStatusBadge("PENDING")} - Awaiting confirmation
              </p>
            </Col>
            <Col md={3}>
              <p className="mb-0">
                {getStatusBadge("CONFIRMED")} - Successfully completed
              </p>
            </Col>
            <Col md={3}>
              <p className="mb-0">
                {getStatusBadge("REJECTED")} - Transfer declined
              </p>
            </Col>
            <Col md={3}>
              <p className="mb-0">
                {getStatusBadge("CANCELLED")} - Transfer cancelled
              </p>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </DistributorLayout>
  );
}