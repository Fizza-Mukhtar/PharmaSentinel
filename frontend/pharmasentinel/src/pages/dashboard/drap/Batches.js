// src/pages/dashboard/drap/Batches.jsx
import React, { useState, useEffect } from 'react';
import './DrapResponsive.css';
import { Row, Col, Card, Table, Form, InputGroup, Badge, Button, ButtonGroup, Dropdown, Modal } from 'react-bootstrap';
import { 
  FaBoxes, FaSearch, FaFilter, FaCalendar, FaIndustry,
  FaEye, FaShieldAlt, FaExclamationTriangle, FaBan,
  FaCheckCircle, FaDownload, FaEllipsisV, FaQrcode,
  FaClock, FaWarehouse
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { getDrapBatches, validateBatchBlockchain, markBatchSuspicious, recallBatch, exportDrapBatchesCSV } from '../../../services/api';
import './Batches.css';

const Batches = () => {
  const [batches, setBatches] = useState([]);
  const [filteredBatches, setFilteredBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [manufacturerFilter, setManufacturerFilter] = useState('all');
  const [manufacturers, setManufacturers] = useState([]);
  const [showActionModal, setShowActionModal] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [actionType, setActionType] = useState('');
  const [actionReason, setActionReason] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    expired: 0,
    verified: 0
  });

  const navigate = useNavigate();

  useEffect(() => {
    fetchBatches();
  }, []);

  useEffect(() => {
    filterBatches();
  }, [searchTerm, statusFilter, manufacturerFilter, batches]);

  const fetchBatches = async () => {
    try {
      setLoading(true);
      const response = await getDrapBatches();
      
      if (response.success) {
        setBatches(response.batches);
        
        // Extract unique manufacturers
        const uniqueMfrs = [...new Set(response.batches.map(b => b.manufacturer?.username).filter(Boolean))];
        setManufacturers(uniqueMfrs);
        
        // Calculate stats
        const total = response.count;
        const active = response.batches.filter(b => b.status === 'ACTIVE').length;
        const expired = response.batches.filter(b => b.status === 'EXPIRED').length;
        const verified = response.batches.filter(b => b.has_blockchain).length;
        
        setStats({ total, active, expired, verified });
      }
    } catch (error) {
      console.error('Error fetching batches:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterBatches = () => {
    let filtered = [...batches];

    if (searchTerm) {
      filtered = filtered.filter(b => 
        b.batch_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(b => b.status === statusFilter);
    }

    if (manufacturerFilter !== 'all') {
      filtered = filtered.filter(b => b.manufacturer?.username === manufacturerFilter);
    }

    setFilteredBatches(filtered);
  };

  const handleValidateBlockchain = async (batchId) => {
    try {
      setLoading(true);
      const response = await validateBatchBlockchain(batchId);
      alert(response.is_valid ? '✅ Blockchain Valid' : '❌ Blockchain Invalid: ' + response.message);
      await fetchBatches();
    } catch (error) {
      console.error('Validation error:', error);
      alert('Failed to validate blockchain');
    } finally {
      setLoading(false);
    }
  };

  const openActionModal = (batch, type) => {
    setSelectedBatch(batch);
    setActionType(type);
    setActionReason('');
    setShowActionModal(true);
  };

  const handleAction = async () => {
    if (!selectedBatch || !actionReason.trim()) {
      alert('Please provide a reason');
      return;
    }

    try {
      setLoading(true);
      
      if (actionType === 'suspicious') {
        await markBatchSuspicious(selectedBatch.batch_id, actionReason);
        alert('✅ Batch marked as suspicious');
      } else if (actionType === 'recall') {
        await recallBatch(selectedBatch.batch_id, actionReason);
        alert('✅ Batch recalled successfully');
      }
      
      setShowActionModal(false);
      await fetchBatches();
    } catch (error) {
      console.error('Action error:', error);
      alert('Failed to perform action');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'ACTIVE': { bg: 'success', icon: <FaCheckCircle /> },
      'EXPIRED': { bg: 'danger', icon: <FaBan /> },
      'EXPIRING_SOON': { bg: 'warning', icon: <FaClock /> }
    };
    
    const config = statusConfig[status] || { bg: 'secondary', icon: <FaBoxes /> };
    
    return (
      <Badge bg={config.bg} className="status-badge-batch">
        {config.icon} {status}
      </Badge>
    );
  };

  const StatCard = ({ icon, title, value, color, bgColor }) => (
    <Card className="stat-card-batch">
      <Card.Body>
        <div className="stat-content-batch">
          <div className="stat-icon-batch" style={{ backgroundColor: bgColor, color }}>
            {icon}
          </div>
          <div className="stat-details-batch">
            <p className="stat-label-batch">{title}</p>
            <h3 className="stat-value-batch">{value}</h3>
          </div>
        </div>
      </Card.Body>
    </Card>
  );

  if (loading && batches.length === 0) {
    return (
      <div className="loading-container">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="batches-page">
      {/* Header */}
      <div className="page-header-batch">
        <div>
          <h2 className="page-title-batch">
            <FaBoxes className="me-2" />
            Batch Management
          </h2>
          <p className="page-subtitle-batch">
            Monitor and verify all medicine batches
          </p>
        </div>
        <Button 
          variant="primary" 
          onClick={() => exportDrapBatchesCSV()}
          className="btn-export-batch"
        >
          <FaDownload className="me-2" />
          Export Report
        </Button>
      </div>

      {/* Stats Overview */}
      <Row className="g-3 mb-4">
        <Col lg={3} md={6}>
          <StatCard
            icon={<FaBoxes size={24} />}
            title="Total Batches"
            value={stats.total}
            color="#1e3a8a"
            bgColor="#dbeafe"
          />
        </Col>
        <Col lg={3} md={6}>
          <StatCard
            icon={<FaCheckCircle size={24} />}
            title="Active Batches"
            value={stats.active}
            color="#10b981"
            bgColor="#d1fae5"
          />
        </Col>
        <Col lg={3} md={6}>
          <StatCard
            icon={<FaBan size={24} />}
            title="Expired"
            value={stats.expired}
            color="#ef4444"
            bgColor="#fee2e2"
          />
        </Col>
        <Col lg={3} md={6}>
          <StatCard
            icon={<FaShieldAlt size={24} />}
            title="Blockchain Verified"
            value={stats.verified}
            color="#8b5cf6"
            bgColor="#ede9fe"
          />
        </Col>
      </Row>

      {/* Filters */}
      <Card className="filter-card-batch mb-4">
        <Card.Body>
          <Row className="align-items-center g-3">
            <Col lg={4} md={12}>
              <InputGroup>
                <InputGroup.Text>
                  <FaSearch />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Search by Batch ID or Medicine Name..."
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
                <option value="ACTIVE">Active Only</option>
                <option value="EXPIRED">Expired Only</option>
                <option value="EXPIRING_SOON">Expiring Soon</option>
              </Form.Select>
            </Col>
            <Col lg={3} md={6}>
              <Form.Select
                value={manufacturerFilter}
                onChange={(e) => setManufacturerFilter(e.target.value)}
              >
                <option value="all">All Manufacturers</option>
                {manufacturers.map((mfr, index) => (
                  <option key={index} value={mfr}>{mfr}</option>
                ))}
              </Form.Select>
            </Col>
            <Col lg={2} md={12}>
              <div className="filter-results-batch">
                <FaFilter className="me-2" />
                {filteredBatches.length} of {batches.length}
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Batches Table */}
      <Card className="table-card-batch">
        <Card.Body>
          <div className="table-responsive">
            <Table hover className="batches-table">
              <thead>
                <tr>
                  <th>Batch ID</th>
                  <th>Medicine Name</th>
                  <th>Manufacturer</th>
                  <th className="text-center">Quantity</th>
                  <th className="text-center">Remaining</th>
                  <th className="text-center">Expiry Date</th>
                  <th className="text-center">Status</th>
                  <th className="text-center">Blockchain</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBatches.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="text-center py-5">
                      <FaBoxes size={48} className="text-muted mb-3" />
                      <p className="text-muted">No batches found</p>
                    </td>
                  </tr>
                ) : (
                  filteredBatches.map((batch) => (
                    <tr key={batch.batch_id}>
                      <td>
                        <div className="batch-id-cell">
                          <FaQrcode className="me-2 text-primary" />
                          <strong>{batch.batch_id}</strong>
                        </div>
                      </td>
                      <td>
                        <strong>{batch.name}</strong>
                      </td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <FaIndustry className="text-muted" />
                          {batch.manufacturer?.username || 'N/A'}
                        </div>
                      </td>
                      <td className="text-center">
                        <strong>{batch.quantity?.toLocaleString()}</strong>
                      </td>
                      <td className="text-center">
                        <Badge bg={batch.remaining_quantity > 50 ? 'success' : 'warning'}>
                          {batch.remaining_quantity?.toLocaleString()}
                        </Badge>
                      </td>
                      <td className="text-center">
                        <div className="expiry-cell">
                          <FaCalendar className="me-2 text-muted" />
                          {batch.expiry_date ? new Date(batch.expiry_date).toLocaleDateString() : 'N/A'}
                        </div>
                      </td>
                      <td className="text-center">
                        {getStatusBadge(batch.status)}
                      </td>
                      <td className="text-center">
                        {batch.has_blockchain ? (
                          <Badge bg="success" className="blockchain-badge">
                            <FaShieldAlt /> Verified
                          </Badge>
                        ) : (
                          <Badge bg="danger" className="blockchain-badge">
                            <FaExclamationTriangle /> Missing
                          </Badge>
                        )}
                      </td>
                      <td className="text-center">
                        <Dropdown align="end">
                          <Dropdown.Toggle 
                            variant="link" 
                            className="btn-action-batch"
                            id={`dropdown-${batch.batch_id}`}
                          >
                            <FaEllipsisV />
                          </Dropdown.Toggle>

                          <Dropdown.Menu>
                            <Dropdown.Item
                              onClick={() => navigate(`/dashboard/drap/batches/${batch.batch_id}`)}
                            >
                              <FaEye className="me-2" />
                              View Details
                            </Dropdown.Item>
                            <Dropdown.Item
                              onClick={() => handleValidateBlockchain(batch.batch_id)}
                            >
                              <FaShieldAlt className="me-2" />
                              Validate Blockchain
                            </Dropdown.Item>
                            <Dropdown.Divider />
                            <Dropdown.Item
                              onClick={() => openActionModal(batch, 'suspicious')}
                              className="text-warning"
                            >
                              <FaExclamationTriangle className="me-2" />
                              Mark Suspicious
                            </Dropdown.Item>
                            <Dropdown.Item
                              onClick={() => openActionModal(batch, 'recall')}
                              className="text-danger"
                            >
                              <FaBan className="me-2" />
                              Recall Batch
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

      {/* Action Modal */}
      <Modal show={showActionModal} onHide={() => setShowActionModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {actionType === 'suspicious' ? 'Mark Batch as Suspicious' : 'Recall Batch'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            <strong>Batch ID:</strong> {selectedBatch?.batch_id}
          </p>
          <p>
            <strong>Medicine:</strong> {selectedBatch?.name}
          </p>
          <Form.Group className="mt-3">
            <Form.Label>Reason *</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Enter reason for this action..."
              value={actionReason}
              onChange={(e) => setActionReason(e.target.value)}
            />
          </Form.Group>
          <div className="alert alert-warning mt-3">
            <FaExclamationTriangle className="me-2" />
            This action will be recorded in blockchain and audit logs.
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowActionModal(false)}>
            Cancel
          </Button>
          <Button
            variant={actionType === 'recall' ? 'danger' : 'warning'}
            onClick={handleAction}
            disabled={loading || !actionReason.trim()}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" />
                Processing...
              </>
            ) : (
              actionType === 'recall' ? 'Recall Batch' : 'Mark Suspicious'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Batches;