import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Alert,
  Spinner,
  Badge,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaExchangeAlt,
  FaCheckCircle,
  FaExclamationTriangle,
  FaInfoCircle,
} from "react-icons/fa";

import {
  transferBatch,
  fetchBatches,
  getAllUsers,
} from "../../../services/api";

import ProtectedRoute from "../../../components/ProtectedRoute";
import RoleRoute from "../../../components/RoleRoute";
import ManufacturerLayout from "../../../components/manufacturer/ManufacturerLayout";

function TransferBatchContent() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    batch_id: "",
    to_user_id: "",
    quantity: "",
  });

  const [batches, setBatches] = useState([]);
  const [distributors, setDistributors] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [batchesData, usersData] = await Promise.all([
        fetchBatches(),
        getAllUsers(),
      ]);

      const availableBatches = batchesData.filter(
        (b) => b.remaining_quantity > 0
      );
      setBatches(availableBatches);

      const distributorUsers = usersData.filter(
        (u) => u.role && u.role.toLowerCase() === "distributor"
      );
      setDistributors(distributorUsers);
    } catch (err) {
      console.error("Failed to load data", err);
      setError("Failed to load data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleBatchChange = (e) => {
    const batchId = e.target.value;
    setFormData({ ...formData, batch_id: batchId, quantity: "" });

    const batch = batches.find((b) => b.batch_id === batchId);
    setSelectedBatch(batch || null);
    setError(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setError(null);
  };

  const validateForm = () => {
    if (!formData.batch_id) {
      setError("Please select a batch");
      return false;
    }

    if (!formData.to_user_id) {
      setError("Please select a distributor");
      return false;
    }

    if (!formData.quantity || parseInt(formData.quantity) <= 0) {
      setError("Please enter a valid quantity");
      return false;
    }

    if (
      selectedBatch &&
      parseInt(formData.quantity) > selectedBatch.remaining_quantity
    ) {
      setError(
        `Quantity cannot exceed available stock (${selectedBatch.remaining_quantity})`
      );
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setSubmitting(true);
      setError(null);

      await transferBatch(formData);
      setSuccess(true);

      setTimeout(() => {
        navigate("/dashboard/manufacturer");
      }, 2500);
    } catch (err) {
      console.error(err);
      setError(err?.detail || "Transfer failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <ManufacturerLayout active="transfer">
        <Container fluid className="py-4">
          <div
            className="d-flex justify-content-center align-items-center"
            style={{ minHeight: "60vh" }}
          >
            <div className="text-center">
              <Spinner animation="border" variant="primary" />
              <p className="text-muted mt-3">Loading transfer form...</p>
            </div>
          </div>
        </Container>
      </ManufacturerLayout>
    );
  }

  return (
    <ManufacturerLayout active="transfer">
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

            <h2 className="mb-1 fw-bold">Transfer Batch</h2>

            <p className="text-muted mb-0">
              Transfer medicine batch to a distributor in the supply chain
            </p>
          </Col>
        </Row>

        <Row className="justify-content-center">
          <Col lg={8}>
            {/* SUCCESS */}
            {success ? (
              <Card className="border-0 shadow-sm text-center">
                <Card.Body className="p-5">
                  <div
                    className="d-inline-flex align-items-center justify-content-center rounded-circle bg-success bg-opacity-10 mb-4"
                    style={{ width: "100px", height: "100px" }}
                  >
                    <FaCheckCircle className="text-success" size={60} />
                  </div>

                  <h3 className="fw-bold text-success mb-3">
                    Transfer Successful!
                  </h3>

                  <p className="text-muted mb-4">
                    Batch has been transferred successfully and a new blockchain
                    block has been added.
                  </p>

                  <div className="d-flex justify-content-center gap-2 flex-wrap">
                    <Button
                      variant="primary"
                      onClick={() => navigate("/dashboard/manufacturer")}
                    >
                      Back to Dashboard
                    </Button>

                    <Button
                      variant="outline-secondary"
                      onClick={() => {
                        setSuccess(false);
                        setFormData({
                          batch_id: "",
                          to_user_id: "",
                          quantity: "",
                        });
                        setSelectedBatch(null);
                      }}
                    >
                      Transfer Another
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            ) : (
              <Card className="border-0 shadow-sm">
                <Card.Body className="p-4">
                  <Form onSubmit={handleSubmit}>
                    {/* ERROR */}
                    {error && (
                      <Alert
                        variant="danger"
                        dismissible
                        onClose={() => setError(null)}
                        className="border-0"
                      >
                        <div className="d-flex align-items-start">
                          <FaExclamationTriangle className="me-2 mt-1 flex-shrink-0" />
                          <div>
                            <strong>Error:</strong> {error}
                          </div>
                        </div>
                      </Alert>
                    )}

                    {/* INFO */}
                    <Alert variant="info" className="mb-4 border-0">
                      <div className="d-flex align-items-start">
                        <FaInfoCircle className="me-2 mt-1 flex-shrink-0" />
                        <div>
                          <strong>Important:</strong> Manufacturers can only
                          transfer batches to Distributors in the supply chain.
                        </div>
                      </div>
                    </Alert>

                    {/* BATCH */}
                    <Form.Group className="mb-4">
                      <Form.Label className="fw-semibold">
                        Select Batch <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Select
                        name="batch_id"
                        value={formData.batch_id}
                        onChange={handleBatchChange}
                        required
                        size="lg"
                      >
                        <option value="">-- Choose a batch --</option>
                        {batches.map((batch) => (
                          <option key={batch.id} value={batch.batch_id}>
                            {batch.batch_id} - {batch.name} (
                            {batch.remaining_quantity} units available)
                          </option>
                        ))}
                      </Form.Select>
                      {batches.length === 0 && (
                        <Form.Text className="text-warning">
                          No batches available for transfer
                        </Form.Text>
                      )}
                    </Form.Group>

                    {/* BATCH INFO */}
                    {selectedBatch && (
                      <Card className="mb-4 bg-light border-0">
                        <Card.Body>
                          <Row className="g-3">
                            <Col md={6}>
                              <small className="text-muted d-block mb-1">
                                Medicine Name
                              </small>
                              <div className="fw-semibold">
                                {selectedBatch.name}
                              </div>
                            </Col>
                            <Col md={3}>
                              <small className="text-muted d-block mb-1">
                                Available Stock
                              </small>
                              <Badge bg="success" className="fs-6">
                                {selectedBatch.remaining_quantity} units
                              </Badge>
                            </Col>
                            <Col md={3}>
                              <small className="text-muted d-block mb-1">
                                Batch ID
                              </small>
                              <code className="bg-white px-2 py-1 rounded">
                                {selectedBatch.batch_id}
                              </code>
                            </Col>
                          </Row>
                        </Card.Body>
                      </Card>
                    )}

                    {/* RECEIVER */}
                    <Form.Group className="mb-4">
                      <Form.Label className="fw-semibold">
                        Select Distributor <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Select
                        name="to_user_id"
                        value={formData.to_user_id}
                        onChange={handleChange}
                        required
                        size="lg"
                      >
                        <option value="">-- Choose distributor --</option>
                        {distributors.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.username} ({d.email || "No email"})
                          </option>
                        ))}
                      </Form.Select>
                      {distributors.length === 0 && (
                        <Form.Text className="text-warning">
                          No distributors available
                        </Form.Text>
                      )}
                    </Form.Group>

                    {/* QUANTITY */}
                    <Form.Group className="mb-4">
                      <Form.Label className="fw-semibold">
                        Quantity to Transfer{" "}
                        <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Control
                        type="number"
                        name="quantity"
                        value={formData.quantity}
                        onChange={handleChange}
                        min="1"
                        max={selectedBatch?.remaining_quantity || ""}
                        disabled={!selectedBatch}
                        required
                        size="lg"
                        placeholder="Enter quantity"
                      />
                      {selectedBatch && (
                        <Form.Text className="text-muted">
                          Maximum: {selectedBatch.remaining_quantity} units
                        </Form.Text>
                      )}
                    </Form.Group>

                    {/* ACTIONS */}
                    <div className="d-flex justify-content-end gap-2 pt-3 border-top">
                      <Button
                        variant="outline-secondary"
                        onClick={() => navigate("/dashboard/manufacturer")}
                        disabled={submitting}
                      >
                        Cancel
                      </Button>

                      <Button
                        type="submit"
                        variant="primary"
                        disabled={submitting}
                      >
                        {submitting ? (
                          <>
                            <Spinner
                              animation="border"
                              size="sm"
                              className="me-2"
                            />
                            Processing Transfer...
                          </>
                        ) : (
                          <>
                            <FaExchangeAlt className="me-2" />
                            Confirm Transfer
                          </>
                        )}
                      </Button>
                    </div>
                  </Form>
                </Card.Body>
              </Card>
            )}
          </Col>
        </Row>
      </Container>
    </ManufacturerLayout>
  );
}

export default function TransferBatch() {
  return (
    <ProtectedRoute>
      <RoleRoute roles={["manufacturer"]}>
        <TransferBatchContent />
      </RoleRoute>
    </ProtectedRoute>
  );
}