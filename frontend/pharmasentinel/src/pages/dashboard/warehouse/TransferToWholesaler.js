// src/pages/warehouse/TransferToWholesaler.js
import React, { useState, useEffect } from "react";
import { Card, Button, Form, Alert, Row, Col } from "react-bootstrap";
import { useNavigate, useSearchParams } from "react-router-dom";
import WarehouseLayout from "../../../components/warehouse/WarehouseLayout";
import { 
  getWarehouseInventory, 
  getWholesalerUsers, 
  transferBatch 
} from "../../../services/api";

export default function TransferToWholesaler() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preBatchId = searchParams.get("batch");

  const [loading, setLoading] = useState(false);
  const [batches, setBatches] = useState([]);
  const [wholesalers, setWholesalers] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [formData, setFormData] = useState({
    batch_id: preBatchId || "",
    to_user_id: "",
    quantity: "",
  });

  const [selectedBatch, setSelectedBatch] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (preBatchId && batches.length > 0) {
      const batch = batches.find(b => b.batch_id === preBatchId);
      if (batch) {
        setSelectedBatch(batch);
      }
    }
  }, [preBatchId, batches]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [inventoryData, wholesalersData] = await Promise.all([
        getWarehouseInventory(),
        getWholesalerUsers(),
      ]);

      setBatches(inventoryData.inventory || []);
      setWholesalers(wholesalersData || []);
    } catch (err) {
      setError(err.detail || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleBatchChange = (batchId) => {
    setFormData({ ...formData, batch_id: batchId });
    const batch = batches.find(b => b.batch_id === batchId);
    setSelectedBatch(batch);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validation
    if (!formData.batch_id || !formData.to_user_id || !formData.quantity) {
      setError("All fields are required");
      return;
    }

    const quantity = parseInt(formData.quantity);
    if (quantity <= 0) {
      setError("Quantity must be greater than 0");
      return;
    }

    if (selectedBatch && quantity > selectedBatch.remaining_quantity) {
      setError(`Not enough stock. Available: ${selectedBatch.remaining_quantity}`);
      return;
    }

    if (selectedBatch && selectedBatch.expiry_status === "EXPIRED") {
      setError("Cannot transfer expired batches");
      return;
    }

    setLoading(true);
    try {
      await transferBatch(formData);
      setSuccess("Transfer successful! Blockchain block created.");
      
      // Reset form
      setFormData({
        batch_id: "",
        to_user_id: "",
        quantity: "",
      });
      setSelectedBatch(null);

      // Reload data
      setTimeout(() => {
        loadData();
        navigate("/warehouse/inventory");
      }, 2000);
    } catch (err) {
      setError(err.detail || "Transfer failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <WarehouseLayout>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">🔄 Transfer to Wholesaler</h2>
          <p className="text-muted mb-0">Transfer medicine batches to wholesalers</p>
        </div>
        <Button 
          variant="outline-secondary" 
          onClick={() => navigate("/warehouse/inventory")}
        >
          ← Back to Inventory
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
              <h5 className="mb-4">Transfer Details</h5>
              
              <Form onSubmit={handleSubmit}>
                {/* Batch Selection */}
                <Form.Group className="mb-3">
                  <Form.Label>Select Batch *</Form.Label>
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

                {/* Wholesaler Selection */}
                <Form.Group className="mb-3">
                  <Form.Label>Select Wholesaler *</Form.Label>
                  <Form.Select
                    value={formData.to_user_id}
                    onChange={(e) => setFormData({ ...formData, to_user_id: e.target.value })}
                    required
                  >
                    <option value="">-- Select Wholesaler --</option>
                    {wholesalers.map((wholesaler) => (
                      <option key={wholesaler.id} value={wholesaler.id}>
                        {wholesaler.username} (ID: {wholesaler.id})
                      </option>
                    ))}
                  </Form.Select>
                  {wholesalers.length === 0 && (
                    <Form.Text className="text-danger">
                      No wholesalers available
                    </Form.Text>
                  )}
                </Form.Group>

                {/* Quantity */}
                <Form.Group className="mb-4">
                  <Form.Label>Quantity *</Form.Label>
                  <Form.Control
                    type="number"
                    min="1"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    placeholder="Enter quantity"
                    required
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
                    disabled={loading || !formData.batch_id || !formData.to_user_id || !formData.quantity}
                  >
                    {loading ? "Processing..." : "🔄 Transfer Batch"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline-secondary"
                    onClick={() => {
                      setFormData({ batch_id: "", to_user_id: "", quantity: "" });
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

        {/* Batch Info Card */}
        <Col md={4}>
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <h5 className="mb-3">Selected Batch Info</h5>
              
              {selectedBatch ? (
                <div>
                  <div className="mb-2">
                    <small className="text-muted">Batch ID</small>
                    <p className="mb-0"><code>{selectedBatch.batch_id}</code></p>
                  </div>
                  <div className="mb-2">
                    <small className="text-muted">Medicine Name</small>
                    <p className="mb-0"><strong>{selectedBatch.medicine_name}</strong></p>
                  </div>
                  <div className="mb-2">
                    <small className="text-muted">Manufacturer</small>
                    <p className="mb-0">{selectedBatch.manufacturer}</p>
                  </div>
                  <div className="mb-2">
                    <small className="text-muted">Available Quantity</small>
                    <p className="mb-0"><strong>{selectedBatch.remaining_quantity}</strong> units</p>
                  </div>
                  <div className="mb-2">
                    <small className="text-muted">Expiry Date</small>
                    <p className="mb-0">
                      {selectedBatch.expiry_date 
                        ? new Date(selectedBatch.expiry_date).toLocaleDateString()
                        : "N/A"}
                    </p>
                  </div>
                  <div className="mb-2">
                    <small className="text-muted">Status</small>
                    <p className="mb-0">
                      {selectedBatch.expiry_status === "SAFE" && (
                        <span className="badge bg-success">🟢 Valid</span>
                      )}
                      {selectedBatch.expiry_status === "NEAR_EXPIRY" && (
                        <span className="badge bg-warning">🟡 Near Expiry</span>
                      )}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-muted text-center py-4">
                  Select a batch to view details
                </p>
              )}
            </Card.Body>
          </Card>

          <Alert variant="info" className="mt-3">
            <small>
              ℹ️ <strong>Note:</strong> A blockchain block will be created automatically upon successful transfer.
            </small>
          </Alert>
        </Col>
      </Row>
    </WarehouseLayout>
  );
}