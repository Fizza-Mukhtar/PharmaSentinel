import React, { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Button,
  Spinner,
  Card,
  Alert,
  Table,
  Form,
  Badge,
  Modal,
  InputGroup,
  ProgressBar,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import {
  FaPlus,
  FaSync,
  FaExchangeAlt,
  FaBoxes,
  FaFileExport,
  FaQrcode,
  FaSearch,
  FaDownload,
  FaChartLine,
  FaWarehouse,
  FaShippingFast,
  FaExclamationTriangle,
  FaCheckCircle,
  FaClock,
  FaArrowRight,
} from "react-icons/fa";

import ManufacturerLayout from "../../../components/manufacturer/ManufacturerLayout";
import CreateBatchModal from "../../../components/CreateBatchModal";
import { fetchDashboardStats } from "../../../services/api";

export default function ManufacturerDashboard() {
  const navigate = useNavigate();

  const [username] = useState(
    JSON.parse(localStorage.getItem("user"))?.username || "Manufacturer"
  );

  const [showCreate, setShowCreate] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [expiryFilter, setExpiryFilter] = useState("ALL");

  const [showQrModal, setShowQrModal] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState(null);

  // Load Dashboard Data
  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchDashboardStats();
      setDashboardData(data);
    } catch (err) {
      console.error("Failed to load dashboard:", err);
      setError("Failed to load dashboard data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Export CSV
  const handleExportCSV = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const token = user?.access;

      if (!token) {
        setError("Authentication required. Please login again.");
        return;
      }

      const response = await fetch(
        "http://192.168.100.100:8000/medicine/api/export_batches_csv/",
        {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) throw new Error(`Export failed: ${response.status}`);

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `batches_${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }, 100);
    } catch (err) {
      console.error("Export error:", err);
      setError("Failed to export CSV. Please try again.");
    }
  };

  // Filter Batches
  const getFilteredBatches = () => {
    if (!dashboardData?.batches) return [];

    return dashboardData.batches.filter((batch) => {
      const matchesSearch =
        batch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        batch.batch_id.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "ALL" || batch.batch_status === statusFilter;

      const matchesExpiry =
        expiryFilter === "ALL" || batch.expiry_status === expiryFilter;

      return matchesSearch && matchesStatus && matchesExpiry;
    });
  };

  const filteredBatches = getFilteredBatches();

  // Get Badge Variants
  const getExpiryBadge = (status) => {
    const map = {
      EXPIRED: { bg: "danger", text: "Expired" },
      EXPIRING_SOON: { bg: "warning", text: "Expiring Soon" },
      SAFE: { bg: "success", text: "Safe" },
      UNKNOWN: { bg: "secondary", text: "Unknown" },
    };
    return map[status] || map.UNKNOWN;
  };

  const getBatchStatusBadge = (status) => {
    const map = {
      ACTIVE: { bg: "success", text: "Active" },
      EXHAUSTED: { bg: "secondary", text: "Exhausted" },
      EXPIRED: { bg: "danger", text: "Expired" },
    };
    return map[status] || { bg: "secondary", text: status };
  };

  // Calculate Stats
  const stats = dashboardData
    ? {
        totalBatches: dashboardData.total_batches || 0,
        totalManufactured: dashboardData.total_manufactured || 0,
        remainingWithMe: dashboardData.remaining_with_me || 0,
        totalTransferred: dashboardData.total_transferred || 0,
        lowStockBatches:
          dashboardData.batches?.filter((b) => b.low_stock).length || 0,
        expiringBatches:
          dashboardData.batches?.filter((b) => b.expiry_status === "EXPIRING_SOON")
            .length || 0,
      }
    : null;

  const transferPercentage = stats?.totalManufactured
    ? ((stats.totalTransferred / stats.totalManufactured) * 100).toFixed(1)
    : 0;

  return (
    <ManufacturerLayout active="dashboard">
      <Container fluid className="py-4">
        {/* HEADER */}
        <Row className="align-items-center mb-4">
          <Col>
            <h2 className="fw-bold mb-1">Welcome back, {username}</h2>
            <p className="text-muted mb-0">
              Here's what's happening with your medicine batches today
            </p>
          </Col>

          <Col xs="auto" className="d-flex gap-2 flex-wrap">
            <Button size="sm" variant="outline-secondary" onClick={loadData}>
              {loading ? <Spinner size="sm" animation="border" /> : <FaSync />}
            </Button>

            <Button size="sm" variant="success" onClick={handleExportCSV}>
              <FaFileExport className="me-1" /> Export CSV
            </Button>

            <Button size="sm" variant="primary" onClick={() => setShowCreate(true)}>
              <FaPlus className="me-1" /> Create Batch
            </Button>
          </Col>
        </Row>

        {/* ERROR ALERT */}
        {error && (
          <Alert variant="danger" dismissible onClose={() => setError(null)}>
            <FaExclamationTriangle className="me-2" />
            {error}
          </Alert>
        )}

        {/* LOADING STATE */}
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <p className="text-muted mt-3">Loading dashboard...</p>
          </div>
        ) : (
          <>
            {/* STATS CARDS */}
            <Row className="mb-4 g-3">
              <Col md={6} lg={3}>
                <Card className="border-0 shadow-sm h-100">
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <div className="text-muted small mb-1">Total Batches</div>
                        <h3 className="fw-bold mb-0">{stats.totalBatches}</h3>
                      </div>
                      <div
                        className="rounded-circle d-flex align-items-center justify-content-center"
                        style={{
                          width: "48px",
                          height: "48px",
                          backgroundColor: "#e7f3ff",
                        }}
                      >
                        <FaBoxes className="text-primary" size={24} />
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>

              <Col md={6} lg={3}>
                <Card className="border-0 shadow-sm h-100">
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <div className="text-muted small mb-1">
                          Total Manufactured
                        </div>
                        <h3 className="fw-bold mb-0">
                          {stats.totalManufactured.toLocaleString()}
                        </h3>
                        <small className="text-muted">units</small>
                      </div>
                      <div
                        className="rounded-circle d-flex align-items-center justify-content-center"
                        style={{
                          width: "48px",
                          height: "48px",
                          backgroundColor: "#e8f5e9",
                        }}
                      >
                        <FaWarehouse className="text-success" size={24} />
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>

              <Col md={6} lg={3}>
                <Card className="border-0 shadow-sm h-100">
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <div className="text-muted small mb-1">
                          Remaining With Me
                        </div>
                        <h3 className="fw-bold mb-0">
                          {stats.remainingWithMe.toLocaleString()}
                        </h3>
                        <small className="text-muted">units in stock</small>
                      </div>
                      <div
                        className="rounded-circle d-flex align-items-center justify-content-center"
                        style={{
                          width: "48px",
                          height: "48px",
                          backgroundColor: "#fff3e0",
                        }}
                      >
                        <FaBoxes className="text-warning" size={24} />
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>

              <Col md={6} lg={3}>
                <Card className="border-0 shadow-sm h-100">
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <div className="text-muted small mb-1">
                          Total Transferred
                        </div>
                        <h3 className="fw-bold mb-0">
                          {stats.totalTransferred.toLocaleString()}
                        </h3>
                        <small className="text-muted">
                          {transferPercentage}% of total
                        </small>
                      </div>
                      <div
                        className="rounded-circle d-flex align-items-center justify-content-center"
                        style={{
                          width: "48px",
                          height: "48px",
                          backgroundColor: "#f3e5f5",
                        }}
                      >
                        <FaShippingFast className="text-info" size={24} />
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            {/* ALERTS ROW */}
            {(stats.lowStockBatches > 0 || stats.expiringBatches > 0) && (
              <Row className="mb-4 g-3">
                {stats.lowStockBatches > 0 && (
                  <Col md={6}>
                    <Alert variant="warning" className="mb-0 border-0 shadow-sm">
                      <div className="d-flex align-items-center">
                        <FaExclamationTriangle className="me-2" size={24} />
                        <div className="flex-grow-1">
                          <strong>{stats.lowStockBatches}</strong> batch(es) have
                          low stock
                        </div>
                      </div>
                    </Alert>
                  </Col>
                )}

                {stats.expiringBatches > 0 && (
                  <Col md={6}>
                    <Alert variant="danger" className="mb-0 border-0 shadow-sm">
                      <div className="d-flex align-items-center">
                        <FaClock className="me-2" size={24} />
                        <div className="flex-grow-1">
                          <strong>{stats.expiringBatches}</strong> batch(es)
                          expiring soon
                        </div>
                      </div>
                    </Alert>
                  </Col>
                )}
              </Row>
            )}

            {/* QUICK ACTIONS */}
            <Row className="mb-4 g-3">
              <Col md={3}>
                <Card
                  className="border-0 shadow-sm h-100 hover-card"
                  role="button"
                  onClick={() => navigate("/dashboard/manufacturer/batches")}
                  style={{ cursor: "pointer", transition: "transform 0.2s" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.transform = "translateY(-2px)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.transform = "translateY(0)")
                  }
                >
                  <Card.Body className="text-center p-4">
                    <FaBoxes size={32} className="text-primary mb-3" />
                    <h6 className="fw-bold mb-1">View All Batches</h6>
                    <p className="text-muted small mb-0">
                      See complete batch list
                    </p>
                  </Card.Body>
                </Card>
              </Col>

              <Col md={3}>
                <Card
                  className="border-0 shadow-sm h-100"
                  role="button"
                  onClick={() => navigate("/dashboard/manufacturer/transfer")}
                  style={{ cursor: "pointer", transition: "transform 0.2s" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.transform = "translateY(-2px)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.transform = "translateY(0)")
                  }
                >
                  <Card.Body className="text-center p-4">
                    <FaExchangeAlt size={32} className="text-success mb-3" />
                    <h6 className="fw-bold mb-1">Transfer Batch</h6>
                    <p className="text-muted small mb-0">
                      Send to distributors
                    </p>
                  </Card.Body>
                </Card>
              </Col>

              <Col md={3}>
                <Card
                  className="border-0 shadow-sm h-100"
                  role="button"
                  onClick={() => navigate("/dashboard/manufacturer/analytics")}
                  style={{ cursor: "pointer", transition: "transform 0.2s" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.transform = "translateY(-2px)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.transform = "translateY(0)")
                  }
                >
                  <Card.Body className="text-center p-4">
                    <FaChartLine size={32} className="text-info mb-3" />
                    <h6 className="fw-bold mb-1">Analytics</h6>
                    <p className="text-muted small mb-0">View insights</p>
                  </Card.Body>
                </Card>
              </Col>

              <Col md={3}>
                <Card
                  className="border-0 shadow-sm h-100"
                  role="button"
                  onClick={() => setShowCreate(true)}
                  style={{ cursor: "pointer", transition: "transform 0.2s" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.transform = "translateY(-2px)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.transform = "translateY(0)")
                  }
                >
                  <Card.Body className="text-center p-4">
                    <FaPlus size={32} className="text-warning mb-3" />
                    <h6 className="fw-bold mb-1">Create New Batch</h6>
                    <p className="text-muted small mb-0">Add medicine batch</p>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            {/* BATCH TABLE */}
            <Card className="border-0 shadow-sm">
              <Card.Header className="bg-white border-bottom py-3">
                <Row className="align-items-center g-2">
                  <Col>
                    <h5 className="mb-0 fw-bold">Recent Batches</h5>
                  </Col>
                  <Col xs="auto">
                    <InputGroup size="sm" style={{ width: "250px" }}>
                      <InputGroup.Text className="bg-white border-end-0">
                        <FaSearch className="text-muted" />
                      </InputGroup.Text>
                      <Form.Control
                        placeholder="Search batches..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="border-start-0"
                      />
                    </InputGroup>
                  </Col>
                  <Col xs="auto">
                    <Form.Select
                      size="sm"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      style={{ width: "150px" }}
                    >
                      <option value="ALL">All Status</option>
                      <option value="ACTIVE">Active</option>
                      <option value="EXHAUSTED">Exhausted</option>
                      <option value="EXPIRED">Expired</option>
                    </Form.Select>
                  </Col>
                  <Col xs="auto">
                    <Form.Select
                      size="sm"
                      value={expiryFilter}
                      onChange={(e) => setExpiryFilter(e.target.value)}
                      style={{ width: "150px" }}
                    >
                      <option value="ALL">All Expiry</option>
                      <option value="SAFE">Safe</option>
                      <option value="EXPIRING_SOON">Expiring Soon</option>
                      <option value="EXPIRED">Expired</option>
                    </Form.Select>
                  </Col>
                </Row>
              </Card.Header>

              <Card.Body className="p-0">
                <div className="table-responsive">
                  <Table hover className="mb-0 align-middle">
                    <thead className="table-light">
                      <tr>
                        <th className="border-0 ps-4">Batch ID</th>
                        <th className="border-0">Medicine Name</th>
                        <th className="border-0">Manufactured</th>
                        <th className="border-0">Remaining</th>
                        <th className="border-0">Distributed</th>
                        <th className="border-0">Expiry</th>
                        <th className="border-0">Status</th>
                        <th className="border-0 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredBatches.length === 0 ? (
                        <tr>
                          <td colSpan="8" className="text-center text-muted py-5">
                            <FaBoxes size={48} className="mb-3 opacity-25" />
                            <div>No batches found</div>
                            {searchTerm && (
                              <small className="text-muted">
                                Try adjusting your search or filters
                              </small>
                            )}
                          </td>
                        </tr>
                      ) : (
                        filteredBatches.slice(0, 10).map((batch) => {
                          const expiryBadge = getExpiryBadge(batch.expiry_status);
                          const statusBadge = getBatchStatusBadge(
                            batch.batch_status
                          );
                          const distributionPercent = batch.total_manufactured
                            ? (
                                (batch.total_distributed /
                                  batch.total_manufactured) *
                                100
                              ).toFixed(0)
                            : 0;

                          return (
                            <tr key={batch.batch_id}>
                              <td className="ps-4">
                                <code className="bg-light px-2 py-1 rounded small">
                                  {batch.batch_id}
                                </code>
                              </td>
                              <td>
                                <div className="fw-semibold">{batch.name}</div>
                                {batch.low_stock && (
                                  <Badge bg="warning" className="small mt-1">
                                    <FaExclamationTriangle className="me-1" />
                                    Low Stock
                                  </Badge>
                                )}
                              </td>
                              <td>
                                <strong>{batch.total_manufactured}</strong>
                              </td>
                              <td>
                                <Badge
                                  bg={
                                    batch.remaining_with_me > 0
                                      ? "success"
                                      : "secondary"
                                  }
                                  className="px-2 py-1"
                                >
                                  {batch.remaining_with_me}
                                </Badge>
                              </td>
                              <td>
                                <div className="d-flex align-items-center gap-2">
                                  <small className="text-muted">
                                    {batch.total_distributed}
                                  </small>
                                  <div style={{ width: "60px" }}>
                                    <ProgressBar
                                      now={distributionPercent}
                                      variant="info"
                                      style={{ height: "4px" }}
                                    />
                                  </div>
                                  <small className="text-muted">
                                    {distributionPercent}%
                                  </small>
                                </div>
                              </td>
                              <td>
                                <Badge bg={expiryBadge.bg}>
                                  {expiryBadge.text}
                                </Badge>
                              </td>
                              <td>
                                <Badge bg={statusBadge.bg}>
                                  {statusBadge.text}
                                </Badge>
                              </td>
                              <td className="text-center">
                                {batch.qr_code_url && (
                                  <Button
                                    variant="outline-primary"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedBatch(batch);
                                      setShowQrModal(true);
                                    }}
                                  >
                                    <FaQrcode />
                                  </Button>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </Table>
                </div>
              </Card.Body>

              {filteredBatches.length > 10 && (
                <Card.Footer className="bg-white border-top text-center py-3">
                  <Button
                    variant="link"
                    className="text-decoration-none"
                    onClick={() => navigate("/dashboard/manufacturer/batches")}
                  >
                    View All {filteredBatches.length} Batches{" "}
                    <FaArrowRight className="ms-1" />
                  </Button>
                </Card.Footer>
              )}

              {filteredBatches.length > 0 && filteredBatches.length <= 10 && (
                <Card.Footer className="bg-white border-top">
                  <div className="d-flex justify-content-between align-items-center">
                    <small className="text-muted">
                      Showing {filteredBatches.length} of{" "}
                      {dashboardData.batches.length} batches
                    </small>
                    <Button
                      variant="link"
                      size="sm"
                      className="text-decoration-none"
                      onClick={() =>
                        navigate("/dashboard/manufacturer/batches")
                      }
                    >
                      View All Batches
                    </Button>
                  </div>
                </Card.Footer>
              )}
            </Card>
          </>
        )}
      </Container>

      {/* CREATE BATCH MODAL */}
      <CreateBatchModal
        show={showCreate}
        onHide={() => setShowCreate(false)}
        onCreated={loadData}
      />

      {/* QR CODE MODAL */}
      <Modal
        show={showQrModal}
        onHide={() => setShowQrModal(false)}
        centered
        size="md"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <FaQrcode className="me-2" />
            QR Code - {selectedBatch?.batch_id}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center p-4">
          {selectedBatch?.qr_code_url && (
            <div>
              <img
                src={selectedBatch.qr_code_url}
                alt="QR Code"
                className="img-fluid border rounded p-3 mb-3"
                style={{ maxWidth: "300px" }}
              />
              <h6 className="fw-bold">{selectedBatch.name}</h6>
              <p className="text-muted small mb-3">
                Batch ID: {selectedBatch.batch_id}
              </p>
              <div className="bg-light p-3 rounded">
                <small className="text-muted d-block mb-1">
                  Verification URL
                </small>
                <code className="small text-break">
                  {selectedBatch.qr_code_url}
                </code>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowQrModal(false)}>
            Close
          </Button>
          <Button variant="primary">
            <FaDownload className="me-2" />
            Download QR
          </Button>
        </Modal.Footer>
      </Modal>
    </ManufacturerLayout>
  );
}