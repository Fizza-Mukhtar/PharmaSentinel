import React, { useState, useEffect } from 'react';
import './DrapResponsive.css';
import { Row, Col, Card, Table, Badge, InputGroup, Form, Button } from 'react-bootstrap';
import { 
  FaStore, FaSearch, FaFilter, FaShoppingBag, FaCheckCircle,
  FaDollarSign, FaCalendar, FaEnvelope, FaDownload
} from 'react-icons/fa';
import { getDrapShopkeepers } from '../../../services/api';
import './Stakeholders.css';

const Shopkeepers = () => {
  const [shopkeepers, setShopkeepers] = useState([]);
  const [filteredShopkeepers, setFilteredShopkeepers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchShopkeepers();
  }, []);

  useEffect(() => {
    filterShopkeepers();
  }, [searchTerm, statusFilter, shopkeepers]);

  const fetchShopkeepers = async () => {
    try {
      setLoading(true);
      const response = await getDrapShopkeepers();
      
      if (response.success) {
        setShopkeepers(response.shopkeepers);
      }
    } catch (error) {
      console.error('Error fetching shopkeepers:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterShopkeepers = () => {
    let filtered = [...shopkeepers];

    if (searchTerm) {
      filtered = filtered.filter(s => 
        s.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(s => 
        statusFilter === 'active' ? s.is_active : !s.is_active
      );
    }

    setFilteredShopkeepers(filtered);
  };

  const stats = {
    total: shopkeepers.length,
    active: shopkeepers.filter(s => s.is_active).length,
    totalProducts: shopkeepers.reduce((sum, s) => sum + (s.products_count || 0), 0),
    totalSales: shopkeepers.reduce((sum, s) => sum + (s.total_sales || 0), 0),
    totalOrders: shopkeepers.reduce((sum, s) => sum + (s.orders_count || 0), 0)
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
            <FaStore className="me-2" />
            Shopkeepers
          </h2>
          <p className="stakeholder-subtitle">
            Monitor all registered shopkeeper accounts
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
            icon={<FaStore size={24} />}
            title="Total Shopkeepers"
            value={stats.total}
            subtitle={`${stats.active} active`}
            color="#1e3a8a"
            bgColor="#dbeafe"
          />
        </Col>
        <Col lg={3} md={6}>
          <StatCard
            icon={<FaShoppingBag size={24} />}
            title="Total Products"
            value={stats.totalProducts}
            subtitle="Products listed"
            color="#10b981"
            bgColor="#d1fae5"
          />
        </Col>
        <Col lg={3} md={6}>
          <StatCard
            icon={<FaDollarSign size={24} />}
            title="Total Sales"
            value={`$${stats.totalSales.toLocaleString()}`}
            subtitle="Revenue generated"
            color="#3b82f6"
            bgColor="#dbeafe"
          />
        </Col>
        <Col lg={3} md={6}>
          <StatCard
            icon={<FaShoppingBag size={24} />}
            title="Total Orders"
            value={stats.totalOrders}
            subtitle="Orders processed"
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
                {filteredShopkeepers.length} of {shopkeepers.length}
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Shopkeepers Table */}
      <Card className="table-card-stakeholder">
        <Card.Body>
          <div className="table-responsive">
            <Table hover className="stakeholder-table">
              <thead>
                <tr>
                  <th>Shopkeeper</th>
                  <th>Email</th>
                  <th className="text-center">Products</th>
                  <th className="text-center">Sales</th>
                  <th className="text-center">Orders</th>
                  <th className="text-center">Status</th>
                  <th className="text-center">Joined</th>
                </tr>
              </thead>
              <tbody>
                {filteredShopkeepers.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-5">
                      <FaStore size={48} className="text-muted mb-3" />
                      <p className="text-muted">No shopkeepers found</p>
                    </td>
                  </tr>
                ) : (
                  filteredShopkeepers.map((shopkeeper) => (
                    <tr key={shopkeeper.id}>
                      <td>
                        <div className="stakeholder-info">
                          <div className="stakeholder-avatar">
                            <FaStore />
                          </div>
                          <div>
                            <strong className="stakeholder-name">
                              {shopkeeper.username}
                            </strong>
                          </div>
                        </div>
                      </td>
                      <td>
                        <FaEnvelope className="me-2 text-muted" />
                        {shopkeeper.email}
                      </td>
                      <td className="text-center">
                        <Badge bg="primary" className="metric-badge">
                          <FaShoppingBag className="me-1" />
                          {shopkeeper.products_count || 0}
                        </Badge>
                      </td>
                      <td className="text-center">
                        <Badge bg="success" className="metric-badge">
                          <FaDollarSign className="me-1" />
                          {shopkeeper.total_sales || 0}
                        </Badge>
                      </td>
                      <td className="text-center">
                        <Badge bg="info" className="metric-badge">
                          {shopkeeper.orders_count || 0}
                        </Badge>
                      </td>
                      <td className="text-center">
                        <Badge 
                          bg={shopkeeper.is_active ? 'success' : 'danger'}
                          className="status-badge-stakeholder"
                        >
                          {shopkeeper.is_active ? (
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
                        {new Date(shopkeeper.date_joined).toLocaleDateString()}
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

export default Shopkeepers;