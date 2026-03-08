import React, { useState, useEffect } from 'react';
import './DrapResponsive.css';
import { Row, Col, Card, Table, Badge, InputGroup, Form, Button } from 'react-bootstrap';
import { 
  FaStoreAlt, FaSearch, FaFilter, FaBoxes, FaCheckCircle,
  FaExchangeAlt, FaCalendar, FaEnvelope, FaDownload
} from 'react-icons/fa';
import { getDrapWholesalers } from '../../../services/api';
import './Stakeholders.css';

const Wholesalers = () => {
  const [wholesalers, setWholesalers] = useState([]);
  const [filteredWholesalers, setFilteredWholesalers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchWholesalers();
  }, []);

  useEffect(() => {
    filterWholesalers();
  }, [searchTerm, statusFilter, wholesalers]);

  const fetchWholesalers = async () => {
    try {
      setLoading(true);
      const response = await getDrapWholesalers();
      
      if (response.success) {
        setWholesalers(response.wholesalers);
      }
    } catch (error) {
      console.error('Error fetching wholesalers:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterWholesalers = () => {
    let filtered = [...wholesalers];

    if (searchTerm) {
      filtered = filtered.filter(w => 
        w.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(w => 
        statusFilter === 'active' ? w.is_active : !w.is_active
      );
    }

    setFilteredWholesalers(filtered);
  };

  const stats = {
    total: wholesalers.length,
    active: wholesalers.filter(w => w.is_active).length,
    totalInventory: wholesalers.reduce((sum, w) => sum + (w.inventory_items || 0), 0),
    totalReceived: wholesalers.reduce((sum, w) => sum + (w.transfers_received || 0), 0),
    totalSent: wholesalers.reduce((sum, w) => sum + (w.transfers_sent || 0), 0)
  };

  const StatCard = ({ icon, title, value, subtitle, color, bgColor }) => (
    <Card className="stakeholder-stat-card">
      <Card.Body>
        <div className="stakeholder-stat-content">
          <div className="stakeholder-stat-icon" style={{ backgroundColor: bgColor, color }}>
            {icon}
          </div>
          <div className="stakeholder-stat-details">
            <p className="stakeholder-stat-label">{title}</p>
            <h3 className="stakeholder-stat-value">{value}</h3>
            {subtitle && <p className="stakeholder-stat-subtitle">{subtitle}</p>}
          </div>
        </div>
      </Card.Body>
    </Card>
  );

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="stakeholders-page">
      {/* Header */}
      <div className="stakeholder-header">
        <div>
          <h2 className="stakeholder-title">
            <FaStoreAlt className="me-2" />
            Wholesalers
          </h2>
          <p className="stakeholder-subtitle">
            Monitor all registered wholesalers
          </p>
        </div>
        <Button variant="primary" className="btn-export-stakeholder">
          <FaDownload className="me-2" />
          Export Report
        </Button>
      </div>

      {/* Stats Overview */}
      <Row className="g-3 mb-4">
        <Col lg={3} md={6}>
          <StatCard
            icon={<FaStoreAlt size={24} />}
            title="Total Wholesalers"
            value={stats.total}
            subtitle={`${stats.active} active`}
            color="#1e3a8a"
            bgColor="#dbeafe"
          />
        </Col>
        <Col lg={3} md={6}>
          <StatCard
            icon={<FaBoxes size={24} />}
            title="Total Inventory"
            value={stats.totalInventory}
            subtitle="Items in stock"
            color="#10b981"
            bgColor="#d1fae5"
          />
        </Col>
        <Col lg={3} md={6}>
          <StatCard
            icon={<FaExchangeAlt size={24} />}
            title="Transfers Received"
            value={stats.totalReceived}
            subtitle="Incoming transfers"
            color="#3b82f6"
            bgColor="#dbeafe"
          />
        </Col>
        <Col lg={3} md={6}>
          <StatCard
            icon={<FaExchangeAlt size={24} />}
            title="Transfers Sent"
            value={stats.totalSent}
            subtitle="Outgoing transfers"
            color="#8b5cf6"
            bgColor="#ede9fe"
          />
        </Col>
      </Row>

      {/* Filters */}
      <Card className="filter-card-stakeholder mb-4">
        <Card.Body>
          <Row className="align-items-center g-3">
            <Col lg={6} md={12}>
              <InputGroup>
                <InputGroup.Text>
                  <FaSearch />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Search by username or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col lg={3} md={6}>
              <Form.Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </Form.Select>
            </Col>
            <Col lg={3} md={6}>
              <div className="filter-results-stakeholder">
                <FaFilter className="me-2" />
                {filteredWholesalers.length} of {wholesalers.length}
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Wholesalers Table */}
      <Card className="table-card-stakeholder">
        <Card.Body>
          <div className="table-responsive">
            <Table hover className="stakeholder-table">
              <thead>
                <tr>
                  <th>Wholesaler</th>
                  <th>Email</th>
                  <th className="text-center">Inventory</th>
                  <th className="text-center">Received</th>
                  <th className="text-center">Sent</th>
                  <th className="text-center">Status</th>
                  <th className="text-center">Joined</th>
                </tr>
              </thead>
              <tbody>
                {filteredWholesalers.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-5">
                      <FaStoreAlt size={48} className="text-muted mb-3" />
                      <p className="text-muted">No wholesalers found</p>
                    </td>
                  </tr>
                ) : (
                  filteredWholesalers.map((wholesaler) => (
                    <tr key={wholesaler.id}>
                      <td>
                        <div className="stakeholder-info">
                          <div className="stakeholder-avatar">
                            <FaStoreAlt />
                          </div>
                          <div>
                            <strong className="stakeholder-name">
                              {wholesaler.username}
                            </strong>
                          </div>
                        </div>
                      </td>
                      <td>
                        <FaEnvelope className="me-2 text-muted" />
                        {wholesaler.email}
                      </td>
                      <td className="text-center">
                        <Badge bg="primary" className="metric-badge">
                          <FaBoxes className="me-1" />
                          {wholesaler.inventory_items || 0}
                        </Badge>
                      </td>
                      <td className="text-center">
                        <Badge bg="success" className="metric-badge">
                          {wholesaler.transfers_received || 0}
                        </Badge>
                      </td>
                      <td className="text-center">
                        <Badge bg="info" className="metric-badge">
                          {wholesaler.transfers_sent || 0}
                        </Badge>
                      </td>
                      <td className="text-center">
                        <Badge 
                          bg={wholesaler.is_active ? 'success' : 'danger'}
                          className="status-badge-stakeholder"
                        >
                          {wholesaler.is_active ? (
                            <>
                              <FaCheckCircle className="me-1" />
                              Active
                            </>
                          ) : (
                            'Inactive'
                          )}
                        </Badge>
                      </td>
                      <td className="text-center">
                        <FaCalendar className="me-2 text-muted" />
                        {new Date(wholesaler.date_joined).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default Wholesalers;