// src/pages/distributor/DistributorNotifications.js
import React, { useState, useEffect } from "react";
import { Card, Badge, ListGroup, Button, Alert, Spinner } from "react-bootstrap";
import DistributorLayout from "../../../components/distributor/Distributorlayout";
import { getDistributorNotifications } from "../../../services/api";

export default function DistributorNotifications() {
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getDistributorNotifications();
      setNotifications(data.notifications || []);
    } catch (err) {
      setError(err.detail || "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  const getNotificationVariant = (type) => {
    switch (type) {
      case "INCOMING_TRANSFER": return "primary";
      case "OUTGOING_TRANSFER": return "success";
      case "EXPIRY_ALERT": return "warning";
      case "RECALL_NOTICE": return "danger";
      case "LOW_STOCK": return "info";
      case "EXPIRING_SOON": return "warning";
      case "PENDING_TRANSFER": return "secondary";
      default: return "secondary";
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
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
          <h2 className="mb-1 fw-bold">Notifications</h2>
          <p className="text-muted mb-0">Stay updated with recent activity</p>
        </div>
        <Button variant="outline-primary" onClick={loadNotifications} size="sm">
          Refresh
        </Button>
      </div>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Summary */}
      <Card className="border-0 shadow-sm mb-4">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h5 className="mb-1 fw-bold">Total Notifications</h5>
              <p className="text-muted mb-0">
                You have <strong>{notifications.length}</strong> recent notifications
              </p>
            </div>
            <div style={{
              width: "60px",
              height: "60px",
              borderRadius: "12px",
              backgroundColor: "#e0e7ff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.5rem",
              fontWeight: "bold",
              color: "#6366f1"
            }}>
              {notifications.length}
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Notifications List */}
      <Card className="border-0 shadow-sm">
        <Card.Body>
          {notifications.length === 0 ? (
            <div className="text-center py-5">
              <div style={{
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                backgroundColor: "#f3f4f6",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "2rem",
                margin: "0 auto 1rem",
                color: "#9ca3af"
              }}>
                —
              </div>
              <h5 className="text-muted">No Notifications</h5>
              <p className="text-muted mb-0">You're all caught up!</p>
            </div>
          ) : (
            <ListGroup variant="flush">
              {notifications.map((notification) => (
                <ListGroup.Item 
                  key={notification.id}
                  className="border-start border-4 mb-2"
                  style={{ 
                    borderLeftColor: `var(--bs-${getNotificationVariant(notification.type)})`,
                    backgroundColor: notification.read ? "white" : "#f8f9fa",
                    cursor: notification.batch_id ? "pointer" : "default"
                  }}
                  onClick={() => {
                    if (notification.batch_id) {
                      window.location.href = `/dashboard/distributor/verify?batch=${notification.batch_id}`;
                    }
                  }}
                >
                  <div className="d-flex">
                    <div className="flex-grow-1">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <div>
                          <Badge 
                            bg={getNotificationVariant(notification.type)}
                            className="mb-2"
                          >
                            {notification.type?.replace(/_/g, ' ')}
                          </Badge>
                        </div>
                        {!notification.read && (
                          <div style={{
                            width: "10px",
                            height: "10px",
                            borderRadius: "50%",
                            backgroundColor: "#3b82f6"
                          }} />
                        )}
                      </div>
                      <p className="mb-1">{notification.message}</p>
                      {notification.batch_id && (
                        <small className="text-muted">
                          Batch ID: <code className="px-2 py-1 bg-light rounded">{notification.batch_id}</code>
                        </small>
                      )}
                      <div className="mt-2">
                        <small className="text-muted">{formatTimestamp(notification.timestamp)}</small>
                      </div>
                    </div>
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </Card.Body>
      </Card>

      {/* Legend */}
      <Card className="border-0 shadow-sm mt-4 bg-light">
        <Card.Body>
          <h6 className="mb-3 fw-bold">Notification Types</h6>
          <div className="row g-3">
            <div className="col-md-6">
              <p className="mb-2">
                <Badge bg="primary">INCOMING TRANSFER</Badge> - New batch received from manufacturer
              </p>
              <p className="mb-2">
                <Badge bg="success">OUTGOING TRANSFER</Badge> - Batch transferred to warehouse
              </p>
              <p className="mb-2">
                <Badge bg="warning">EXPIRY ALERT</Badge> - Batch nearing expiry date
              </p>
            </div>
            <div className="col-md-6">
              <p className="mb-2">
                <Badge bg="danger">RECALL NOTICE</Badge> - Batch recalled by authority
              </p>
              <p className="mb-2">
                <Badge bg="info">LOW STOCK</Badge> - Stock level below threshold
              </p>
            </div>
          </div>
        </Card.Body>
      </Card>
    </DistributorLayout>
  );
}