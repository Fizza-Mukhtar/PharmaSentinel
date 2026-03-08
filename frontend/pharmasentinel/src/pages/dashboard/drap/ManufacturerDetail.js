
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './DrapResponsive.css';
import { Row, Col, Card, Table, Badge, Button } from 'react-bootstrap';
import { 
  FaArrowLeft, FaIndustry, FaEnvelope, FaCalendar, FaBoxes,
  FaCheckCircle, FaBan, FaExchangeAlt, FaChartLine, FaDownload
} from 'react-icons/fa';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line
} from 'recharts';
import { getDrapManufacturerDetail, blockManufacturer } from '../../../services/api';
import './ManufacturerDetail.css';

const ManufacturerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [manufacturerData, setManufacturerData] = useState(null);

  useEffect(() => {
    if (id) {
      fetchManufacturerDetail();
    }
  }, [id]);

  const fetchManufacturerDetail = async () => {
    try {
      setLoading(true);
      const response = await getDrapManufacturerDetail(id);
      
      if (response.success) {
        setManufacturerData(response);
      }
    } catch (error) {
      console.error('Error fetching manufacturer detail:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBlockManufacturer = async () => {
    if (!window.confirm('Are you sure you want to block/unblock this manufacturer?')) return;
    
    try {
      setLoading(true);
      const response = await blockManufacturer(id);
      
      if (response.success) {
        await fetchManufacturerDetail();
        alert(`Manufacturer ${response.is_active ? 'unblocked' : 'blocked'} successfully`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to update manufacturer status');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!manufacturerData) {
    return (
      <div className="text-center py-5">
        <FaIndustry size={64} className="text-muted mb-3" />
        <h4>Manufacturer not found</h4>
        <Button 
          variant="primary" 
          onClick={() => navigate('/dashboard/drap/manufacturers')}
        >
          Back to Manufacturers
        </Button>
      </div>
    );
  }

  const { manufacturer, statistics, batches } = manufacturerData;

  // Sample chart data
  const batchTrendData = [
    { month: 'Jan', batches: 12 },
    { month: 'Feb', batches: 15 },
    { month: 'Mar', batches: 18 },
    { month: 'Apr', batches: 20 },
    { month: 'May', batches: 22 },
    { month: 'Jun', batches: 25 }
  ];

  return (
    <div className="manufacturer-detail-page">
      {/* Header */}
      <div className="detail-header-mfr">
        <Button 
          variant="outline-secondary" 
          onClick={() => navigate('/dashboard/drap/manufacturers')}
          className="btn-back-mfr"
        >
          <FaArrowLeft className="me-2" />
          Back to Manufacturers
        </Button>
        <div className="header-actions-mfr">
          <Button 
            variant={manufacturer.is_active ? 'danger' : 'success'}
            onClick={handleBlockManufacturer}
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
          </Button>
          <Button variant="primary">
            <FaDownload className="me-2" />
            Download Report
          </Button>
        </div>
      </div>

      {/* Manufacturer Info Card */}
      <Card className="manufacturer-info-card mb-4">
        <Card.Body>
          <Row>
            <Col lg={8}>
              <div className="manufacturer-title-section">
                <div className="manufacturer-icon-large">
                  <FaIndustry />
                </div>
                <div>
                  <h2 className="manufacturer-detail-title">{manufacturer.username}</h2>
                  <div className="manufacturer-meta">
                    <Badge 
                      bg={manufacturer.is_active ? 'success' : 'danger'}
                      className="status-badge-large"
                    >
                      {manufacturer.is_active ? 'Active' : 'Blocked'}
                    </Badge>
                    <span className="meta-divider">•</span>
                    <span className="meta-text">
                      <FaCalendar className="me-2" />
                      Joined {new Date(manufacturer.date_joined).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              <Row className="mt-4 g-3">
                <Col md={6}>
                  <div className="info-item-mfr">
                    <FaEnvelope className="info-icon-mfr" />
                    <div>
                      <small>Email Address</small>
                      <p><strong>{manufacturer.email}</strong></p>
                    </div>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="info-item-mfr">
                    <FaCheckCircle className="info-icon-mfr text-success" />
                    <div>
                      <small>Account Status</small>
                      <p>
                        <strong>{manufacturer.is_active ? 'Active & Verified' : 'Blocked'}</strong>
                      </p>
                    </div>
                  </div>
                </Col>
              </Row>
            </Col>

            <Col lg={4}>
              <div className="quick-stats-section">
                <h6 className="quick-stats-title">Quick Statistics</h6>
                <div className="quick-stat-item">
                  <div className="quick-stat-value">{statistics.total_batches}</div>
                  <div className="quick-stat-label">Total Batches</div>
                </div>
                <div className="quick-stat-item">
                  <div className="quick-stat-value">{statistics.total_quantity?.toLocaleString()}</div>
                  <div className="quick-stat-label">Units Produced</div>
                </div>
                <div className="quick-stat-item">
                  <div className="quick-stat-value">{statistics.total_transfers}</div>
                  <div className="quick-stat-label">Total Transfers</div>
                </div>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Stats Cards */}
      <Row className="g-3 mb-4">
        <Col md={3}>
          <Card className="stat-card-mfr-detail">
            <Card.Body>
              <div className="stat-content-mfr-detail">
                <FaBoxes className="stat-icon-mfr-detail text-primary" size={32} />
                <div>
                  <small>Total Batches</small>
                  <h3>{statistics.total_batches}</h3>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="stat-card-mfr-detail">
            <Card.Body>
              <div className="stat-content-mfr-detail">
                <FaCheckCircle className="stat-icon-mfr-detail text-success" size={32} />
                <div>
                  <small>Units Produced</small>
                  <h3>{statistics.total_quantity?.toLocaleString()}</h3>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="stat-card-mfr-detail">
            <Card.Body>
              <div className="stat-content-mfr-detail">
                <FaExchangeAlt className="stat-icon-mfr-detail text-info" size={32} />
                <div>
                  <small>Total Transfers</small>
                  <h3>{statistics.total_transfers}</h3>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="stat-card-mfr-detail">
            <Card.Body>
              <div className="stat-content-mfr-detail">
                <FaCheckCircle className="stat-icon-mfr-detail text-success" size={32} />
                <div>
                  <small>Confirmed</small>
                  <h3>{statistics.confirmed_transfers}</h3>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Charts */}
      <Row className="g-3 mb-4">
        <Col lg={12}>
          <Card className="chart-card-mfr-detail">
            <Card.Header>
              <h5>
                <FaChartLine className="me-2" />
                Batch Production Trend
              </h5>
            </Card.Header>
            <Card.Body>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={batchTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="batches" 
                    stroke="#1e3a8a" 
                    strokeWidth={3}
                    name="Batches Created"
                    dot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Batches Table */}
      <Card className="batches-list-card-mfr">
        <Card.Header>
          <h5>
            <FaBoxes className="me-2" />
            All Batches
          </h5>
        </Card.Header>
        <Card.Body>
          <div className="table-responsive">
            <Table hover>
              <thead>
                <tr>
                  <th>Batch ID</th>
                  <th>Medicine Name</th>
                  <th className="text-center">Quantity</th>
                  <th className="text-center">Remaining</th>
                  <th className="text-center">Expiry Date</th>
                  <th className="text-center">Created</th>
                </tr>
              </thead>
              <tbody>
                {batches && batches.length > 0 ? (
                  batches.map((batch, index) => (
                    <tr key={index}>
                      <td>
                        <strong style={{ fontFamily: 'Courier New' }}>
                          {batch.batch_id}
                        </strong>
                      </td>
                      <td>{batch.name}</td>
                      <td className="text-center">
                        <strong>{batch.quantity?.toLocaleString()}</strong>
                      </td>
                      <td className="text-center">
                        <Badge bg="success">{batch.remaining_quantity}</Badge>
                      </td>
                      <td className="text-center">
                        {batch.expiry_date 
                          ? new Date(batch.expiry_date).toLocaleDateString() 
                          : 'N/A'}
                      </td>
                      <td className="text-center">
                        {new Date(batch.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center py-4 text-muted">
                      No batches found
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default ManufacturerDetail;