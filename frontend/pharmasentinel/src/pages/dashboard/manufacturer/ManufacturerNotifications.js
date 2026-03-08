// src/pages/manufacturer/ManufacturerNotifications.js
import React, { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Badge,
  Spinner,
  Alert,
  Button,
  Form,
  InputGroup,
  ListGroup,
} from "react-bootstrap";
import {
  FaBell,
  FaExclamationTriangle,
  FaClock,
  FaInfoCircle,
  FaCheckCircle,
  FaFilter,
  FaSync,
  FaEnvelope,
  FaBox,
  FaExchangeAlt,
} from "react-icons/fa";
import ManufacturerLayout from "../../../components/manufacturer/ManufacturerLayout";
import { getManufacturerNotifications } from "../../../services/api";

export default function ManufacturerNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterType, setFilterType] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  const loadNotifications = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getManufacturerNotifications();
      setNotifications(data.notifications || []);
    } catch (err) {
      console.error("Error loading notifications:", err);
      setError("Failed to load notifications. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const getFilteredNotifications = () => {
    return notifications.filter((notif) => {
      const matchesFilter = filterType === "ALL" || notif.type === filterType;
      const matchesSearch =
        notif.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (notif.batch_id && notif.batch_id.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchesFilter && matchesSearch;
    });
  };

  const filteredNotifications = getFilteredNotifications();

  const getNotificationIcon = (type) => {
    switch (type) {
      case "LOW_STOCK":
        return <FaExclamationTriangle className="text-danger" />;
      case "EXPIRING_SOON":
        return <FaClock className="text-warning" />;
      case "PENDING_TRANSFER":
        return <FaExchangeAlt className="text-info" />;
      case "CRITICAL":
        return <FaExclamationTriangle className="text-danger" />;
      default:
        return <FaInfoCircle className="text-primary" />;
    }
  };

  const getPriorityBadge = (priority) => {
    const variants = {
      CRITICAL: "danger",
      HIGH: "warning",
      MEDIUM: "info",
      LOW: "secondary",
      INFO: "primary",
    };
    return variants[priority] || "secondary";
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
    return date.toLocaleDateString();
  };

  const notificationTypes = [
    { value: "ALL", label: "All Notifications", count: notifications.length },
    {
      value: "LOW_STOCK",
      label: "Low Stock",
      count: notifications.filter((n) => n.type === "LOW_STOCK").length,
    },
    {
      value: "EXPIRING_SOON",
      label: "Expiring Soon",
      count: notifications.filter((n) => n.type === "EXPIRING_SOON").length,
    },
    {
      value: "PENDING_TRANSFER",
      label: "Pending Transfers",
      count: notifications.filter((n) => n.type === "PENDING_TRANSFER").length,
    },
  ];

  return (
    <ManufacturerLayout>
      <Container fluid className="py-4">
        {/* Header */}
        <Row className="align-items-center mb-4">
          <Col>
            <h2 className="fw-bold mb-1">
              <FaBell className="me-2 text-primary" />
              Notifications
            </h2>
            <p className="text-muted mb-0">
              Stay updated with your medicine batches and transfers
            </p>
          </Col>
          <Col xs="auto">
            <Button
              size="sm"
              variant="outline-primary"
              onClick={loadNotifications}
              disabled={loading}
            >
              {loading ? (
                <Spinner size="sm" animation="border" />
              ) : (
                <FaSync />
              )}
              <span className="ms-2">Refresh</span>
            </Button>
          </Col>
        </Row>

        {/* Error Alert */}
        {error && (
          <Alert variant="danger" dismissible onClose={() => setError(null)}>
            <FaExclamationTriangle className="me-2" />
            {error}
          </Alert>
        )}

        {/* Stats Cards */}
        <Row className="mb-4 g-3">
          {notificationTypes.map((type, idx) => (
            <Col md={6} lg={3} key={idx}>
              <Card
                className={`border-0 shadow-sm h-100 ${
                  filterType === type.value ? "border-primary" : ""
                }`}
                style={{
                  cursor: "pointer",
                  transition: "all 0.2s",
                  borderWidth: filterType === type.value ? "2px" : "0",
                }}
                onClick={() => setFilterType(type.value)}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.transform = "translateY(-2px)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.transform = "translateY(0)")
                }
              >
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <div className="text-muted small mb-1">{type.label}</div>
                      <h3 className="fw-bold mb-0">{type.count}</h3>
                    </div>
                    <Badge
                      bg={filterType === type.value ? "primary" : "light"}
                      text={filterType === type.value ? "white" : "dark"}
                      style={{ fontSize: "1.5rem" }}
                    >
                      <FaBell />
                    </Badge>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Search Bar */}
        <Row className="mb-4">
          <Col>
            <InputGroup>
              <InputGroup.Text className="bg-white">
                <FaFilter className="text-muted" />
              </InputGroup.Text>
              <Form.Control
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>
          </Col>
        </Row>

        {/* Notifications List */}
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <p className="text-muted mt-3">Loading notifications...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <Card className="border-0 shadow-sm">
            <Card.Body className="text-center py-5">
              <FaCheckCircle size={64} className="text-success mb-3 opacity-25" />
              <h5 className="text-muted">No notifications found</h5>
              <p className="text-muted mb-0">
                {searchTerm || filterType !== "ALL"
                  ? "Try adjusting your filters"
                  : "You're all caught up!"}
              </p>
            </Card.Body>
          </Card>
        ) : (
          <Card className="border-0 shadow-sm">
            <Card.Body className="p-0">
              <ListGroup variant="flush">
                {filteredNotifications.map((notif, idx) => (
                  <ListGroup.Item
                    key={notif.id}
                    className="border-start-0 border-end-0 py-3"
                    style={{
                      borderLeftWidth: "4px",
                      borderLeftStyle: "solid",
                      borderLeftColor:
                        notif.priority === "CRITICAL"
                          ? "#dc3545"
                          : notif.priority === "HIGH"
                          ? "#fd7e14"
                          : notif.priority === "MEDIUM"
                          ? "#0dcaf0"
                          : "#6c757d",
                    }}
                  >
                    <Row className="align-items-center">
                      <Col xs="auto">
                        <div
                          className="rounded-circle d-flex align-items-center justify-content-center"
                          style={{
                            width: "48px",
                            height: "48px",
                            backgroundColor: "#f8f9fa",
                            fontSize: "1.5rem",
                          }}
                        >
                          {getNotificationIcon(notif.type)}
                        </div>
                      </Col>
                      <Col>
                        <div className="d-flex justify-content-between align-items-start mb-1">
                          <div>
                            <Badge
                              bg={getPriorityBadge(notif.priority)}
                              className="me-2"
                            >
                              {notif.priority}
                            </Badge>
                            {notif.batch_id && (
                              <code className="bg-light px-2 py-1 rounded small">
                                {notif.batch_id}
                              </code>
                            )}
                          </div>
                          <small className="text-muted">
                            {formatTimestamp(notif.timestamp)}
                          </small>
                        </div>
                        <p className="mb-0 fw-semibold">{notif.message}</p>
                        {notif.expiry_date && (
                          <small className="text-muted">
                            Expires: {new Date(notif.expiry_date).toLocaleDateString()}
                          </small>
                        )}
                        {notif.remaining_quantity !== undefined && (
                          <small className="text-muted ms-2">
                            Stock: {notif.remaining_quantity} units
                          </small>
                        )}
                      </Col>
                    </Row>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Card.Body>
            <Card.Footer className="bg-white border-top text-center py-3">
              <small className="text-muted">
                Showing {filteredNotifications.length} of {notifications.length}{" "}
                notifications
              </small>
            </Card.Footer>
          </Card>
        )}
      </Container>
    </ManufacturerLayout>
  );
}