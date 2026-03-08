// src/pages/shopkeeper/ShopkeeperTransferHistory.js
import React, { useState, useEffect } from "react";
import { Row, Col, Card, Form, Button, Spinner, Badge, Table } from "react-bootstrap";
import ShopkeeperLayout from "../../../components/shopkeeper/ShopkeeperLayout";
import { getShopkeeperTransferHistory, exportShopkeeperIncomingCSV } from "../../../services/api";

export default function ShopkeeperTransferHistory() {
  const [loading, setLoading] = useState(true);
  const [transfers, setTransfers] = useState([]);
  const [exporting, setExporting] = useState(false);
  
  const [searchBatch, setSearchBatch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [dateFrom, setDateFrom] = useState("");

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const response = await getShopkeeperTransferHistory();
      setTransfers(response.transfer_history || []);
    } catch (error) {
      console.error("Failed to load history:", error);
      alert("Failed to load transfer history");
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setSearchBatch("");
    setStatusFilter("All");
    setDateFrom("");
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const blob = await exportShopkeeperIncomingCSV();
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "shopkeeper_transfer_history.csv");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Export failed:", error);
      alert("Failed to export transfer history");
    } finally {
      setExporting(false);
    }
  };

  const filteredTransfers = transfers.filter((transfer) => {
    if (searchBatch && !transfer.batch_id.toLowerCase().includes(searchBatch.toLowerCase())) {
      return false;
    }
    if (statusFilter !== "All" && transfer.status !== statusFilter) {
      return false;
    }
    if (dateFrom) {
      const transferDate = new Date(transfer.timestamp);
      const fromDate = new Date(dateFrom);
      if (transferDate < fromDate) return false;
    }
    return true;
  });

  const totalTransfers = filteredTransfers.length;
  const confirmedCount = filteredTransfers.filter(t => t.status === "CONFIRMED").length;
  const pendingCount = filteredTransfers.filter(t => t.status === "PENDING").length;
  const rejectedCount = filteredTransfers.filter(t => t.status === "REJECTED").length;

  const getStatusBadge = (status) => {
    switch (status) {
      case "CONFIRMED":
        return <Badge bg="success"><i className="bi bi-check-circle me-1"></i>Confirmed</Badge>;
      case "PENDING":
        return <Badge bg="warning"><i className="bi bi-clock-history me-1"></i>Pending</Badge>;
      case "REJECTED":
        return <Badge bg="danger"><i className="bi bi-x-circle me-1"></i>Rejected</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <ShopkeeperLayout>
        <div className="text-center py-5">
          <Spinner animation="border" variant="success" />
          <p className="mt-3 text-muted">Loading transfer history...</p>
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
            <i className="bi bi-clock-history me-2" style={{ color: "#10b981" }}></i>
            Transfer History
          </h2>
          <p className="text-muted mb-0">View all incoming transfer records</p>
        </div>
        <div className="d-flex gap-2">
          <Button
            variant="success"
            onClick={handleExport}
            disabled={exporting || filteredTransfers.length === 0}
          >
            {exporting ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Exporting...
              </>
            ) : (
              <>
                <i className="bi bi-download me-2"></i>
                Export CSV
              </>
            )}
          </Button>
          <Button variant="outline-secondary" onClick={loadHistory}>
            <i className="bi bi-arrow-clockwise me-2"></i>
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="border-0 shadow-sm" style={{ borderLeft: "4px solid #6b7280" }}>
            <Card.Body className="text-center">
              <div style={{ fontSize: "2rem", color: "#6b7280", marginBottom: "0.5rem" }}>
                <i className="bi bi-box-seam"></i>
              </div>
              <h3 className="mb-0 fw-bold" style={{ color: "#6b7280" }}>
                {totalTransfers}
              </h3>
              <small className="text-muted">Total Transfers</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm" style={{ borderLeft: "4px solid #10b981" }}>
            <Card.Body className="text-center">
              <div style={{ fontSize: "2rem", color: "#10b981", marginBottom: "0.5rem" }}>
                <i className="bi bi-check-circle"></i>
              </div>
              <h3 className="mb-0 fw-bold" style={{ color: "#10b981" }}>
                {confirmedCount}
              </h3>
              <small className="text-muted">Confirmed</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm" style={{ borderLeft: "4px solid #f59e0b" }}>
            <Card.Body className="text-center">
              <div style={{ fontSize: "2rem", color: "#f59e0b", marginBottom: "0.5rem" }}>
                <i className="bi bi-clock-history"></i>
              </div>
              <h3 className="mb-0 fw-bold" style={{ color: "#f59e0b" }}>
                {pendingCount}
              </h3>
              <small className="text-muted">Pending</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm" style={{ borderLeft: "4px solid #ef4444" }}>
            <Card.Body className="text-center">
              <div style={{ fontSize: "2rem", color: "#ef4444", marginBottom: "0.5rem" }}>
                <i className="bi bi-x-circle"></i>
              </div>
              <h3 className="mb-0 fw-bold" style={{ color: "#ef4444" }}>
                {rejectedCount}
              </h3>
              <small className="text-muted">Rejected</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card className="border-0 shadow-sm mb-4">
        <Card.Body>
          <h6 className="mb-3 fw-semibold" style={{ color: "#10b981" }}>
            <i className="bi bi-funnel me-2"></i>
            Filter Transfers
          </h6>
          <Row className="align-items-end">
            <Col md={4}>
              <Form.Group>
                <Form.Label className="fw-semibold small">Batch ID</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Search by batch ID..."
                  value={searchBatch}
                  onChange={(e) => setSearchBatch(e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label className="fw-semibold small">Status</Form.Label>
                <Form.Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <option>All</option>
                  <option value="CONFIRMED">Confirmed</option>
                  <option value="PENDING">Pending</option>
                  <option value="REJECTED">Rejected</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label className="fw-semibold small">From Date</Form.Label>
                <Form.Control
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
              </Form.Group>
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

      {/* Transfer Table */}
      <Card className="border-0 shadow-sm">
        <Card.Body>
          <h5 className="mb-3 fw-semibold" style={{ color: "#10b981" }}>
            <i className="bi bi-list-check me-2"></i>
            Transfer Records ({filteredTransfers.length})
          </h5>

          {filteredTransfers.length > 0 ? (
            <div className="table-responsive">
              <Table hover>
                <thead style={{ backgroundColor: "#f9fafb" }}>
                  <tr>
                    <th>Transfer ID</th>
                    <th>Date & Time</th>
                    <th>Batch ID</th>
                    <th>Medicine Name</th>
                    <th>From</th>
                    <th>Quantity</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransfers.map((transfer) => (
                    <tr key={transfer.transfer_id}>
                      <td>
                        <code className="px-2 py-1" style={{ backgroundColor: "#f3f4f6", borderRadius: "4px" }}>
                          #{transfer.transfer_id}
                        </code>
                      </td>
                      <td>
                        <div>
                          <div className="fw-semibold">
                            {new Date(transfer.timestamp).toLocaleDateString()}
                          </div>
                          <small className="text-muted">
                            {new Date(transfer.timestamp).toLocaleTimeString()}
                          </small>
                        </div>
                      </td>
                      <td>
                        <code className="px-2 py-1" style={{ backgroundColor: "#e0f2fe", borderRadius: "4px" }}>
                          {transfer.batch_id}
                        </code>
                      </td>
                      <td className="fw-semibold">{transfer.medicine_name}</td>
                      <td>
                        <div>
                          <div className="fw-semibold">{transfer.from_user}</div>
                          <Badge bg="secondary" className="small">
                            {transfer.from_role}
                          </Badge>
                        </div>
                      </td>
                      <td>
                        <Badge bg="primary">{transfer.quantity} units</Badge>
                      </td>
                      <td>{getStatusBadge(transfer.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-5">
              <i className="bi bi-clock-history" style={{ fontSize: "4rem", color: "#d1d5db" }}></i>
              <h5 className="text-muted mt-3">No transfers found</h5>
              <p className="text-muted small">
                {searchBatch || statusFilter !== "All" || dateFrom
                  ? "Try adjusting your filters"
                  : "Transfer history will appear here"}
              </p>
            </div>
          )}
        </Card.Body>
      </Card>
    </ShopkeeperLayout>
  );
}