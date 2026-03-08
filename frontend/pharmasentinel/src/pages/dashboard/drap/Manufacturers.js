// src/pages/dashboard/drap/Manufacturers.jsx
import React, { useState, useEffect } from 'react';
import './DrapResponsive.css';
import { Row, Col, Card, Table, Form, InputGroup, Modal, Button, Badge, Dropdown } from 'react-bootstrap';
import { 
  FaSearch, FaFilter, FaIndustry, FaCheckCircle, FaBan, 
  FaEye, FaBoxes, FaChartLine, FaDownload, FaEllipsisV,
  FaUserCheck, FaUserTimes, FaCalendar, FaEnvelope
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { getDrapManufacturers, blockManufacturer, exportDrapBatchesCSV } from '../../../services/api';
import './Manufacturers.css';

const Manufacturers = () => {
  const [manufacturers, setManufacturers] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [selectedManufacturer, setSelectedManufacturer] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    blocked: 0,
    totalBatches: 0
  });

  const navigate = useNavigate();

  useEffect(() => {
    fetchManufacturers();
  }, []);

  useEffect(() => {
    filterManufacturers();
  }, [searchTerm, statusFilter, manufacturers]);

  const fetchManufacturers = async () => {
    try {
      setLoading(true);
      const response = await getDrapManufacturers();
      
      if (response.success) {
        setManufacturers(response.manufacturers);
        
        // Calculate stats
        const total = response.count;
        const active = response.manufacturers.filter(m => m.is_active).length;
        const blocked = total - active;
        const totalBatches = response.manufacturers.reduce((sum, m) => sum + m.total_batches, 0);
        
        setStats({ total, active, blocked, totalBatches });
      }
    } catch (error) {
      console.error('Error fetching manufacturers:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterManufacturers = () => {
    let filtered = [...manufacturers];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(m => 
        m.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(m => 
        statusFilter === 'active' ? m.is_active : !m.is_active
      );
    }

    setFilteredData(filtered);
  };

  const handleBlockManufacturer = async () => {
    if (!selectedManufacturer) return;

    try {
      setLoading(true);
      const response = await blockManufacturer(selectedManufacturer.id);
      
      if (response.success) {
        await fetchManufacturers();
        setShowBlockModal(false);
        setSelectedManufacturer(null);
      }
    } catch (error) {
      console.error('Error blocking manufacturer:', error);
      alert(error.detail || 'Failed to update manufacturer status');
    } finally {
      setLoading(false);
    }
  };

  const openBlockModal = (manufacturer) => {
    setSelectedManufacturer(manufacturer);
    setShowBlockModal(true);
  };

  const handleExportCSV = async () => {
    try {
      await exportDrapBatchesCSV();
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export CSV');
    }
  };

  const StatCard = ({ icon, title, value, color, bgColor, trend }) => (
    <Card className="stat-card-mfr">
      <Card.Body>
        <div className="stat-content-mfr">
          <div className="stat-icon-mfr" style={{ backgroundColor: bgColor, color }}>
            {icon}
          </div>
          <div className="stat-details-mfr">
            <p className="stat-label-mfr">{title}</p>
            <h3 className="stat-value-mfr">{value}</h3>
            {trend && (
              <span className={`stat-trend-mfr ${trend > 0 ? 'positive' : 'negative'}`}>
                {trend > 0 ? '+' : ''}{trend}%
              </span>
            )}
          </div>
        </div>
      </Card.Body>
    </Card>
  );

  if (loading && manufacturers.length === 0) {
    return (
      <div className="loading-container">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="manufacturers-page">
      {/* Header */}
      <div className="page-header-mfr">
        <div>
          <h2 className="page-title-mfr">
            <FaIndustry className="me-2" />
            Manufacturers Management
          </h2>
          <p className="page-subtitle-mfr">
            Monitor and manage all registered manufacturers
          </p>
        </div>
        <Button 
          variant="primary" 
          onClick={handleExportCSV}
          className="btn-export-mfr"
        >
          <FaDownload className="me-2" />
          Export Report
        </Button>
      </div>

      {/* Stats Overview */}
      <Row className="g-3 mb-4">
        <Col lg={3} md={6}>
          <StatCard
            icon={<FaIndustry size={24} />}
            title="Total Manufacturers"
            value={stats.total}
            color="#1e3a8a"
            bgColor="#dbeafe"
            trend={5.2}
          />
        </Col>
        <Col lg={3} md={6}>
          <StatCard
            icon={<FaUserCheck size={24} />}
            title="Active"
            value={stats.active}
            color="#10b981"
            bgColor="#d1fae5"
            trend={3.1}
          />
        </Col>
        <Col lg={3} md={6}>
          <StatCard
            icon={<FaUserTimes size={24} />}
            title="Blocked"
            value={stats.blocked}
            color="#ef4444"
            bgColor="#fee2e2"
            trend={-1.5}
          />
        </Col>
        <Col lg={3} md={6}>
          <StatCard
            icon={<FaBoxes size={24} />}
            title="Total Batches"
            value={stats.totalBatches}
            color="#8b5cf6"
            bgColor="#ede9fe"
            trend={8.7}
          />
        </Col>
      </Row>

      {/* Filters & Search */}
      <Card className="filter-card-mfr mb-4">
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
                <option value="blocked">Blocked Only</option>
              </Form.Select>
            </Col>
            <Col lg={3} md={6}>
              <div className="filter-results">
                <FaFilter className="me-2" />
                Showing {filteredData.length} of {manufacturers.length}
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Manufacturers Table */}
      <Card className="table-card-mfr">
        <Card.Body>
          <div className="table-responsive">
            <Table hover className="manufacturers-table">
              <thead>
                <tr>
                  <th>Manufacturer</th>
                  <th>Email</th>
                  <th className="text-center">Batches</th>
                  <th className="text-center">Total Produced</th>
                  <th className="text-center">Status</th>
                  <th className="text-center">Joined</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-5">
                      <FaIndustry size={48} className="text-muted mb-3" />
                      <p className="text-muted">No manufacturers found</p>
                    </td>
                  </tr>
                ) : (
                  filteredData.map((manufacturer) => (
                    <tr key={manufacturer.id}>
                      <td>
                        <div className="manufacturer-info">
                          <div className="manufacturer-avatar">
                            {manufacturer.username.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <strong className="manufacturer-name">
                              {manufacturer.username}
                            </strong>
                          </div>
                        </div>
                      </td>
                      <td>
                        <FaEnvelope className="me-2 text-muted" />
                        {manufacturer.email}
                      </td>
                      <td className="text-center">
                        <Badge bg="primary" className="batch-badge">
                          {manufacturer.total_batches}
                        </Badge>
                      </td>
                      <td className="text-center">
                        <strong>{manufacturer.total_quantity_produced.toLocaleString()}</strong>
                        <small className="text-muted d-block">units</small>
                      </td>
                      <td className="text-center">
                        <Badge 
                          bg={manufacturer.is_active ? 'success' : 'danger'}
                          className="status-badge"
                        >
                          {manufacturer.is_active ? (
                            <>
                              <FaCheckCircle className="me-1" />
                              Active
                            </>
                          ) : (
                            <>
                              <FaBan className="me-1" />
                              Blocked
                            </>
                          )}
                        </Badge>
                      </td>
                      <td className="text-center">
                        <FaCalendar className="me-2 text-muted" />
                        {new Date(manufacturer.date_joined).toLocaleDateString()}
                      </td>
                      <td className="text-center">
                        <Dropdown align="end">
                          <Dropdown.Toggle 
                            variant="link" 
                            className="btn-action-mfr"
                            id={`dropdown-${manufacturer.id}`}
                          >
                            <FaEllipsisV />
                          </Dropdown.Toggle>

                          <Dropdown.Menu>
                            <Dropdown.Item
                              onClick={() => navigate(`/dashboard/drap/manufacturers/${manufacturer.id}`)}
                            >
                              <FaEye className="me-2" />
                              View Details
                            </Dropdown.Item>
                            <Dropdown.Item
                              onClick={() => navigate(`/dashboard/drap/analytics?manufacturer=${manufacturer.id}`)}
                            >
                              <FaChartLine className="me-2" />
                              View Analytics
                            </Dropdown.Item>
                            <Dropdown.Divider />
                            <Dropdown.Item
                              onClick={() => openBlockModal(manufacturer)}
                              className={manufacturer.is_active ? 'text-danger' : 'text-success'}
                            >
                              {manufacturer.is_active ? (
                                <>
                                  <FaBan className="me-2" />
                                  Block Manufacturer
                                </>
                              ) : (
                                <>
                                  <FaCheckCircle className="me-2" />
                                  Unblock Manufacturer
                                </>
                              )}
                            </Dropdown.Item>
                          </Dropdown.Menu>
                        </Dropdown>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {/* Block/Unblock Confirmation Modal */}
      <Modal show={showBlockModal} onHide={() => setShowBlockModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {selectedManufacturer?.is_active ? 'Block' : 'Unblock'} Manufacturer
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Are you sure you want to {selectedManufacturer?.is_active ? 'block' : 'unblock'}{' '}
            <strong>{selectedManufacturer?.username}</strong>?
          </p>
          {selectedManufacturer?.is_active && (
            <div className="alert alert-warning">
              <strong>Warning:</strong> Blocking this manufacturer will prevent them from creating new batches and performing transfers.
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowBlockModal(false)}>
            Cancel
          </Button>
          <Button
            variant={selectedManufacturer?.is_active ? 'danger' : 'success'}
            onClick={handleBlockManufacturer}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" />
                Processing...
              </>
            ) : (
              <>
                {selectedManufacturer?.is_active ? 'Block' : 'Unblock'} Manufacturer
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Manufacturers;