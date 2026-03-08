// src/pages/distributor/ExpiryManagement.js
import React, { useState, useEffect } from "react";
import { Card, Badge, Tabs, Tab, Alert, Button, Spinner } from "react-bootstrap";
import DistributorLayout from "../../../components/distributor/Distributorlayout";
import { getDistributorInventory } from "../../../services/api";

export default function ExpiryManagement() {
  const [loading, setLoading] = useState(true);
  const [inventory, setInventory] = useState([]);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("near-expiry");

  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getDistributorInventory();
      setInventory(data.inventory || []);
    } catch (err) {
      setError(err.detail || "Failed to load inventory");
    } finally {
      setLoading(false);
    }
  };

  const nearExpiryBatches = inventory.filter(
    (item) => item.expiry_status === "NEAR_EXPIRY"
  );

  const expiredBatches = inventory.filter(
    (item) => item.expiry_status === "EXPIRED"
  );

  const recalledBatches = inventory.filter((item) => item.recalled);

  const getDaysUntilExpiry = (expiryDate) => {
    if (!expiryDate) return null;
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return "Expired";
    if (diffDays === 0) return "Expires today";
    return `${diffDays} days`;
  };

  const renderBatchTable = (batches, type) => {
    if (batches.length === 0) {
      return (
        <Alert variant="success" className="text-center">
          <h5 className="fw-bold">All Clear!</h5>
          <p className="mb-0">
            {type === "near-expiry" && "No batches are near expiry"}
            {type === "expired" && "No expired batches found"}
            {type === "recalled" && "No recalled batches"}
          </p>
        </Alert>
      );
    }

    return (
      <div className="table-responsive">
        <table className="table table-hover align-middle">
          <thead className="table-light">
            <tr>
              <th className="fw-semibold">Batch ID</th>
              <th className="fw-semibold">Medicine Name</th>
              <th className="fw-semibold">Quantity</th>
              <th className="fw-semibold">Manufacture Date</th>
              <th className="fw-semibold">Expiry Date</th>
              {type !== "recalled" && <th className="fw-semibold">Days Until Expiry</th>}
              <th className="fw-semibold">Status</th>
              <th className="fw-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {batches.map((batch) => {
              const daysLeft = getDaysUntilExpiry(batch.expiry_date);

              return (
                <tr key={batch.batch_id}>
                  <td>
                    <code className="px-2 py-1 bg-light rounded">{batch.batch_id}</code>
                  </td>
                  <td>
                    <strong>{batch.medicine_name}</strong>
                  </td>
                  <td>{batch.remaining_quantity}</td>
                  <td>
                    {batch.manufacture_date
                      ? new Date(batch.manufacture_date).toLocaleDateString()
                      : "N/A"}
                  </td>
                  <td>
                    {batch.expiry_date
                      ? new Date(batch.expiry_date).toLocaleDateString()
                      : "N/A"}
                  </td>
                  {type !== "recalled" && <td>{daysLeft}</td>}
                  <td>
                    {batch.expiry_status === "NEAR_EXPIRY" && (
                      <Badge bg="warning">Near Expiry</Badge>
                    )}
                    {batch.expiry_status === "EXPIRED" && (
                      <Badge bg="danger">Expired</Badge>
                    )}
                    {type === "recalled" && <Badge bg="dark">Recalled</Badge>}
                  </td>
                  <td>
                    <div className="d-flex gap-2">
                      <Button
                        size="sm"
                        variant="outline-info"
                        onClick={() =>
                          (window.location.href = `/dashboard/distributor/verify?batch=${batch.batch_id}`)
                        }
                      >
                        Details
                      </Button>
                      {batch.expiry_status !== "EXPIRED" &&
                        type !== "recalled" && (
                          <Button
                            size="sm"
                            variant="outline-danger"
                            onClick={() =>
                              alert("Mark for disposal functionality (backend needed)")
                            }
                          >
                            Dispose
                          </Button>
                        )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
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
          <h2 className="mb-1 fw-bold">Expiry & Recall Management</h2>
          <p className="text-muted mb-0">
            Monitor and manage expiring and recalled medicines
          </p>
        </div>
        <Button variant="outline-primary" onClick={loadInventory} size="sm">
          Refresh
        </Button>
      </div>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Summary Cards */}
      <div className="row mb-4 g-3">
        <div className="col-md-4">
          <Card className="border-0 shadow-sm text-center h-100">
            <Card.Body>
              <h3 className="mb-1 fw-bold text-warning">{nearExpiryBatches.length}</h3>
              <small className="text-muted text-uppercase" style={{ fontSize: '0.75rem' }}>Near Expiry (within 30 days)</small>
            </Card.Body>
          </Card>
        </div>
        <div className="col-md-4">
          <Card className="border-0 shadow-sm text-center h-100">
            <Card.Body>
              <h3 className="mb-1 fw-bold text-danger">{expiredBatches.length}</h3>
              <small className="text-muted text-uppercase" style={{ fontSize: '0.75rem' }}>Expired Batches</small>
            </Card.Body>
          </Card>
        </div>
        <div className="col-md-4">
          <Card className="border-0 shadow-sm text-center h-100">
            <Card.Body>
              <h3 className="mb-1 fw-bold text-dark">{recalledBatches.length}</h3>
              <small className="text-muted text-uppercase" style={{ fontSize: '0.75rem' }}>Recalled Batches</small>
            </Card.Body>
          </Card>
        </div>
      </div>

      {/* Tabs */}
      <Card className="border-0 shadow-sm">
        <Card.Body>
          <Tabs
            activeKey={activeTab}
            onSelect={(k) => setActiveTab(k)}
            className="mb-3"
          >
            <Tab
              eventKey="near-expiry"
              title={
                <span>
                  Near Expiry
                  {nearExpiryBatches.length > 0 && (
                    <Badge bg="warning" className="ms-2">
                      {nearExpiryBatches.length}
                    </Badge>
                  )}
                </span>
              }
            >
              <Alert variant="warning">
                <strong>Action Required:</strong> These batches will expire
                within 30 days. Consider transferring or returning to manufacturer.
              </Alert>
              {renderBatchTable(nearExpiryBatches, "near-expiry")}
            </Tab>

            <Tab
              eventKey="expired"
              title={
                <span>
                  Expired
                  {expiredBatches.length > 0 && (
                    <Badge bg="danger" className="ms-2">
                      {expiredBatches.length}
                    </Badge>
                  )}
                </span>
              }
            >
              <Alert variant="danger">
                <strong>Cannot Transfer:</strong> These batches have expired
                and cannot be transferred. They should be marked for disposal.
              </Alert>
              {renderBatchTable(expiredBatches, "expired")}
            </Tab>

            <Tab
              eventKey="recalled"
              title={
                <span>
                  Recalled
                  {recalledBatches.length > 0 && (
                    <Badge bg="dark" className="ms-2">
                      {recalledBatches.length}
                    </Badge>
                  )}
                </span>
              }
            >
              <Alert variant="dark">
                <strong>Recall Notice:</strong> These batches have been recalled
                by the manufacturer or regulatory authority. Transfer is disabled.
              </Alert>
              {renderBatchTable(recalledBatches, "recalled")}
            </Tab>
          </Tabs>
        </Card.Body>
      </Card>

      {/* Guidelines Card */}
      <Card className="border-0 shadow-sm mt-4 bg-light">
        <Card.Body>
          <h6 className="mb-3 fw-bold">Expiry Management Guidelines</h6>
          <ul className="mb-0" style={{ lineHeight: "1.8" }}>
            <li>
              <strong>Near Expiry (30 days):</strong> Prioritize for transfer or
              return
            </li>
            <li>
              <strong>Expired Batches:</strong> Cannot be transferred, mark for
              disposal
            </li>
            <li>
              <strong>Recalled Batches:</strong> Immediately stop distribution
              and quarantine
            </li>
            <li>
              <strong>Disposal:</strong> Follow local regulations for medicine
              disposal
            </li>
          </ul>
        </Card.Body>
      </Card>
    </DistributorLayout>
  );
}