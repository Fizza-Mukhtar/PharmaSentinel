import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Spinner,
  Alert,
  ProgressBar,
  Badge,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaChartLine,
  FaBoxes,
  FaExchangeAlt,
  FaWarehouse,
  FaSync,
} from "react-icons/fa";

import ManufacturerLayout from "../../../components/manufacturer/ManufacturerLayout";
import { fetchDashboardStats, fetchBatches } from "../../../services/api";

export default function Analytics() {
  const navigate = useNavigate();

  const [username] = useState(
    JSON.parse(localStorage.getItem("user"))?.username || "Manufacturer"
  );

  const [stats, setStats] = useState(null);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsData, batchesData] = await Promise.all([
        fetchDashboardStats(),
        fetchBatches(),
      ]);

      setStats(statsData);
      setBatches(batchesData || []);
    } catch (err) {
      console.error("Failed to load analytics:", err);
      setError("Failed to load analytics data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const totalQuantity = batches.reduce((sum, b) => sum + (b.quantity || 0), 0);

  const remainingQuantity = batches.reduce(
    (sum, b) => sum + (b.remaining_quantity || 0),
    0
  );

  const transferredQuantity = totalQuantity - remainingQuantity;

  const transferPercentage =
    totalQuantity > 0
      ? ((transferredQuantity / totalQuantity) * 100).toFixed(1)
      : 0;

  const batchesByStatus = {
    inStock: batches.filter((b) => b.remaining_quantity > 0).length,
    fullyTransferred: batches.filter((b) => b.remaining_quantity === 0).length,
  };

  if (loading) {
    return (
      <ManufacturerLayout active="analytics">
        <Container
          fluid
          className="py-4 d-flex justify-content-center align-items-center"
          style={{ minHeight: "60vh" }}
        >
          <div className="text-center">
            <Spinner animation="border" variant="primary" />
            <p className="text-muted mt-3">Loading analytics...</p>
          </div>
        </Container>
      </ManufacturerLayout>
    );
  }

  return (
    <ManufacturerLayout active="analytics">
      <Container fluid className="py-4">
        {/* HEADER */}
        <Row className="align-items-center mb-4">
          <Col>
            <Button
              variant="link"
              className="text-primary p-0 mb-2 text-decoration-none"
              onClick={() => navigate("/dashboard/manufacturer")}
            >
              <FaArrowLeft className="me-2" />
              Back to Dashboard
            </Button>

            <h2 className="mb-1 fw-bold">
              <FaChartLine className="me-2" />
              Analytics Dashboard
            </h2>

            <p className="text-muted mb-0">
              View detailed insights about your batches and transfers
            </p>
          </Col>

          <Col xs="auto">
            <Button variant="outline-primary" onClick={loadData}>
              <FaSync className="me-2" />
              Refresh Data
            </Button>
          </Col>
        </Row>

        {error && (
          <Alert variant="danger" dismissible onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* OVERVIEW STATS */}
        <Row className="mb-4 g-3">
          <Col md={6} lg={3}>
            <Card className="border-0 shadow-sm h-100">
              <Card.Body className="text-center p-4">
                <div
                  className="d-inline-flex align-items-center justify-content-center rounded-circle bg-primary bg-opacity-10 mb-3"
                  style={{ width: "64px", height: "64px" }}
                >
                  <FaBoxes className="text-primary" size={32} />
                </div>
                <div className="fs-2 fw-bold text-dark mb-1">
                  {stats?.total_batches || 0}
                </div>
                <div className="text-muted small">Total Batches</div>
              </Card.Body>
            </Card>
          </Col>

          <Col md={6} lg={3}>
            <Card className="border-0 shadow-sm h-100">
              <Card.Body className="text-center p-4">
                <div
                  className="d-inline-flex align-items-center justify-content-center rounded-circle bg-success bg-opacity-10 mb-3"
                  style={{ width: "64px", height: "64px" }}
                >
                  <FaWarehouse className="text-success" size={32} />
                </div>
                <div className="fs-2 fw-bold text-dark mb-1">
                  {totalQuantity.toLocaleString()}
                </div>
                <div className="text-muted small">Total Units Produced</div>
              </Card.Body>
            </Card>
          </Col>

          <Col md={6} lg={3}>
            <Card className="border-0 shadow-sm h-100">
              <Card.Body className="text-center p-4">
                <div
                  className="d-inline-flex align-items-center justify-content-center rounded-circle bg-warning bg-opacity-10 mb-3"
                  style={{ width: "64px", height: "64px" }}
                >
                  <FaExchangeAlt className="text-warning" size={32} />
                </div>
                <div className="fs-2 fw-bold text-dark mb-1">
                  {transferredQuantity.toLocaleString()}
                </div>
                <div className="text-muted small">Units Transferred</div>
              </Card.Body>
            </Card>
          </Col>

          <Col md={6} lg={3}>
            <Card className="border-0 shadow-sm h-100">
              <Card.Body className="text-center p-4">
                <div
                  className="d-inline-flex align-items-center justify-content-center rounded-circle bg-info bg-opacity-10 mb-3"
                  style={{ width: "64px", height: "64px" }}
                >
                  <FaBoxes className="text-info" size={32} />
                </div>
                <div className="fs-2 fw-bold text-dark mb-1">
                  {remainingQuantity.toLocaleString()}
                </div>
                <div className="text-muted small">Units in Stock</div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* TRANSFER RATE & DISTRIBUTION */}
        <Row className="mb-4 g-3">
          <Col md={6}>
            <Card className="border-0 shadow-sm h-100">
              <Card.Body className="p-4">
                <h5 className="fw-bold mb-4">Transfer Rate</h5>

                <div className="mb-3">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="text-muted small">Overall Progress</span>
                    <span className="fw-bold">{transferPercentage}%</span>
                  </div>
                  <ProgressBar
                    now={transferPercentage}
                    variant="success"
                    style={{ height: "12px" }}
                  />
                </div>

                <div className="bg-light p-3 rounded">
                  <Row className="text-center">
                    <Col xs={6} className="border-end">
                      <div className="fw-bold text-success fs-5">
                        {transferredQuantity.toLocaleString()}
                      </div>
                      <small className="text-muted">Transferred</small>
                    </Col>
                    <Col xs={6}>
                      <div className="fw-bold text-primary fs-5">
                        {totalQuantity.toLocaleString()}
                      </div>
                      <small className="text-muted">Total</small>
                    </Col>
                  </Row>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col md={6}>
            <Card className="border-0 shadow-sm h-100">
              <Card.Body className="p-4">
                <h5 className="fw-bold mb-4">Batch Status Distribution</h5>

                <Row className="text-center g-3">
                  <Col xs={6}>
                    <Card className="bg-success bg-opacity-10 border-0">
                      <Card.Body className="p-3">
                        <div className="fs-1 fw-bold text-success mb-1">
                          {batchesByStatus.inStock}
                        </div>
                        <div className="text-muted small">In Stock</div>
                      </Card.Body>
                    </Card>
                  </Col>

                  <Col xs={6}>
                    <Card className="bg-secondary bg-opacity-10 border-0">
                      <Card.Body className="p-3">
                        <div className="fs-1 fw-bold text-secondary mb-1">
                          {batchesByStatus.fullyTransferred}
                        </div>
                        <div className="text-muted small">Fully Transferred</div>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>

                <div className="mt-3">
                  <ProgressBar style={{ height: "8px" }}>
                    <ProgressBar
                      variant="success"
                      now={
                        (batchesByStatus.inStock / batches.length) * 100 || 0
                      }
                      key={1}
                    />
                    <ProgressBar
                      variant="secondary"
                      now={
                        (batchesByStatus.fullyTransferred / batches.length) *
                          100 || 0
                      }
                      key={2}
                    />
                  </ProgressBar>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* RECENT BATCHES */}
        <Row>
          <Col>
            <Card className="border-0 shadow-sm">
              <Card.Header className="bg-white border-bottom py-3">
                <h5 className="mb-0 fw-bold">Recent Batches</h5>
              </Card.Header>
              <Card.Body className="p-0">
                {batches.length === 0 ? (
                  <div className="text-center py-5">
                    <FaBoxes size={48} className="text-muted mb-3" />
                    <h5 className="text-muted">No batches found</h5>
                    <p className="text-muted mb-3">
                      Create your first batch to see analytics
                    </p>
                    <Button
                      variant="primary"
                      onClick={() =>
                        navigate("/dashboard/manufacturer/batches")
                      }
                    >
                      <FaBoxes className="me-2" />
                      Create Batch
                    </Button>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover mb-0 align-middle">
                      <thead className="table-light">
                        <tr>
                          <th className="border-0">Batch ID</th>
                          <th className="border-0">Medicine Name</th>
                          <th className="border-0">Total Quantity</th>
                          <th className="border-0">Remaining</th>
                          <th className="border-0">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {batches.slice(0, 10).map((batch) => (
                          <tr key={batch.batch_id}>
                            <td>
                              <code className="bg-light px-2 py-1 rounded">
                                {batch.batch_id}
                              </code>
                            </td>
                            <td className="fw-semibold">{batch.name}</td>
                            <td>{batch.quantity}</td>
                            <td>
                              <Badge
                                bg={
                                  batch.remaining_quantity > 0
                                    ? "success"
                                    : "secondary"
                                }
                              >
                                {batch.remaining_quantity}
                              </Badge>
                            </td>
                            <td>
                              <Badge
                                bg={
                                  batch.remaining_quantity > 0
                                    ? "success"
                                    : "secondary"
                                }
                              >
                                {batch.remaining_quantity > 0
                                  ? "In Stock"
                                  : "Transferred"}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card.Body>
              {batches.length > 10 && (
                <Card.Footer className="bg-white border-top text-center py-3">
                  <Button
                    variant="link"
                    className="text-decoration-none"
                    onClick={() => navigate("/dashboard/manufacturer/batches")}
                  >
                    View All Batches
                  </Button>
                </Card.Footer>
              )}
            </Card>
          </Col>
        </Row>
      </Container>
    </ManufacturerLayout>
  );
}