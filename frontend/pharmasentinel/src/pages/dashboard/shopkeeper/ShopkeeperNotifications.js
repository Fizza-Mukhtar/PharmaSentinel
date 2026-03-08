// src/pages/shopkeeper/ShopkeeperNotifications.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Row, Col, Card, Button, Spinner, Badge, Form } from "react-bootstrap";
import ShopkeeperLayout from "../../../components/shopkeeper/ShopkeeperLayout";
import { getShopkeeperNotifications } from "../../../services/api";

export default function ShopkeeperNotifications() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [filterType, setFilterType] = useState("All");
  const [filterPriority, setFilterPriority] = useState("All");

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const response = await getShopkeeperNotifications();
      const notifs = response?.notifications || response?.data?.notifications || [];
      setNotifications(notifs);
    } catch (error) {
      console.error("Failed to load notifications:", error);
      alert("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "CRITICAL": return "#ef4444";
      case "HIGH": return "#f59e0b";
      case "MEDIUM": return "#3b82f6";
      case "LOW": return "#6b7280";
      case "INFO": return "#10b981";
      default: return "#6b7280";
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "INCOMING_TRANSFER": return "bi-inbox";
      case "LOW_STOCK": return "bi-exclamation-triangle";
      case "EXPIRING_SOON": return "bi-clock-history";
      case "EXPIRED": return "bi-x-circle";
      case "SALE": return "bi-cart-check";
      default: return "bi-bell";
    }
  };

  const handleNotificationClick = (notification) => {
    const type = notification.type;
    if (!type) return;

    if (type === "INCOMING_TRANSFER") navigate("/dashboard/shopkeeper/incoming");
    else if (["LOW_STOCK", "EXPIRING_SOON", "EXPIRED"].includes(type)) navigate("/dashboard/shopkeeper/inventory");
    else if (type === "SALE") navigate("/dashboard/shopkeeper/sales-history");
  };

  const filteredNotifications = notifications.filter(n => {
    if (filterType !== "All" && n.type !== filterType) return false;
    if (filterPriority !== "All" && n.priority !== filterPriority) return false;
    return true;
  });

  const groupedNotifications = ["CRITICAL","HIGH","MEDIUM","LOW","INFO"].reduce((acc, p) => {
    acc[p] = filteredNotifications.filter(n => n.priority === p);
    return acc;
  }, {});

  if (loading) return (
    <ShopkeeperLayout>
      <div className="text-center py-5">
        <Spinner animation="border" variant="success" />
        <p className="mt-3 text-muted">Loading notifications...</p>
      </div>
    </ShopkeeperLayout>
  );

  return (
    <ShopkeeperLayout>
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" />

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">
            <i className="bi bi-bell me-2" style={{ color: "#10b981" }}></i>
            Notifications
          </h2>
          <p className="text-muted mb-0">Stay updated with important alerts</p>
        </div>
        <Button variant="outline-secondary" onClick={loadNotifications}>
          <i className="bi bi-arrow-clockwise me-2"></i>
          Refresh
        </Button>
      </div>

      {/* Summary */}
      <Row className="mb-4">
        <Col md={6}>
          <Card className="border-0 shadow-sm h-100" style={{ borderLeft: "4px solid #10b981" }}>
            <Card.Body>
              <div className="d-flex align-items-center gap-3">
                <div style={{ fontSize: "3rem", color: "#10b981" }}>
                  <i className="bi bi-bell"></i>
                </div>
                <div>
                  <h3 className="mb-0 fw-bold" style={{ color: "#10b981" }}>{filteredNotifications.length}</h3>
                  <small className="text-muted">Total Notifications</small>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="border-0 shadow-sm h-100" style={{ borderLeft: "4px solid #ef4444" }}>
            <Card.Body>
              <div className="d-flex align-items-center gap-3">
                <div style={{ fontSize: "3rem", color: "#ef4444" }}>
                  <i className="bi bi-exclamation-triangle"></i>
                </div>
                <div>
                  <h3 className="mb-0 fw-bold" style={{ color: "#ef4444" }}>
                    {groupedNotifications.CRITICAL.length + groupedNotifications.HIGH.length}
                  </h3>
                  <small className="text-muted">Critical & High Priority</small>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card className="border-0 shadow-sm mb-4">
        <Card.Body>
          <h6 className="mb-3 fw-semibold" style={{ color: "#10b981" }}>
            <i className="bi bi-funnel me-2"></i>
            Filter Notifications
          </h6>
          <Row>
            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-semibold small">Notification Type</Form.Label>
                <Form.Select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                  <option>All</option>
                  <option value="INCOMING_TRANSFER">Incoming Transfers</option>
                  <option value="LOW_STOCK">Low Stock</option>
                  <option value="EXPIRING_SOON">Expiring Soon</option>
                  <option value="EXPIRED">Expired</option>
                  <option value="SALE">Sales</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-semibold small">Priority Level</Form.Label>
                <Form.Select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)}>
                  <option>All</option>
                  <option value="CRITICAL">Critical</option>
                  <option value="HIGH">High</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="LOW">Low</option>
                  <option value="INFO">Info</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Notification List */}
      {filteredNotifications.length > 0 ? (
        ["CRITICAL","HIGH","MEDIUM","LOW","INFO"].map(priority => {
          if (!groupedNotifications[priority].length) return null;
          const colorMap = {CRITICAL:"#ef4444",HIGH:"#f59e0b",MEDIUM:"#3b82f6",LOW:"#6b7280",INFO:"#10b981"};
          return (
            <Card key={priority} className="border-0 shadow-sm mb-4" style={{ borderLeft: `4px solid ${colorMap[priority]}` }}>
              <Card.Body>
                <h5 className="mb-3 fw-semibold" style={{ color: colorMap[priority] }}>
                  <i className="bi bi-info-circle me-2"></i>
                  {priority === "CRITICAL" || priority === "HIGH" ? "Critical & High Priority" : 
                   priority === "MEDIUM" ? "Medium Priority" : "Low Priority & Info"}
                </h5>
                {groupedNotifications[priority].map(notif => (
                  <Card
                    key={notif.id}
                    className="mb-2"
                    style={{
                      backgroundColor: "#f9fafb",
                      border: "1px solid #e5e7eb",
                      cursor: "pointer",
                      transition: "all 0.2s"
                    }}
                    onClick={() => handleNotificationClick(notif)}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = "#f3f4f6"}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = "#f9fafb"}
                  >
                    <Card.Body className="p-3">
                      <div className="d-flex align-items-start gap-3">
                        <div style={{ fontSize: "1.5rem", color: getPriorityColor(notif.priority) }}>
                          <i className={`bi ${getNotificationIcon(notif.type)}`}></i>
                        </div>
                        <div className="flex-grow-1">
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <div>
                              <Badge style={{ backgroundColor: getPriorityColor(notif.priority) }} className="me-2">
                                {notif.priority}
                              </Badge>
                              <Badge bg="secondary">{notif.type.replace(/_/g, " ")}</Badge>
                            </div>
                            <small className="text-muted">{new Date(notif.timestamp).toLocaleString()}</small>
                          </div>
                          <p className="mb-0">{notif.message}</p>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                ))}
              </Card.Body>
            </Card>
          );
        })
      ) : (
        <Card className="border-0 shadow-sm">
          <Card.Body>
            <div className="text-center py-5">
              <i className="bi bi-bell-slash" style={{ fontSize: "4rem", color: "#d1d5db" }}></i>
              <h5 className="text-muted mt-3">No notifications</h5>
              <p className="text-muted small">
                {filterType !== "All" || filterPriority !== "All" ? "Try adjusting your filters" : "You're all caught up!"}
              </p>
            </div>
          </Card.Body>
        </Card>
      )}
    </ShopkeeperLayout>
  );
}