import React, { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Spinner,
  Badge,
  Alert,
  ListGroup,
} from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaQrcode,
  FaCheckCircle,
  FaExclamationTriangle,
  FaBox,
  FaShieldAlt,
  FaCalendar,
  FaUser,
  FaClock,
} from "react-icons/fa";

import ManufacturerLayout from "../../../components/manufacturer/ManufacturerLayout";
import { fetchBatchDetails, verifyBatch } from "../../../services/api";

export default function BatchDetails() {
  const { batchId } = useParams();
  const navigate = useNavigate();

  const [batch, setBatch] = useState({
    batch_id: batchId,
    name: "",
    quantity: 0,
    remaining_quantity: 0,
    manufacture_date: "",
    expiry_date: "",
    current_holder: { username: "N/A" },
    created_at: "",
  });

  const [blockchain, setBlockchain] = useState({
    valid: null,
    message: "",
    chain: [],
    chain_length: 0,
  });

  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadBatch = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchBatchDetails(batchId);
        setBatch(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load batch details");
      } finally {
        setLoading(false);
      }
    };

    loadBatch();
  }, [batchId]);

  const handleVerifyBlockchain = async () => {
    try {
      setVerifying(true);
      setError(null);
      const result = await verifyBatch(batchId);
      setBlockchain(result);
    } catch (err) {
      console.error("Blockchain verification failed", err);
      setError("Blockchain verification failed");
    } finally {
      setVerifying(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

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

            <h2 className="mb-1 fw-bold">Batch Details</h2>

            <p className="text-muted mb-0">
              Complete information and blockchain trail for{" "}
              <code className="bg-light px-2 py-1 rounded">{batch.batch_id}</code>
            </p>
          </Col>

          <Col xs="auto" className="d-flex gap-2 flex-wrap">
            <Button variant="outline-primary">
              <FaQrcode className="me-2" />
              View QR Code
            </Button>

            <Button
              variant="primary"
              onClick={handleVerifyBlockchain}
              disabled={verifying}
            >
              {verifying ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Verifying...
                </>
              ) : (
                <>
                  <FaShieldAlt className="me-2" />
                  Verify Blockchain
                </>
              )}
            </Button>
          </Col>
        </Row>

        {/* LOADING */}
        {loading && (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <p className="text-muted mt-3">Loading batch details...</p>
          </div>
        )}

        {/* ERROR */}
        {error && (
          <Alert variant="danger" dismissible onClose={() => setError(null)}>
            <FaExclamationTriangle className="me-2" />
            {error}
          </Alert>
        )}

        {/* CONTENT */}
        {!loading && (
          <Row>
            {/* BATCH INFO */}
            <Col lg={4} className="mb-4">
              <Card className="border-0 shadow-sm h-100">
                <Card.Body>
                  <h5 className="mb-4 fw-bold d-flex align-items-center">
                    <FaBox className="text-primary me-2" />
                    Batch Information
                  </h5>

                  <ListGroup variant="flush">
                    <ListGroup.Item className="px-0 border-0 pb-3">
                      <small className="text-muted d-block mb-1">Batch ID</small>
                      <code className="bg-light px-2 py-1 rounded fw-semibold">
                        {batch.batch_id}
                      </code>
                    </ListGroup.Item>

                    <ListGroup.Item className="px-0 border-0 pb-3">
                      <small className="text-muted d-block mb-1">
                        Medicine Name
                      </small>
                      <div className="fw-semibold">{batch.name || "N/A"}</div>
                    </ListGroup.Item>

                    <ListGroup.Item className="px-0 border-0 pb-3">
                      <small className="text-muted d-block mb-1">
                        Total Quantity
                      </small>
                      <Badge bg="secondary" className="fs-6">
                        {batch.quantity} units
                      </Badge>
                    </ListGroup.Item>

                    <ListGroup.Item className="px-0 border-0 pb-3">
                      <small className="text-muted d-block mb-1">
                        Remaining Quantity
                      </small>
                      <Badge
                        bg={batch.remaining_quantity > 0 ? "success" : "warning"}
                        className="fs-6"
                      >
                        {batch.remaining_quantity} units
                      </Badge>
                    </ListGroup.Item>

                    <ListGroup.Item className="px-0 border-0 pb-3">
                      <small className="text-muted d-block mb-1">
                        <FaCalendar className="me-1" />
                        Manufacturing Date
                      </small>
                      <div>{formatDate(batch.manufacture_date)}</div>
                    </ListGroup.Item>

                    <ListGroup.Item className="px-0 border-0 pb-3">
                      <small className="text-muted d-block mb-1">
                        <FaCalendar className="me-1" />
                        Expiry Date
                      </small>
                      <div>{formatDate(batch.expiry_date)}</div>
                    </ListGroup.Item>

                    <ListGroup.Item className="px-0 border-0 pb-3">
                      <small className="text-muted d-block mb-1">
                        <FaUser className="me-1" />
                        Current Holder
                      </small>
                      <div className="fw-semibold">
                        {batch.current_holder?.username || "N/A"}
                      </div>
                    </ListGroup.Item>

                    <ListGroup.Item className="px-0 border-0">
                      <small className="text-muted d-block mb-1">
                        <FaClock className="me-1" />
                        Created At
                      </small>
                      <div>{formatDate(batch.created_at)}</div>
                    </ListGroup.Item>
                  </ListGroup>
                </Card.Body>
              </Card>
            </Col>

            {/* BLOCKCHAIN STATUS */}
            <Col lg={8} className="mb-4">
              <Card className="border-0 shadow-sm h-100">
                <Card.Body>
                  <h5 className="mb-4 fw-bold d-flex align-items-center">
                    <FaShieldAlt className="text-primary me-2" />
                    Blockchain Status
                  </h5>

                  {blockchain.valid !== null ? (
                    <>
                      <Alert
                        variant={blockchain.valid ? "success" : "danger"}
                        className="border-0"
                      >
                        <div className="d-flex align-items-start">
                          {blockchain.valid ? (
                            <FaCheckCircle className="me-2 mt-1 flex-shrink-0" size={24} />
                          ) : (
                            <FaExclamationTriangle className="me-2 mt-1 flex-shrink-0" size={24} />
                          )}

                          <div className="flex-grow-1">
                            <h5 className="mb-2 fw-bold">
                              {blockchain.valid
                                ? "Blockchain Verified"
                                : "Blockchain Compromised"}
                            </h5>

                            <p className="mb-0">{blockchain.message}</p>
                          </div>
                        </div>
                      </Alert>

                      {blockchain.chain && blockchain.chain.length > 0 && (
                        <div className="mt-4">
                          <h6 className="fw-bold mb-3">Blockchain Trail</h6>
                          <div className="bg-light p-3 rounded">
                            <div className="d-flex justify-content-between align-items-center mb-2">
                              <span className="text-muted small">
                                Total Blocks
                              </span>
                              <Badge bg="primary">
                                {blockchain.chain_length || blockchain.chain.length}
                              </Badge>
                            </div>
                            <Button
                              variant="outline-primary"
                              size="sm"
                              className="w-100"
                              onClick={() =>
                                navigate(`/dashboard/manufacturer/verify`)
                              }
                            >
                              View Full Blockchain Trail
                            </Button>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-5">
                      <FaShieldAlt size={48} className="text-muted mb-3" />
                      <p className="text-muted mb-3">
                        No blockchain verification performed yet.
                      </p>
                      <Button
                        variant="primary"
                        onClick={handleVerifyBlockchain}
                        disabled={verifying}
                      >
                        {verifying ? (
                          <>
                            <Spinner animation="border" size="sm" className="me-2" />
                            Verifying...
                          </>
                        ) : (
                          <>
                            <FaShieldAlt className="me-2" />
                            Verify Now
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}
      </Container>
    </ManufacturerLayout>
  );
}