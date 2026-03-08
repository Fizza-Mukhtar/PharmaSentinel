import React, { useState, useEffect, useRef } from "react";
import { Button, Badge, Card, ListGroup, Spinner } from "react-bootstrap";
import { FaBell, FaArrowDown, FaArrowUp, FaExclamationTriangle, FaExclamationCircle, FaSync } from "react-icons/fa";
import { getShopkeeperNotifications } from "../services/api";

export default function DashboardNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);

  const dropdownRef = useRef(null);

  useEffect(() => {
    if (show) fetchNotifications();
  }, [show]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShow(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await getShopkeeperNotifications();
      setNotifications(data.notifications || []);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "INCOMING_TRANSFER": return <FaArrowDown className="text-primary" />;
      case "EXPIRY_ALERT": return <FaExclamationTriangle className="text-warning" />;
      case "FRAUD_ALERT": return <FaExclamationCircle className="text-danger" />;
      case "OUTGOING_TRANSFER": return <FaArrowUp className="text-success" />;
      default: return <FaBell className="text-secondary" />;
    }
  };

  return (
    <div className="position-relative" ref={dropdownRef}>
      <Button variant="link" className="position-relative text-dark" onClick={() => setShow(!show)}>
        <FaBell size={20} />
        {notifications.filter(n => !n.read).length > 0 && (
          <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
            {notifications.filter(n => !n.read).length}
          </span>
        )}
      </Button>

      {show && (
        <Card className="position-absolute shadow-sm" style={{ width: "320px", right: 0, top: "36px", zIndex: 999 }}>
          <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
            <strong>Notifications</strong>
            <Button variant="light" size="sm" onClick={fetchNotifications} disabled={loading}>
              <FaSync className={loading ? "spin" : ""} />
            </Button>
          </Card.Header>
          <Card.Body className="p-0" style={{ maxHeight: "400px", overflowY: "auto" }}>
            {loading ? (
              <div className="text-center py-4">
                <Spinner animation="border" size="sm" /> Loading...
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-4 text-muted">No notifications</div>
            ) : (
              <ListGroup variant="flush">
                {notifications.slice(0, 10).map(n => (
                  <ListGroup.Item key={n.id} className={!n.read ? "bg-light" : ""}>
                    <div className="d-flex align-items-start">
                      <div className="me-2 fs-5">{getNotificationIcon(n.type)}</div>
                      <div className="flex-grow-1">
                        <strong>{n.message}</strong>
                        {n.batch_id && <div className="text-muted small">Batch ID: <code>{n.batch_id}</code></div>}
                        <div className="text-muted small">{new Date(n.timestamp).toLocaleString()}</div>
                      </div>
                      {!n.read && <Badge bg="danger" pill className="ms-2">New</Badge>}
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            )}
          </Card.Body>
        </Card>
      )}
    </div>
  );
}
