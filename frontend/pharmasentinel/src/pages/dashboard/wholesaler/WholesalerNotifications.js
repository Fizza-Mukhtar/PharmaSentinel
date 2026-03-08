// src/pages/wholesaler/wholesalerNotifications.js
import React, { useState, useEffect } from "react";
import { Card, Badge, ListGroup, Button, Alert } from "react-bootstrap";
import WholesalerLayout from "../../../components/wholesaler/WholesalerLayout";
import { getWholesalerNotifications } from "../../../services/api";

export default function WholesalerNotifications() {
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
      const data = await getWholesalerNotifications();
      setNotifications(data.notifications || []);
    } catch (err) {
      setError(err.detail || "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "INCOMING_TRANSFER": return "📥";
      case "OUTGOING_TRANSFER": return "📤";
      case "EXPIRY_ALERT": return "⚠️";
      case "RECALL_NOTICE": return "⛔";
      case "LOW_STOCK": return "📉";
      default: return "🔔";
    }
  };

  const getNotificationVariant = (type) => {
    switch (type) {
      case "INCOMING_TRANSFER": return "primary";
      case "OUTGOING_TRANSFER": return "success";
      case "EXPIRY_ALERT": return "warning";
      case "RECALL_NOTICE": return "danger";
      case "LOW_STOCK": return "info";
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
      <WholesalerLayout>
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </WholesalerLayout>
    );
  }

  return (
    <WholesalerLayout>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">🔔 Notifications</h2>
          <p className="text-muted mb-0">Stay updated with recent activity</p>
        </div>
        <Button variant="outline-primary" onClick={loadNotifications}>
          🔄 Refresh
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
              <h5 className="mb-1">Total Notifications</h5>
              <p className="text-muted mb-0">
                You have <strong>{notifications.length}</strong> recent notifications
              </p>
            </div>
            <div style={{
              width: "60px",
              height: "60px",
              borderRadius: "50%",
              backgroundColor: "#e0e7ff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.5rem"
            }}>
              🔔
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
                fontSize: "2.5rem",
                margin: "0 auto 1rem"
              }}>
                🔕
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
                    cursor: "pointer"
                  }}
                  onClick={() => {
                    if (notification.batch_id) {
                      window.location.href = `/wholesaler/verify?batch=${notification.batch_id}`;
                    }
                  }}
                >
                  <div className="d-flex">
                    <div className="me-3" style={{ fontSize: "2rem" }}>
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-grow-1">
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <Badge 
                            bg={getNotificationVariant(notification.type)}
                            className="mb-2"
                          >
                            {notification.type?.replace(/_/g, ' ')}
                          </Badge>
                          <p className="mb-1">{notification.message}</p>
                          {notification.batch_id && (
                            <small className="text-muted">
                              Batch ID: <code>{notification.batch_id}</code>
                            </small>
                          )}
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
                      <small className="text-muted">{formatTimestamp(notification.timestamp)}</small>
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
          <h6 className="mb-3">📋 Notification Types</h6>
          <div className="row">
            <div className="col-md-6">
              <p className="mb-2">
                <Badge bg="primary">INCOMING TRANSFER</Badge> - New batch received from warehouse
              </p>
              <p className="mb-2">
                <Badge bg="success">OUTGOING TRANSFER</Badge> - Batch transferred to shopkeeper
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
    </WholesalerLayout>
  );
}
