// src/pages/dashboard/drap/Notifications.jsx - FIXED VERSION
import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Badge, Form, ButtonGroup, Button, Modal } from 'react-bootstrap';
import { 
  FaBell, FaExclamationTriangle, FaExclamationCircle, FaInfoCircle,
  FaClock, FaCheckCircle, FaFilter, FaSync, FaEye,
  FaBoxes, FaIndustry, FaNetworkWired, FaShieldAlt, FaBan
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { getDrapNotifications } from '../../../services/api';
import './Notifications.css';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    critical: 0,
    high: 0,
    medium: 0,
    unread: 0
  });

  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    filterNotifications();
  }, [priorityFilter, typeFilter, notifications]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await getDrapNotifications();
      
      if (response.success) {
        setNotifications(response.notifications);
        setStats({
          total: response.total_count,
          critical: response.priority_breakdown?.critical || 0,
          high: response.priority_breakdown?.high || 0,
          medium: response.priority_breakdown?.medium || 0,
          unread: response.unread_count
        });
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterNotifications = () => {
    let filtered = [...notifications];

    if (priorityFilter !== 'all') {
      filtered = filtered.filter(n => n.priority?.toLowerCase() === priorityFilter.toLowerCase());
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(n => n.type === typeFilter);
    }

    setFilteredNotifications(filtered);
  };

  const getPriorityIcon = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'critical':
        return <FaExclamationTriangle />;
      case 'high':
        return <FaExclamationCircle />;
      case 'medium':
        return <FaInfoCircle />;
      case 'low':
        return <FaClock />;
      default:
        return <FaBell />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'critical':
        return '#dc2626';
      case 'high':
        return '#f59e0b';
      case 'medium':
        return '#3b82f6';
      case 'low':
        return '#64748b';
      default:
        return '#6b7280';
    }
  };

  const getTypeIcon = (type) => {
    const iconMap = {
      'SUSPICIOUS_MEDICINE_REPORT': <FaBan />,
      'EXPIRED_BATCH_ALERT': <FaBan />,
      'EXPIRING_SOON_ALERT': <FaClock />,
      'BLOCKCHAIN_INTEGRITY_ALERT': <FaShieldAlt />,
      'MISSING_BLOCKCHAIN_ALERT': <FaShieldAlt />,
      'PENDING_TRANSFERS_SUMMARY': <FaNetworkWired />,
      'NEW_MANUFACTURER_JOINED': <FaIndustry />,
      'LOW_STOCK_ALERT': <FaBoxes />,
      'REJECTED_TRANSFER': <FaBan />
    };
    return iconMap[type] || <FaBell />;
  };

  const handleNotificationClick = (notification) => {
    setSelectedNotification(notification);
    setShowDetailModal(true);
  };

  // ✅ FIXED: Proper navigation based on notification type
  const handleNavigate = (notification) => {
    setShowDetailModal(false);
    
    // ✅ Navigate to report detail if it's a suspicious report
    if (notification.navigate_to === 'report_detail' && notification.report_id) {
      navigate(`/dashboard/drap/reports/${notification.report_id}`);
    } 
    // ✅ Navigate to batch detail for other types
    else if (notification.navigate_to === 'batch_detail' && notification.batch_id) {
      navigate(`/dashboard/drap/batches/${notification.batch_id}`);
    }
    // ✅ Fallback: Show all reports
    else if (notification.type === 'SUSPICIOUS_MEDICINE_REPORT') {
      navigate('/dashboard/drap/reports');
    }
  };

  const StatCard = ({ icon, title, value, color, bgColor }) => (
    <Card className="notification-stat-card">
      <Card.Body>
        <div className="notification-stat-content">
          <div className="notification-stat-icon" style={{ backgroundColor: bgColor, color }}>
            {icon}
          </div>
          <div className="notification-stat-details">
            <p className="notification-stat-label">{title}</p>
            <h3 className="notification-stat-value">{value}</h3>
          </div>
        </div>
      </Card.Body>
    </Card>
  );

  if (loading && notifications.length === 0) {
    return (
      <div className="loading-container">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="notifications-page">
      {/* Header */}
      <div className="notifications-header">
        <div>
          <h2 className="notifications-title">
            <FaBell className="me-2" />
            System Notifications
          </h2>
          <p className="notifications-subtitle">
            Real-time alerts and system events
          </p>
        </div>
        <Button 
          variant="outline-primary" 
          onClick={fetchNotifications}
          disabled={loading}
          className="btn-refresh"
        >
          <FaSync className={loading ? 'fa-spin' : ''} />
          <span className="ms-2">Refresh</span>
        </Button>
      </div>

      {/* Stats Overview */}
      <Row className="g-3 mb-4">
        <Col lg={3} md={6}>
          <StatCard
            icon={<FaBell size={24} />}
            title="Total Notifications"
            value={stats.total}
            color="#1e3a8a"
            bgColor="#dbeafe"
          />
        </Col>
        <Col lg={3} md={6}>
          <StatCard
            icon={<FaExclamationTriangle size={24} />}
            title="Critical"
            value={stats.critical}
            color="#dc2626"
            bgColor="#fee2e2"
          />
        </Col>
        <Col lg={3} md={6}>
          <StatCard
            icon={<FaExclamationCircle size={24} />}
            title="High Priority"
            value={stats.high}
            color="#f59e0b"
            bgColor="#fef3c7"
          />
        </Col>
        <Col lg={3} md={6}>
          <StatCard
            icon={<FaCheckCircle size={24} />}
            title="Unread"
            value={stats.unread}
            color="#10b981"
            bgColor="#d1fae5"
          />
        </Col>
      </Row>

      {/* Filters */}
      <Card className="filter-card-notif mb-4">
        <Card.Body>
          <Row className="align-items-center g-3">
            <Col lg={6}>
              <div className="d-flex align-items-center gap-2">
                <FaFilter className="text-muted" />
                <span className="fw-semibold">Priority:</span>
                <ButtonGroup>
                  <Button
                    variant={priorityFilter === 'all' ? 'primary' : 'outline-secondary'}
                    size="sm"
                    onClick={() => setPriorityFilter('all')}
                  >
                    All
                  </Button>
                  <Button
                    variant={priorityFilter === 'critical' ? 'danger' : 'outline-secondary'}
                    size="sm"
                    onClick={() => setPriorityFilter('critical')}
                  >
                    Critical
                  </Button>
                  <Button
                    variant={priorityFilter === 'high' ? 'warning' : 'outline-secondary'}
                    size="sm"
                    onClick={() => setPriorityFilter('high')}
                  >
                    High
                  </Button>
                  <Button
                    variant={priorityFilter === 'medium' ? 'info' : 'outline-secondary'}
                    size="sm"
                    onClick={() => setPriorityFilter('medium')}
                  >
                    Medium
                  </Button>
                </ButtonGroup>
              </div>
            </Col>
            <Col lg={6}>
              <Form.Select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="all">All Types</option>
                <option value="SUSPICIOUS_MEDICINE_REPORT">🚨 Counterfeit Reports</option>
                <option value="EXPIRED_BATCH_ALERT">Expired Batches</option>
                <option value="EXPIRING_SOON_ALERT">Expiring Soon</option>
                <option value="BLOCKCHAIN_INTEGRITY_ALERT">Blockchain Issues</option>
                <option value="PENDING_TRANSFERS_SUMMARY">Pending Transfers</option>
              </Form.Select>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Notifications List */}
      <Card className="notifications-list-card">
        <Card.Body>
          {filteredNotifications.length === 0 ? (
            <div className="empty-notifications">
              <FaBell size={64} className="text-muted mb-3" />
              <h4>No Notifications</h4>
              <p className="text-muted">
                {priorityFilter !== 'all' || typeFilter !== 'all' 
                  ? 'No notifications match your filters'
                  : 'All caught up! No new notifications.'}
              </p>
            </div>
          ) : (
            <div className="notifications-list">
              {filteredNotifications.map((notification, index) => (
                <div
                  key={notification.id || index}
                  className={`notification-item ${!notification.read ? 'unread' : ''}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div 
                    className="notification-priority-bar"
                    style={{ backgroundColor: getPriorityColor(notification.priority) }}
                  />
                  
                  <div className="notification-icon" style={{ 
                    backgroundColor: `${getPriorityColor(notification.priority)}15`,
                    color: getPriorityColor(notification.priority)
                  }}>
                    {getTypeIcon(notification.type)}
                  </div>

                  <div className="notification-content">
                    <div className="notification-header-content">
                      <div className="notification-title-row">
                        <h6 className="notification-title">
                          {notification.message}
                        </h6>
                        <Badge 
                          bg={notification.priority?.toLowerCase() === 'critical' ? 'danger' : 
                              notification.priority?.toLowerCase() === 'high' ? 'warning' :
                              notification.priority?.toLowerCase() === 'medium' ? 'info' : 'secondary'}
                          className="notification-badge"
                        >
                          {notification.priority}
                        </Badge>
                      </div>
                      
                      {/* ✅ FIXED: Show appropriate info based on type */}
                      {notification.type === 'SUSPICIOUS_MEDICINE_REPORT' && (
                        <>
                          <p className="notification-meta">
                            <FaBan className="me-1" />
                            Reporter: <strong>{notification.reporter_name}</strong>
                          </p>
                          <p className="notification-meta">
                            📞 {notification.reporter_phone}
                          </p>
                        </>
                      )}
                      
                      {notification.batch_id && (
                        <p className="notification-meta">
                          <FaBoxes className="me-1" />
                          Batch: <strong>{notification.batch_id}</strong>
                        </p>
                      )}
                      
                      {notification.manufacturer && (
                        <p className="notification-meta">
                          <FaIndustry className="me-1" />
                          Manufacturer: <strong>{notification.manufacturer}</strong>
                        </p>
                      )}

                      <p className="notification-time">
                        <FaClock className="me-1" />
                        {new Date(notification.timestamp).toLocaleString()}
                      </p>
                    </div>

                    {notification.action_required && (
                      <div className="notification-action">
                        <FaExclamationCircle className="me-2" />
                        <span>Action Required</span>
                      </div>
                    )}
                  </div>

                  <div className="notification-arrow">
                    <FaEye />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Notification Detail Modal */}
      <Modal 
        show={showDetailModal} 
        onHide={() => setShowDetailModal(false)}
        centered
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <div className="d-flex align-items-center gap-2">
              <div 
                className="modal-priority-icon"
                style={{ 
                  backgroundColor: `${getPriorityColor(selectedNotification?.priority)}15`,
                  color: getPriorityColor(selectedNotification?.priority)
                }}
              >
                {getPriorityIcon(selectedNotification?.priority)}
              </div>
              Notification Details
            </div>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedNotification && (
            <div className="notification-detail">
              <div className="detail-priority mb-3">
                <Badge 
                  bg={selectedNotification.priority?.toLowerCase() === 'critical' ? 'danger' : 
                      selectedNotification.priority?.toLowerCase() === 'high' ? 'warning' :
                      selectedNotification.priority?.toLowerCase() === 'medium' ? 'info' : 'secondary'}
                  className="px-3 py-2"
                >
                  {selectedNotification.priority} Priority
                </Badge>
              </div>

              <h5 className="mb-3">{selectedNotification.message}</h5>

              <div className="detail-info">
                {/* ✅ Show report-specific info */}
                {selectedNotification.type === 'SUSPICIOUS_MEDICINE_REPORT' && (
                  <>
                    <div className="info-row">
                      <strong>Reporter:</strong>
                      <span>{selectedNotification.reporter_name}</span>
                    </div>
                    <div className="info-row">
                      <strong>Phone:</strong>
                      <span>{selectedNotification.reporter_phone}</span>
                    </div>
                    <div className="info-row">
                      <strong>Location:</strong>
                      <span>{selectedNotification.location}</span>
                    </div>
                  </>
                )}

                {selectedNotification.batch_id && (
                  <div className="info-row">
                    <strong>Batch ID:</strong>
                    <span>{selectedNotification.batch_id}</span>
                  </div>
                )}
                
                {selectedNotification.manufacturer && (
                  <div className="info-row">
                    <strong>Manufacturer:</strong>
                    <span>{selectedNotification.manufacturer}</span>
                  </div>
                )}

                {selectedNotification.current_holder && (
                  <div className="info-row">
                    <strong>Current Holder:</strong>
                    <span>{selectedNotification.current_holder}</span>
                  </div>
                )}

                {selectedNotification.expiry_date && (
                  <div className="info-row">
                    <strong>Expiry Date:</strong>
                    <span>{new Date(selectedNotification.expiry_date).toLocaleDateString()}</span>
                  </div>
                )}

                {selectedNotification.remaining_quantity !== undefined && (
                  <div className="info-row">
                    <strong>Remaining Quantity:</strong>
                    <span>{selectedNotification.remaining_quantity} units</span>
                  </div>
                )}

                <div className="info-row">
                  <strong>Timestamp:</strong>
                  <span>{new Date(selectedNotification.timestamp).toLocaleString()}</span>
                </div>
              </div>

              {selectedNotification.action_required && (
                <div className="alert alert-warning mt-3">
                  <FaExclamationCircle className="me-2" />
                  <strong>Action Required:</strong> This notification requires immediate attention.
                </div>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetailModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={() => handleNavigate(selectedNotification)}>
            <FaEye className="me-2" />
            View Full Details
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Notifications;