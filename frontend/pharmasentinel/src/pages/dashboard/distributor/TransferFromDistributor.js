// src/pages/distributor/TransferFromDistributor.js
import React, { useState, useEffect } from "react";
import { Card, Button, Form, Alert, Row, Col, Spinner } from "react-bootstrap";
import { useNavigate, useSearchParams } from "react-router-dom";
import DistributorLayout from "../../../components/distributor/Distributorlayout";
import {
  getDistributorInventory,
  getWarehouseUsersForDistributor,
  transferToWarehouse,
} from "../../../services/api";

export default function TransferFromDistributor() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preBatchId = searchParams.get("batch");

  const [loading, setLoading] = useState(false);
  const [batches, setBatches] = useState([]);
  const [recipients, setRecipients] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [formData, setFormData] = useState({
    batch_id: preBatchId || "",
    receiver_id: "",
    quantity: "",
  });

  const [selectedBatch, setSelectedBatch] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (preBatchId && batches.length > 0) {
      const batch = batches.find((b) => b.batch_id === preBatchId);
      if (batch) setSelectedBatch(batch);
    }
  }, [preBatchId, batches]);

  const loadData = async () => {
    setLoading(true);
    try {
      const inventoryData = await getDistributorInventory();
      const warehouseData = await getWarehouseUsersForDistributor();

      setBatches(inventoryData.inventory || []);
      setRecipients(warehouseData || []);

      console.log("Recipients loaded:", warehouseData);
    } catch (err) {
      setError(err.detail || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleBatchChange = (batchId) => {
    setFormData({ ...formData, batch_id: batchId, quantity: "" });
    const batch = batches.find((b) => b.batch_id === batchId);
    setSelectedBatch(batch);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!formData.batch_id || !formData.receiver_id || !formData.quantity) {
      setError("All fields are required");
      return;
    }

    const quantity = parseInt(formData.quantity);
    if (quantity <= 0) {
      setError("Quantity must be greater than 0");
      return;
    }

    if (selectedBatch && quantity > selectedBatch.remaining_quantity) {
      setError(
        `Not enough stock. Available: ${selectedBatch.remaining_quantity}`
      );
      return;
    }

    if (selectedBatch && selectedBatch.expiry_status === "EXPIRED") {
      setError("Cannot transfer expired batches");
      return;
    }

    setLoading(true);
    try {
      await transferToWarehouse(formData);
      setSuccess("Transfer successful! Blockchain block created.");
      setFormData({ batch_id: "", receiver_id: "", quantity: "" });
      setSelectedBatch(null);

      setTimeout(() => {
        loadData();
        navigate("/dashboard/distributor/inventory");
      }, 2000);
    } catch (err) {
      setError(err.detail || "Transfer failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DistributorLayout>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1 fw-bold">Transfer Stock</h2>
          <p className="text-muted mb-0">
            Send batches to warehouses
          </p>
        </div>
        <Button
          variant="outline-secondary"
          onClick={() => navigate("/dashboard/distributor/inventory")}
          size="sm"
        >
          Back to Inventory
        </Button>
      </div>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert variant="success" dismissible onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      <Row>
        <Col md={8}>
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Select Batch *</Form.Label>
                  <Form.Select
                    value={formData.batch_id}
                    onChange={(e) => handleBatchChange(e.target.value)}
                    required
                  >
                    <option value="">-- Select Batch --</option>
                    {batches
                      .filter((b) => b.expiry_status !== "EXPIRED")
                      .map((batch) => (
                        <option key={batch.batch_id} value={batch.batch_id}>
                          {batch.batch_id} - {batch.medicine_name} (Available:{" "}
                          {batch.remaining_quantity})
                        </option>
                      ))}
                  </Form.Select>
                  <Form.Text className="text-muted">
                    Only valid (non-expired) batches are shown
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Select Recipient *</Form.Label>
                  <Form.Select
                    value={formData.receiver_id}
                    onChange={(e) =>
                      setFormData({ ...formData, receiver_id: e.target.value })
                    }
                    required
                  >
                    <option value="">-- Select Recipient --</option>
                    {recipients.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.username} ({user.role})
                      </option>
                    ))}
                  </Form.Select>
                  {recipients.length === 0 && (
                    <Form.Text className="text-danger">
                      No recipients available
                    </Form.Text>
                  )}
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label className="fw-semibold">Quantity *</Form.Label>
                  <Form.Control
                    type="number"
                    min="1"
                    value={formData.quantity}
                    onChange={(e) =>
                      setFormData({ ...formData, quantity: e.target.value })
                    }
                    placeholder="Enter quantity"
                    required
                    disabled={!selectedBatch}
                  />
                  {selectedBatch && (
                    <Form.Text className="text-muted">
                      Available: {selectedBatch.remaining_quantity} units
                    </Form.Text>
                  )}
                </Form.Group>

                <div className="d-flex gap-2">
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={
                      loading ||
                      !formData.batch_id ||
                      !formData.receiver_id ||
                      !formData.quantity
                    }
                  >
                    {loading ? (
                      <>
                        <Spinner
                          animation="border"
                          size="sm"
                          className="me-2"
                        />
                        Processing...
                      </>
                    ) : (
                      "Transfer"
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline-secondary"
                    onClick={() => {
                      setFormData({
                        batch_id: "",
                        receiver_id: "",
                        quantity: "",
                      });
                      setSelectedBatch(null);
                    }}
                  >
                    Clear
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <h5 className="mb-3 fw-bold">Selected Batch Info</h5>
              {selectedBatch ? (
                <>
                  <p>
                    <small className="text-muted">Batch ID</small>
                    <br />
                    <code className="px-2 py-1 bg-light rounded">{selectedBatch.batch_id}</code>
                  </p>
                  <p>
                    <small className="text-muted">Medicine Name</small>
                    <br />
                    <strong>{selectedBatch.medicine_name}</strong>
                  </p>
                  <p>
                    <small className="text-muted">Manufacturer</small>
                    <br />
                    {selectedBatch.manufacturer}
                  </p>
                  <p>
                    <small className="text-muted">Available Quantity</small>
                    <br />
                    <strong>{selectedBatch.remaining_quantity}</strong> units
                  </p>
                  <p>
                    <small className="text-muted">Expiry Date</small>
                    <br />
                    {selectedBatch.expiry_date
                      ? new Date(selectedBatch.expiry_date).toLocaleDateString()
                      : "N/A"}
                  </p>
                  <p className="mb-0">
                    <small className="text-muted">Status</small>
                    <br />
                    {selectedBatch.expiry_status === "SAFE" && (
                      <span className="badge bg-success">Valid</span>
                    )}
                    {selectedBatch.expiry_status === "NEAR_EXPIRY" && (
                      <span className="badge bg-warning">Near Expiry</span>
                    )}
                  </p>
                </>
              ) : (
                <p className="text-muted text-center py-4">
                  Select a batch to view details
                </p>
              )}
            </Card.Body>
          </Card>

          <Alert variant="info" className="mt-3">
            <small>
              Blockchain block will be created upon successful transfer
            </small>
          </Alert>
        </Col>
      </Row>
    </DistributorLayout>
  );
}