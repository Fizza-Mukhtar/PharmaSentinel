// src/pages/dashboard/drap/Reports.jsx - NEW PAGE
import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Badge, Table, Button, Form, ButtonGroup } from 'react-bootstrap';
import { FaBan, FaEye, FaFilter, FaSync, FaExclamationTriangle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { getDrapReports } from '../../../services/api';
import './Reports.css';

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [stats, setStats] = useState({});
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchReports();
  }, [statusFilter]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const params = statusFilter !== 'all' ? { status: statusFilter.toUpperCase() } : {};
      const response = await getDrapReports(params);
      
      if (response.success) {
        setReports(response.reports);
        setStats(response.status_counts);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      'PENDING': 'warning',
      'INVESTIGATING': 'info',
      'VERIFIED': 'danger',
      'RESOLVED': 'success',
      'DISMISSED': 'secondary'
    };
    return <Badge bg={variants[status] || 'secondary'}>{status}</Badge>;
  };

  const StatCard = ({ title, value, variant, onClick, active }) => (
    <Card 
      className={`stat-card ${active ? 'active' : ''}`}
      onClick={onClick}
      style={{ cursor: 'pointer' }}
    >
      <Card.Body>
        <div className="stat-content">
          <h3 className={`text-${variant}`}>{value}</h3>
          <p className="text-muted mb-0">{title}</p>
        </div>
      </Card.Body>
    </Card>
  );

  return (
    <div className="reports-page">
      {/* Header */}
      <div className="reports-header">
        <div>
          <h2>
            <FaBan className="me-2 text-danger" />
            Suspicious Medicine Reports
          </h2>
          <p className="text-muted">Customer-reported counterfeit alerts</p>
        </div>
        <Button 
          variant="outline-primary" 
          onClick={fetchReports}
          disabled={loading}
        >
          <FaSync className={loading ? 'fa-spin' : ''} />
          <span className="ms-2">Refresh</span>
        </Button>
      </div>

      {/* Stats Cards */}
      <Row className="g-3 mb-4">
        <Col md={6} lg>
          <StatCard 
            title="All Reports"
            value={reports.length}
            variant="primary"
            onClick={() => setStatusFilter('all')}
            active={statusFilter === 'all'}
          />
        </Col>
        <Col md={6} lg>
          <StatCard 
            title="Pending"
            value={stats.pending || 0}
            variant="warning"
            onClick={() => setStatusFilter('pending')}
            active={statusFilter === 'pending'}
          />
        </Col>
        <Col md={6} lg>
          <StatCard 
            title="Investigating"
            value={stats.investigating || 0}
            variant="info"
            onClick={() => setStatusFilter('investigating')}
            active={statusFilter === 'investigating'}
          />
        </Col>
        <Col md={6} lg>
          <StatCard 
            title="Verified"
            value={stats.verified || 0}
            variant="danger"
            onClick={() => setStatusFilter('verified')}
            active={statusFilter === 'verified'}
          />
        </Col>
        <Col md={6} lg>
          <StatCard 
            title="Resolved"
            value={stats.resolved || 0}
            variant="success"
            onClick={() => setStatusFilter('resolved')}
            active={statusFilter === 'resolved'}
          />
        </Col>
      </Row>

      {/* Reports Table */}
      <Card>
        <Card.Header>
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">
              <FaFilter className="me-2" />
              {statusFilter === 'all' ? 'All Reports' : `${statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)} Reports`}
            </h5>
            <div className="d-flex align-items-center gap-2">
              <span className="text-muted small">Filter:</span>
              <ButtonGroup size="sm">
                <Button 
                  variant={statusFilter === 'all' ? 'primary' : 'outline-secondary'}
                  onClick={() => setStatusFilter('all')}
                >
                  All
                </Button>
                <Button 
                  variant={statusFilter === 'pending' ? 'warning' : 'outline-secondary'}
                  onClick={() => setStatusFilter('pending')}
                >
                  Pending
                </Button>
                <Button 
                  variant={statusFilter === 'investigating' ? 'info' : 'outline-secondary'}
                  onClick={() => setStatusFilter('investigating')}
                >
                  Investigating
                </Button>
                <Button 
                  variant={statusFilter === 'verified' ? 'danger' : 'outline-secondary'}
                  onClick={() => setStatusFilter('verified')}
                >
                  Verified
                </Button>
              </ButtonGroup>
            </div>
          </div>
        </Card.Header>
        <Card.Body className="p-0">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" />
              <p className="mt-3 text-muted">Loading reports...</p>
            </div>
          ) : reports.length === 0 ? (
            <div className="text-center py-5">
              <FaBan size={48} className="text-muted mb-3" />
              <p className="text-muted">No reports found</p>
            </div>
          ) : (
            <Table responsive hover className="mb-0">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Batch ID</th>
                  <th>Reporter</th>
                  <th>Reason</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>Reported</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {reports.map(report => (
                  <tr key={report.id}>
                    <td>
                      <strong>#{report.id}</strong>
                    </td>
                    <td>
                      <code className="batch-id-code">
                        {report.batch_id}
                      </code>
                      {!report.batch_exists && (
                        <Badge bg="danger" className="ms-2" title="Batch not found - likely counterfeit">
                          ⚠️ Not Found
                        </Badge>
                      )}
                    </td>
                    <td>
                      <div>
                        <strong>{report.reporter_name}</strong>
                        <br />
                        <small className="text-muted">{report.reporter_phone}</small>
                      </div>
                    </td>
                    <td>
                      <span className="report-reason">
                        {report.reason.length > 50 
                          ? `${report.reason.substring(0, 50)}...` 
                          : report.reason}
                      </span>
                    </td>
                    <td>
                      <small className="text-muted">
                        {report.location || 'Not provided'}
                      </small>
                    </td>
                    <td>{getStatusBadge(report.status)}</td>
                    <td>
                      <small className="text-muted">
                        {new Date(report.created_at).toLocaleDateString()}
                        <br />
                        {new Date(report.created_at).toLocaleTimeString()}
                      </small>
                    </td>
                    <td>
                      <Button 
                        variant="outline-primary" 
                        size="sm"
                        onClick={() => navigate(`/dashboard/drap/reports/${report.id}`)}
                      >
                        <FaEye className="me-1" />
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* Alert for critical reports */}
      {stats.pending > 0 && (
        <div className="mt-3">
          <div className="alert alert-warning d-flex align-items-center">
            <FaExclamationTriangle className="me-2" size={24} />
            <div>
              <strong>Action Required:</strong> You have {stats.pending} pending report{stats.pending !== 1 ? 's' : ''} that need review.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;