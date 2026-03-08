import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Button,
  Card,
  Spinner,
  Modal,
  Badge,
  Alert,
  Table,
  Form,
  Pagination,
  InputGroup,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaPlus,
  FaSync,
  FaQrcode,
  FaShieldAlt,
  FaSearch,
  FaDownload,
  FaExclamationTriangle,
} from "react-icons/fa";

import ManufacturerLayout from "../../../components/manufacturer/ManufacturerLayout";
import CreateBatchModal from "../../../components/CreateBatchModal";
import { fetchBatches, fetchDashboardStats } from "../../../services/api";

export default function ViewBatches() {
  const navigate = useNavigate();

  const [batches, setBatches] = useState([]);
  const [stats, setStats] = useState({
    total_batches: 0,
    in_stock: 0,
    transferred: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showCreate, setShowCreate] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedBatchQR, setSelectedBatchQR] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const batchesPerPage = 10;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [batchData] = await Promise.all([
        fetchBatches(),
        fetchDashboardStats(),
      ]);

      setBatches(batchData || []);

      setStats({
        total_batches: batchData.length,
        in_stock: batchData.reduce(
          (sum, b) =>
            sum + (b.remaining_with_me ?? b.remaining_quantity ?? 0),
          0
        ),
        transferred: batchData.filter(
          (b) =>
            (b.remaining_with_me ?? b.remaining_quantity ?? 0) === 0
        ).length,
      });
    } catch (err) {
      console.error(err);
      setError(err.detail || "Failed to load batches or stats");
    } finally {
      setLoading(false);
    }
  };

  const handleViewQR = (batch) => {
    setSelectedBatchQR(batch);
    setShowQRModal(true);
  };

  const getBatchStatusBadge = (status) => {
    switch (status) {
      case "ACTIVE":
        return <Badge bg="success">Active</Badge>;
      case "EXHAUSTED":
        return <Badge bg="warning">Exhausted</Badge>;
      case "EXPIRED":
        return <Badge bg="danger">Expired</Badge>;
      case "RECALLED":
        return <Badge bg="danger">Recalled</Badge>;
      default:
        return <Badge bg="secondary">Unknown</Badge>;
    }
  };

  const filteredBatches = batches.filter(
    (b) =>
      b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.batch_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastBatch = currentPage * batchesPerPage;
  const indexOfFirstBatch = indexOfLastBatch - batchesPerPage;
  const currentBatches = filteredBatches.slice(
    indexOfFirstBatch,
    indexOfLastBatch
  );
  const totalPages = Math.ceil(filteredBatches.length / batchesPerPage);

  return (
    <ManufacturerLayout active="batches">
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
            <h2 className="fw-bold mb-1">All Batches</h2>
            <p className="text-muted mb-0">
              Manage and view all your medicine batches
            </p>
          </Col>

          <Col xs="auto" className="d-flex gap-2">
            <Button variant="primary" onClick={() => setShowCreate(true)}>
              <FaPlus className="me-2" /> Create Batch
            </Button>
            <Button
              variant="outline-secondary"
              onClick={loadData}
              disabled={loading}
            >
              {loading ? (
                <Spinner animation="border" size="sm" />
              ) : (
                <FaSync />
              )}
            </Button>
          </Col>
        </Row>

        {error && (
          <Alert variant="danger" dismissible onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* STATS */}
        <Row className="mb-4 g-3">
          <Col md={4}>
            <Card className="border-0 shadow-sm text-center h-100">
              <Card.Body className="py-4">
                <div className="fs-1 fw-bold text-primary mb-2">
                  {stats.total_batches}
                </div>
                <div className="text-muted">Total Batches</div>
              </Card.Body>
            </Card>
          </Col>

          <Col md={4}>
            <Card className="border-0 shadow-sm text-center h-100">
              <Card.Body className="py-4">
                <div className="fs-1 fw-bold text-success mb-2">
                  {stats.in_stock}
                </div>
                <div className="text-muted">Units With You</div>
              </Card.Body>
            </Card>
          </Col>

          <Col md={4}>
            <Card className="border-0 shadow-sm text-center h-100">
              <Card.Body className="py-4">
                <div className="fs-1 fw-bold text-secondary mb-2">
                  {stats.transferred}
                </div>
                <div className="text-muted">Fully Distributed</div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* SEARCH */}
        <Row className="mb-3">
          <Col md={6} lg={4}>
            <InputGroup>
              <InputGroup.Text className="bg-white">
                <FaSearch className="text-muted" />
              </InputGroup.Text>
              <Form.Control
                type="text"
                placeholder="Search by name or batch ID"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="border-start-0"
              />
            </InputGroup>
          </Col>
        </Row>

        {/* TABLE */}
        <Card className="border-0 shadow-sm">
          <Card.Body className="p-0">
            {loading ? (
              <div className="text-center py-5">
                <Spinner animation="border" variant="primary" />
                <p className="text-muted mt-3">Loading batches...</p>
              </div>
            ) : currentBatches.length === 0 ? (
              <Alert variant="info" className="m-4 text-center">
                No batches found.
                {searchTerm && " Try adjusting your search criteria."}
              </Alert>
            ) : (
              <div className="table-responsive">
                <Table hover className="mb-0 align-middle">
                  <thead className="table-light">
                    <tr>
                      <th className="border-0">#</th>
                      <th className="border-0">Name</th>
                      <th className="border-0">Batch ID</th>
                      <th className="border-0">Manufactured</th>
                      <th className="border-0">With You</th>
                      <th className="border-0">Batch Status</th>
                      <th className="border-0">Stock Status</th>
                      <th className="border-0 text-center">QR Code</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentBatches.map((batch, idx) => {
                      const remainingQty =
                        batch.remaining_with_me ??
                        batch.remaining_quantity ??
                        0;
                      const totalQty =
                        batch.total_manufactured ?? batch.quantity ?? 0;

                      return (
                        <tr key={batch.id}>
                          <td className="text-muted">
                            {indexOfFirstBatch + idx + 1}
                          </td>
                          <td className="fw-semibold">{batch.name}</td>
                          <td>
                            <code className="bg-light px-2 py-1 rounded">
                              {batch.batch_id}
                            </code>
                          </td>
                          <td>{totalQty}</td>
                          <td>
                            <strong>{remainingQty}</strong>
                            {batch.total_distributed && totalQty > 0 && (
                              <div className="small text-muted">
                                {Math.round(
                                  (batch.total_distributed / totalQty) * 100
                                )}
                                % distributed
                              </div>
                            )}
                          </td>

                          <td>{getBatchStatusBadge(batch.batch_status)}</td>

                          <td>
                            {remainingQty === 0 ? (
                              <Badge bg="danger">Fully Distributed</Badge>
                            ) : remainingQty < totalQty ? (
                              <Badge bg="warning" text="dark">
                                Partial Stock
                              </Badge>
                            ) : (
                              <Badge bg="success">In Stock</Badge>
                            )}
                          </td>

                          <td className="text-center">
                            <div className="d-flex flex-column align-items-center gap-1">
                              <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={() => handleViewQR(batch)}
                                disabled={batch.batch_status === "RECALLED"}
                              >
                                <FaQrcode className="me-1" /> View
                              </Button>

                              {batch.batch_status === "EXHAUSTED" && (
                                <small className="text-warning">
                                  <FaExclamationTriangle className="me-1" />
                                  Expiring Soon
                                </small>
                              )}
                              {batch.batch_status === "RECALLED" && (
                                <small className="text-danger">
                                  <FaShieldAlt className="me-1" />
                                  Disabled
                                </small>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              </div>
            )}
          </Card.Body>

          {currentBatches.length > 0 && (
            <Card.Footer className="bg-white border-top">
              <div className="d-flex justify-content-between align-items-center">
                <small className="text-muted">
                  Showing {indexOfFirstBatch + 1} to{" "}
                  {Math.min(indexOfLastBatch, filteredBatches.length)} of{" "}
                  {filteredBatches.length} batches
                </small>
              </div>
            </Card.Footer>
          )}
        </Card>

        {/* PAGINATION */}
        {totalPages > 1 && (
          <Row className="mt-3">
            <Col className="d-flex justify-content-center">
              <Pagination>
                <Pagination.First
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                />
                <Pagination.Prev
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                />

                {Array.from({ length: totalPages }, (_, i) => {
                  const page = i + 1;
                  if (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <Pagination.Item
                        key={page}
                        active={page === currentPage}
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </Pagination.Item>
                    );
                  } else if (page === currentPage - 2 || page === currentPage + 2) {
                    return <Pagination.Ellipsis key={page} disabled />;
                  }
                  return null;
                })}

                <Pagination.Next
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                />
                <Pagination.Last
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                />
              </Pagination>
            </Col>
          </Row>
        )}
      </Container>

      <CreateBatchModal
        show={showCreate}
        onHide={() => setShowCreate(false)}
        onCreated={loadData}
      />

      <QRCodeModal
        show={showQRModal}
        onHide={() => setShowQRModal(false)}
        batch={selectedBatchQR}
      />
    </ManufacturerLayout>
  );
}

/* QR CODE MODAL */
function QRCodeModal({ show, onHide, batch }) {
  if (!batch) return null;

  const qrCodeSrc = batch.qr_code_url
    ? batch.qr_code_url
    : `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
        `${window.location.origin}/api/medicine/verify_batch/${batch.batch_id}/`
      )}`;

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = qrCodeSrc;
    link.download = `${batch.batch_id}-qrcode.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isQRActive = !batch.batch_status || batch.batch_status === "ACTIVE";

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>
          <FaQrcode className="me-2" />
          QR Code - {batch.batch_id}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {!isQRActive && (
          <Alert variant="warning">
            <FaShieldAlt className="me-2" />
            This batch is <strong>{batch.batch_status}</strong>
          </Alert>
        )}

        <div className="text-center">
          <img
            src={qrCodeSrc}
            alt="QR Code"
            className="img-fluid mb-3 border rounded p-2"
            style={{ 
              maxWidth: "300px",
              opacity: isQRActive ? 1 : 0.5 
            }}
          />

          <h6 className="fw-bold">{batch.name}</h6>
          <p className="text-muted small mb-3">Batch ID: {batch.batch_id}</p>

          <div className="mb-3">
            {batch.batch_status === "ACTIVE" && (
              <Badge bg="success">QR Active</Badge>
            )}
            {batch.batch_status === "EXHAUSTED" && (
              <Badge bg="warning" text="dark">Batch Exhausted</Badge>
            )}
            {batch.batch_status === "RECALLED" && (
              <Badge bg="danger">QR Disabled</Badge>
            )}
          </div>

          <div className="bg-light p-3 rounded">
            <small className="text-muted d-block mb-1">Verification URL</small>
            <code className="small text-break">
              {batch.qr_code_url ||
                `${window.location.origin}/api/medicine/verify_batch/${batch.batch_id}/`}
            </code>
          </div>
        </div>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
        <Button
          variant="primary"
          onClick={handleDownload}
          disabled={batch.batch_status === "RECALLED"}
        >
          <FaDownload className="me-2" />
          Download QR
        </Button>
      </Modal.Footer>
    </Modal>
  );
}