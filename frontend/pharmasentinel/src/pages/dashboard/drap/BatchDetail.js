// src/pages/dashboard/drap/BatchDetail.jsx
import React, { useState, useEffect } from 'react';
import './DrapResponsive.css';
import { useParams, useNavigate } from 'react-router-dom';
import { Row, Col, Card, Badge, Button, Table, Timeline } from 'react-bootstrap';
import { 
  FaArrowLeft, FaBoxes, FaIndustry, FaCalendar, FaQrcode,
  FaShieldAlt, FaNetworkWired, FaCheckCircle, FaExclamationTriangle,
  FaWarehouse, FaClock, FaDownload, FaBan
} from 'react-icons/fa';
import { getDrapBatchDetail, validateBatchBlockchain, trackBatchJourney } from '../../../services/api';
import './BatchDetail.css';

const BatchDetail = () => {
  const { batchId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [batchData, setBatchData] = useState(null);
  const [blockchainValid, setBlockchainValid] = useState(null);

  useEffect(() => {
    if (batchId) {
      fetchBatchDetail();
    }
  }, [batchId]);

  const fetchBatchDetail = async () => {
    try {
      setLoading(true);
      const response = await getDrapBatchDetail(batchId);
      
      if (response.success) {
        setBatchData(response);
        setBlockchainValid(response.blockchain?.is_valid);
      }
    } catch (error) {
      console.error('Error fetching batch detail:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleValidateBlockchain = async () => {
    try {
      const response = await validateBatchBlockchain(batchId);
      setBlockchainValid(response.is_valid);
      alert(response.is_valid ? '✅ Blockchain Valid' : '❌ ' + response.message);
    } catch (error) {
      console.error('Validation error:', error);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner-border text-primary" />
      </div>
    );
  }

  if (!batchData) {
    return (
      <div className="text-center py-5">
        <FaBoxes size={64} className="text-muted mb-3" />
        <h4>Batch not found</h4>
        <Button variant="primary" onClick={() => navigate('/dashboard/drap/batches')}>
          Back to Batches
        </Button>
      </div>
    );
  }

  const { batch, blockchain, transfers } = batchData;

  return (
    <div className="batch-detail-page">
      {/* Header */}
      <div className="detail-header">
        <Button 
          variant="outline-secondary" 
          onClick={() => navigate('/dashboard/drap/batches')}
          className="btn-back"
        >
          <FaArrowLeft className="me-2" />
          Back to Batches
        </Button>
        <div className="header-actions">
          <Button variant="outline-primary" onClick={handleValidateBlockchain}>
            <FaShieldAlt className="me-2" />
            Validate Blockchain
          </Button>
          <Button variant="primary">
            <FaDownload className="me-2" />
            Download Report
          </Button>
        </div>
      </div>

      {/* Batch Info Card */}
      <Card className="batch-info-card mb-4">
        <Card.Body>
          <Row>
            <Col lg={8}>
              <div className="batch-title-section">
                <FaBoxes className="batch-icon" />
                <div>
                  <h2 className="batch-title">{batch.name}</h2>
                  <p className="batch-id">
                    <FaQrcode className="me-2" />
                    Batch ID: <strong>{batch.batch_id}</strong>
                  </p>
                </div>
              </div>

              <Row className="mt-4 g-3">
                <Col md={6}>
                  <div className="info-item">
                    <FaIndustry className="info-icon" />
                    <div>
                      <small>Manufacturer</small>
                      <p><strong>{batch.manufacturer?.username || 'N/A'}</strong></p>
                    </div>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="info-item">
                    <FaWarehouse className="info-icon" />
                    <div>
                      <small>Current Holder</small>
                      <p>
                        <strong>{batch.current_holder?.username || 'N/A'}</strong>
                        <Badge bg="info" className="ms-2">{batch.current_holder?.role}</Badge>
                      </p>
                    </div>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="info-item">
                    <FaCalendar className="info-icon" />
                    <div>
                      <small>Manufacture Date</small>
                      <p><strong>{batch.manufacture_date ? new Date(batch.manufacture_date).toLocaleDateString() : 'N/A'}</strong></p>
                    </div>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="info-item">
                    <FaCalendar className="info-icon text-danger" />
                    <div>
                      <small>Expiry Date</small>
                      <p><strong>{batch.expiry_date ? new Date(batch.expiry_date).toLocaleDateString() : 'N/A'}</strong></p>
                    </div>
                  </div>
                </Col>
              </Row>
            </Col>

            <Col lg={4}>
              <div className="qr-section">
                {batch.qr_code_url ? (
                  <img src={batch.qr_code_url} alt="QR Code" className="qr-image" />
                ) : (
                  <div className="qr-placeholder">
                    <FaQrcode size={48} />
                    <p>No QR Code</p>
                  </div>
                )}
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Stats Row */}
      <Row className="g-3 mb-4">
        <Col md={3}>
          <Card className="stat-card-detail">
            <Card.Body>
              <div className="stat-detail-content">
                <FaBoxes className="stat-detail-icon text-primary" />
                <div>
                  <small>Total Quantity</small>
                  <h3>{batch.quantity?.toLocaleString()}</h3>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="stat-card-detail">
            <Card.Body>
              <div className="stat-detail-content">
                <FaCheckCircle className="stat-detail-icon text-success" />
                <div>
                  <small>Remaining</small>
                  <h3>{batch.remaining_quantity?.toLocaleString()}</h3>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="stat-card-detail">
            <Card.Body>
              <div className="stat-detail-content">
                <FaNetworkWired className="stat-detail-icon text-info" />
                <div>
                  <small>Total Transfers</small>
                  <h3>{transfers?.count || 0}</h3>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="stat-card-detail">
            <Card.Body>
              <div className="stat-detail-content">
                <FaShieldAlt className={`stat-detail-icon ${blockchainValid ? 'text-success' : 'text-danger'}`} />
                <div>
                  <small>Blockchain</small>
                  <h3>
                    {blockchainValid ? (
                      <Badge bg="success">Valid</Badge>
                    ) : (
                      <Badge bg="danger">Invalid</Badge>
                    )}
                  </h3>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Blockchain Trail */}
      <Row className="g-3">
        <Col lg={6}>
          <Card className="blockchain-card">
            <Card.Header>
              <h5>
                <FaShieldAlt className="me-2" />
                Blockchain Trail
              </h5>
              <Badge bg={blockchain?.is_valid ? 'success' : 'danger'}>
                {blockchain?.message}
              </Badge>
            </Card.Header>
            <Card.Body>
              <div className="blockchain-list">
                {blockchain?.trail?.map((block, index) => (
                  <div key={index} className="blockchain-block">
                    <div className="block-header">
                      <strong>Block #{block.index}</strong>
                      <Badge bg="primary">{block.transaction_data?.action || 'GENESIS'}</Badge>
                    </div>
                    <div className="block-info">
                      <small>Hash: {block.hash?.substring(0, 16)}...</small>
                      <small>By: {block.created_by || 'System'}</small>
                      <small>{new Date(block.timestamp).toLocaleString()}</small>
                    </div>
                  </div>
                ))}
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={6}>
          <Card className="transfer-card">
            <Card.Header>
              <h5>
                <FaNetworkWired className="me-2" />
                Transfer History
              </h5>
            </Card.Header>
            <Card.Body>
              <div className="transfer-timeline">
                {transfers?.history?.map((transfer, index) => (
                  <div key={index} className="timeline-item">
                    <div className="timeline-marker">
                      <FaCheckCircle />
                    </div>
                    <div className="timeline-content">
                      <div className="transfer-header">
                        <strong>{transfer.from_user}</strong>
                        <span className="mx-2">→</span>
                        <strong>{transfer.to_user}</strong>
                      </div>
                      <div className="transfer-meta">
                        <Badge bg="secondary">{transfer.from_role}</Badge>
                        <span className="mx-2">→</span>
                        <Badge bg="secondary">{transfer.to_role}</Badge>
                      </div>
                      <div className="transfer-details">
                        <span>Quantity: {transfer.quantity}</span>
                        <span>•</span>
                        <span>{new Date(transfer.timestamp).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default BatchDetail;