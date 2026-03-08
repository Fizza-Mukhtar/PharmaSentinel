// src/pages/distributor/IncomingBatches.js
import React, { useState, useEffect } from "react";
import { Card, Button, Badge, Alert, Modal, Form, Spinner } from "react-bootstrap";
import DistributorLayout from "../../../components/distributor/Distributorlayout";
import { getDistributorIncoming, confirmDistributorReceive, rejectBatch } from "../../../services/api";

export default function IncomingBatchesDistributor() {
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [batches, setBatches] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    loadIncomingBatches();
  }, []);

  const loadIncomingBatches = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getDistributorIncoming();
      setBatches(data.incoming_batches || []);
    } catch (err) {
      setError(err?.detail || "Failed to load incoming batches");
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = (batch) => {
    setSelectedBatch(batch);
    setShowConfirmModal(true);
  };

  const handleReject = (batch) => {
    setSelectedBatch(batch);
    setShowRejectModal(true);
  };

  const confirmAccept = async () => {
    if (!selectedBatch) return;
    setActionLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await confirmDistributorReceive(selectedBatch.transfer_id);
      setSuccess(res?.message || `Batch ${selectedBatch.batch_id} accepted successfully!`);
      setShowConfirmModal(false);
      loadIncomingBatches();
    } catch (err) {
      setError(err?.detail || "Failed to accept batch");
    } finally {
      setActionLoading(false);
    }
  };

  const confirmReject = async () => {
    if (!rejectReason.trim()) {
      alert("Please provide a reason for rejection");
      return;
    }
    if (!selectedBatch) return;

    setActionLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await rejectBatch(selectedBatch.transfer_id, rejectReason);
      setSuccess(res?.message || `Batch ${selectedBatch.batch_id} rejected. Reason: ${rejectReason}`);
      setShowRejectModal(false);
      setRejectReason("");
      loadIncomingBatches();
    } catch (err) {
      setError(err?.detail || "Failed to reject batch");
    } finally {
      setActionLoading(false);
    }
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
          <h2 className="mb-1 fw-bold">Incoming Batches</h2>
          <p className="text-muted mb-0">Review and accept batches from manufacturers</p>
        </div>
        <Button variant="outline-primary" onClick={loadIncomingBatches} disabled={loading || actionLoading} size="sm">
          Refresh
        </Button>
      </div>

      {error && <Alert variant="danger" dismissible onClose={() => setError(null)}>{error}</Alert>}
      {success && <Alert variant="success" dismissible onClose={() => setSuccess(null)}>{success}</Alert>}

      <Card className="border-0 shadow-sm">
        <Card.Body>
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th className="fw-semibold">Batch ID</th>
                  <th className="fw-semibold">Medicine Name</th>
                  <th className="fw-semibold">From Manufacturer</th>
                  <th className="fw-semibold">Quantity</th>
                  <th className="fw-semibold">Transfer Date</th>
                  <th className="fw-semibold">Expiry Date</th>
                  <th className="fw-semibold">Status</th>
                  <th className="fw-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {batches.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center text-muted py-4">
                      No incoming batches at the moment
                    </td>
                  </tr>
                ) : (
                  batches.map((batch) => (
                    <tr key={batch.transfer_id}>
                      <td><code className="px-2 py-1 bg-light rounded">{batch.batch_id}</code></td>
                      <td><strong>{batch.medicine_name}</strong></td>
                      <td>
                        {batch.from_user}<br />
                        <Badge bg="info">{batch.from_role}</Badge>
                      </td>
                      <td>{batch.quantity}</td>
                      <td>{new Date(batch.transfer_date).toLocaleString()}</td>
                      <td>{batch.expiry_date ? new Date(batch.expiry_date).toLocaleDateString() : "N/A"}</td>
                      <td>
                        <Badge bg={batch.status === "PENDING" ? "warning" : "success"}>
                          {batch.status}
                        </Badge>
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          <Button size="sm" variant="success" disabled={actionLoading} onClick={() => handleAccept(batch)}>Accept</Button>
                          <Button size="sm" variant="danger" disabled={actionLoading} onClick={() => handleReject(batch)}>Reject</Button>
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

      {/* Accept Modal */}
      <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Batch Receipt</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to accept this batch?</p>
          {selectedBatch && (
            <div className="bg-light p-3 rounded">
              <p><strong>Batch ID:</strong> {selectedBatch.batch_id}</p>
              <p><strong>Medicine:</strong> {selectedBatch.medicine_name}</p>
              <p><strong>Quantity:</strong> {selectedBatch.quantity}</p>
              <p className="mb-0"><strong>From:</strong> {selectedBatch.from_user}</p>
            </div>
          )}
          <Alert variant="info" className="mt-3 mb-0">
            <small>A blockchain confirmation block will be created upon acceptance.</small>
          </Alert>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>Cancel</Button>
          <Button variant="success" onClick={confirmAccept} disabled={actionLoading}>
            {actionLoading ? "Processing..." : "Confirm Accept"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Reject Modal */}
      <Modal show={showRejectModal} onHide={() => { setShowRejectModal(false); setRejectReason(""); }}>
        <Modal.Header closeButton>
          <Modal.Title>Reject Batch</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Please provide a reason for rejecting this batch:</p>
          {selectedBatch && (
            <div className="bg-light p-3 rounded mb-3">
              <p><strong>Batch ID:</strong> {selectedBatch.batch_id}</p>
              <p className="mb-0"><strong>Medicine:</strong> {selectedBatch.medicine_name}</p>
            </div>
          )}
          <Form.Group>
            <Form.Label>Rejection Reason *</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g., Damaged packaging, incorrect quantity, etc."
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => { setShowRejectModal(false); setRejectReason(""); }}>Cancel</Button>
          <Button variant="danger" onClick={confirmReject} disabled={actionLoading}>
            {actionLoading ? "Processing..." : "Confirm Reject"}
          </Button>
        </Modal.Footer>
      </Modal>
    </DistributorLayout>
  );
}