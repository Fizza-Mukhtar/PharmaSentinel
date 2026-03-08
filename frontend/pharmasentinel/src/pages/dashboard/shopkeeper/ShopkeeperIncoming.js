// src/pages/shopkeeper/ShopkeeperIncoming.js
import React, { useState, useEffect } from "react";
import { Row, Col, Card, Button, Spinner, Badge, Table, Modal, Form } from "react-bootstrap";
import ShopkeeperLayout from "../../../components/shopkeeper/ShopkeeperLayout";
import { getShopkeeperIncoming, shopkeeperAcceptTransfer, shopkeeperRejectTransfer } from "../../../services/api";

export default function ShopkeeperIncoming() {
  const [loading, setLoading] = useState(true);
  const [incoming, setIncoming] = useState([]);
  const [actionLoading, setActionLoading] = useState(null);
  
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedTransfer, setSelectedTransfer] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    loadIncoming();
  }, []);

  const loadIncoming = async () => {
    setLoading(true);
    try {
      const response = await getShopkeeperIncoming();
      setIncoming(response.incoming || []);
    } catch (error) {
      console.error("Failed to load incoming:", error);
      alert("Failed to load incoming stock");
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (transferId) => {
    if (!window.confirm("Accept this transfer?")) return;

    setActionLoading(transferId);
    try {
      await shopkeeperAcceptTransfer(transferId);
      alert("Transfer accepted successfully!");
      loadIncoming();
    } catch (error) {
      console.error("Failed to accept:", error);
      alert("Failed to accept transfer");
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectClick = (transfer) => {
    setSelectedTransfer(transfer);
    setRejectReason("");
    setShowRejectModal(true);
  };

  const handleRejectSubmit = async () => {
    if (!rejectReason.trim()) {
      alert("Please provide a reason");
      return;
    }

    setActionLoading(selectedTransfer.transfer_id);
    try {
      await shopkeeperRejectTransfer(selectedTransfer.transfer_id, rejectReason);
      alert("Transfer rejected");
      setShowRejectModal(false);
      loadIncoming();
    } catch (error) {
      console.error("Failed to reject:", error);
      alert("Failed to reject transfer");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <ShopkeeperLayout>
        <div className="text-center py-5">
          <Spinner animation="border" variant="success" />
          <p className="mt-3 text-muted">Loading incoming stock...</p>
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
            <i className="bi bi-inbox me-2" style={{ color: "#10b981" }}></i>
            Incoming Stock
          </h2>
          <p className="text-muted mb-0">Accept or reject incoming transfers from wholesalers</p>
        </div>
        <Button variant="outline-secondary" onClick={loadIncoming}>
          <i className="bi bi-arrow-clockwise me-2"></i>
          Refresh
        </Button>
      </div>

      {/* Summary Card */}
      <Card className="border-0 shadow-sm mb-4" style={{ borderLeft: "4px solid #f59e0b" }}>
        <Card.Body>
          <Row className="align-items-center">
            <Col md={8}>
              <div className="d-flex align-items-center gap-3">
                <div style={{ fontSize: "3rem", color: "#f59e0b" }}>
                  <i className="bi bi-box-seam"></i>
                </div>
                <div>
                  <h3 className="mb-0 fw-bold" style={{ color: "#f59e0b" }}>
                    {incoming.length} Pending Transfers
                  </h3>
                  <p className="text-muted mb-0">
                    Review and accept stock from your suppliers
                  </p>
                </div>
              </div>
            </Col>
            <Col md={4} className="text-end">
              <Badge bg="warning" className="px-3 py-2" style={{ fontSize: "1rem" }}>
                <i className="bi bi-clock-history me-2"></i>
                Awaiting Action
              </Badge>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Incoming Transfers Table */}
      <Card className="border-0 shadow-sm">
        <Card.Body>
          <h5 className="mb-3 fw-semibold" style={{ color: "#10b981" }}>
            <i className="bi bi-list-check me-2"></i>
            Pending Transfers
          </h5>

          {incoming.length > 0 ? (
            <div className="table-responsive">
              <Table hover>
                <thead style={{ backgroundColor: "#f9fafb" }}>
                  <tr>
                    <th>Transfer ID</th>
                    <th>Batch ID</th>
                    <th>Medicine Name</th>
                    <th>From</th>
                    <th>Quantity</th>
                    <th>Expiry Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {incoming.map((transfer) => (
                    <tr key={transfer.transfer_id}>
                      <td>
                        <code className="px-2 py-1" style={{ backgroundColor: "#f3f4f6", borderRadius: "4px" }}>
                          #{transfer.transfer_id}
                        </code>
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
                      <td>
                        {transfer.expiry_date ? (
                          <div className="small">{new Date(transfer.expiry_date).toLocaleDateString()}</div>
                        ) : (
                          "N/A"
                        )}
                      </td>
                      <td>
                        <Badge bg="warning">
                          <i className="bi bi-clock-history me-1"></i>
                          {transfer.status}
                        </Badge>
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          <Button
                            variant="success"
                            size="sm"
                            onClick={() => handleAccept(transfer.transfer_id)}
                            disabled={actionLoading === transfer.transfer_id}
                          >
                            {actionLoading === transfer.transfer_id ? (
                              <>
                                <Spinner animation="border" size="sm" className="me-1" />
                                Accepting...
                              </>
                            ) : (
                              <>
                                <i className="bi bi-check-circle me-1"></i>
                                Accept
                              </>
                            )}
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleRejectClick(transfer)}
                            disabled={actionLoading === transfer.transfer_id}
                          >
                            <i className="bi bi-x-circle me-1"></i>
                            Reject
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-5">
              <i className="bi bi-check-circle" style={{ fontSize: "4rem", color: "#d1d5db" }}></i>
              <h5 className="text-muted mt-3">No pending transfers</h5>
              <p className="text-muted small">All incoming stock has been processed</p>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Reject Modal */}
      <Modal show={showRejectModal} onHide={() => setShowRejectModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="bi bi-x-circle me-2" style={{ color: "#ef4444" }}></i>
            Reject Transfer
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedTransfer && (
            <div className="mb-3">
              <p>
                <strong>Medicine:</strong> {selectedTransfer.medicine_name}
              </p>
              <p>
                <strong>Quantity:</strong> {selectedTransfer.quantity} units
              </p>
              <p>
                <strong>From:</strong> {selectedTransfer.from_user}
              </p>
            </div>
          )}
          <Form.Group>
            <Form.Label className="fw-semibold">Rejection Reason *</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Explain why you're rejecting this transfer..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRejectModal(false)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleRejectSubmit}
            disabled={!rejectReason.trim() || actionLoading}
          >
            {actionLoading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Rejecting...
              </>
            ) : (
              <>
                <i className="bi bi-x-circle me-2"></i>
                Confirm Rejection
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </ShopkeeperLayout>
  );
}