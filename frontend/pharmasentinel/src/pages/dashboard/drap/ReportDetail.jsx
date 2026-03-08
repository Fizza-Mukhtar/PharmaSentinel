// src/pages/dashboard/drap/ReportDetail.jsx - COMPLETE FIXED VERSION
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Card, Badge, Button, Form, Alert, Spinner, Row, Col,
  Modal
} from 'react-bootstrap';
import { 
  FaArrowLeft, FaCheckCircle, FaExclamationTriangle, 
  FaSave, FaBan, FaInfoCircle 
} from 'react-icons/fa';
import { getDrapReportDetail, updateReportStatus } from '../../../services/api';
import './ReportDetail.css';

const ReportDetail = () => {
  const { reportId } = useParams();
  const navigate = useNavigate();
  
  const [report, setReport] = useState(null);
  const [batch, setBatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Form states
  const [selectedStatus, setSelectedStatus] = useState('');
  const [reviewNotes, setReviewNotes] = useState('');
  const [hasChanges, setHasChanges] = useState(false);
  
  // Confirmation modal
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    fetchReportDetail();
  }, [reportId]);

  const fetchReportDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await getDrapReportDetail(reportId);
      
      if (response.success) {
        setReport(response.report);
        setBatch(response.batch);
        
        // Initialize form with current values
        setSelectedStatus(response.report.status);
        setReviewNotes(response.report.review_notes || '');
        setHasChanges(false);
      } else {
        setError(response.detail || 'Failed to load report');
      }
    } catch (error) {
      console.error('Error fetching report:', error);
      setError(error.detail || 'Failed to load report details');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (newStatus) => {
    setSelectedStatus(newStatus);
    setHasChanges(newStatus !== report.status || reviewNotes !== (report.review_notes || ''));
  };

  const handleNotesChange = (e) => {
    const newNotes = e.target.value;
    setReviewNotes(newNotes);
    setHasChanges(selectedStatus !== report.status || newNotes !== (report.review_notes || ''));
  };

  const handleSaveChanges = () => {
    if (!hasChanges) {
      setError('No changes to save');
      return;
    }
    setShowConfirmModal(true);
  };

  const confirmSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      setShowConfirmModal(false);
      
      console.log('🔄 Saving report status:', {
        reportId,
        status: selectedStatus,
        notes: reviewNotes
      });

      const response = await updateReportStatus(reportId, {
        status: selectedStatus,
        review_notes: reviewNotes
      });

      if (response.success) {
        setSuccess('✅ Report status updated successfully!');
        setHasChanges(false);
        
        // Refresh report data
        await fetchReportDetail();
        
        // Auto-hide success message after 3 seconds
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(response.detail || 'Failed to update status');
      }
    } catch (error) {
      console.error('❌ Save error:', error);
      setError(error.detail || 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const handleDiscard = () => {
    setSelectedStatus(report.status);
    setReviewNotes(report.review_notes || '');
    setHasChanges(false);
    setError(null);
    setSuccess(null);
  };

  const getStatusBadge = (status) => {
    const variants = {
      'PENDING': 'warning',
      'INVESTIGATING': 'info',
      'VERIFIED': 'danger',
      'RESOLVED': 'success',
      'DISMISSED': 'secondary'
    };
    
    const icons = {
      'PENDING': '⏳',
      'INVESTIGATING': '🔍',
      'VERIFIED': '⚠️',
      'RESOLVED': '✅',
      'DISMISSED': '❌'
    };

    return (
      <Badge bg={variants[status] || 'secondary'} className="status-badge-large">
        {icons[status]} {status}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="loading-container">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading report details...</p>
      </div>
    );
  }

  if (!report) {
    return (
      <Alert variant="danger">
        <FaExclamationTriangle className="me-2" />
        Report not found
      </Alert>
    );
  }

  return (
    <div className="report-detail-page">
      {/* Header */}
      <div className="page-header mb-4">
        <Button 
          variant="outline-secondary" 
          onClick={() => navigate('/dashboard/drap/reports')}
          className="me-3"
        >
          <FaArrowLeft className="me-2" />
          Back to Reports
        </Button>
        <div className="flex-grow-1">
          <h2>Report #{report.id}</h2>
          <p className="text-muted mb-0">
            Submitted: {new Date(report.created_at).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Success/Error Alerts */}
      {success && (
        <Alert variant="success" dismissible onClose={() => setSuccess(null)}>
          <FaCheckCircle className="me-2" />
          {success}
        </Alert>
      )}

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          <FaExclamationTriangle className="me-2" />
          {error}
        </Alert>
      )}

      {/* Unsaved Changes Warning */}
      {hasChanges && (
        <Alert variant="warning">
          <FaInfoCircle className="me-2" />
          You have unsaved changes. Click "Save Changes" to update the report.
        </Alert>
      )}

      <Row className="g-3">
        {/* Left Column - Report Info */}
        <Col lg={8}>
          {/* Reporter Information */}
          <Card className="mb-3">
            <Card.Header>
              <h5 className="mb-0">Reporter Information</h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <strong>Name:</strong>
                  <p>{report.reporter_name}</p>
                </Col>
                <Col md={6}>
                  <strong>Phone:</strong>
                  <p>{report.reporter_phone}</p>
                </Col>
                <Col md={6}>
                  <strong>Email:</strong>
                  <p>{report.reporter_email || 'Not provided'}</p>
                </Col>
                <Col md={6}>
                  <strong>Location:</strong>
                  <p>{report.location || 'Not provided'}</p>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Report Details */}
          <Card className="mb-3">
            <Card.Header>
              <h5 className="mb-0">Report Details</h5>
            </Card.Header>
            <Card.Body>
              <div className="mb-3">
                <strong>Batch ID:</strong>
                <div>
                  <code className="batch-id-code">{report.batch_id}</code>
                  {batch && !batch.exists && (
                    <Badge bg="danger" className="ms-2">
                      ⚠️ Batch Not Found - Likely Counterfeit
                    </Badge>
                  )}
                </div>
              </div>

              <div className="mb-3">
                <strong>Reason for Report:</strong>
                <p className="report-reason">{report.reason}</p>
              </div>

              {report.additional_details && (
                <div className="mb-3">
                  <strong>Additional Details:</strong>
                  <p>{report.additional_details}</p>
                </div>
              )}
            </Card.Body>
          </Card>

          {/* Batch Information */}
          {batch && (
            <Card>
              <Card.Header>
                <h5 className="mb-0">Batch Information</h5>
              </Card.Header>
              <Card.Body>
                {batch.exists ? (
                  <Row>
                    <Col md={6}>
                      <strong>Medicine Name:</strong>
                      <p>{batch.name}</p>
                    </Col>
                    <Col md={6}>
                      <strong>Manufacturer:</strong>
                      <p>{batch.manufacturer || 'N/A'}</p>
                    </Col>
                    <Col md={6}>
                      <strong>Current Holder:</strong>
                      <p>{batch.current_holder || 'N/A'}</p>
                    </Col>
                    <Col md={6}>
                      <strong>Expiry Date:</strong>
                      <p>{batch.expiry_date ? new Date(batch.expiry_date).toLocaleDateString() : 'N/A'}</p>
                    </Col>
                    <Col md={6}>
                      <strong>Remaining Quantity:</strong>
                      <p>{batch.remaining_quantity} units</p>
                    </Col>
                    <Col md={6}>
                      <strong>Batch Status:</strong>
                      <p>
                        <Badge bg={batch.batch_status === 'ACTIVE' ? 'success' : 'danger'}>
                          {batch.batch_status}
                        </Badge>
                      </p>
                    </Col>
                  </Row>
                ) : (
                  <Alert variant="danger">
                    <FaBan className="me-2" />
                    <strong>Batch Not Found in System</strong>
                    <p className="mb-0 mt-2">
                      This batch ID does not exist in our system. This is a strong indicator 
                      that the medicine is <strong>counterfeit</strong>.
                    </p>
                  </Alert>
                )}
              </Card.Body>
            </Card>
          )}
        </Col>

        {/* Right Column - Status Management */}
        <Col lg={4}>
          {/* Current Status */}
          <Card className="mb-3">
            <Card.Header>
              <h5 className="mb-0">Current Status</h5>
            </Card.Header>
            <Card.Body className="text-center">
              {getStatusBadge(report.status)}
              <p className="text-muted mt-2 mb-0">
                Last updated: {new Date(report.created_at).toLocaleDateString()}
              </p>
            </Card.Body>
          </Card>

          {/* Update Status Form */}
          <Card className="mb-3">
            <Card.Header>
              <h5 className="mb-0">Update Status</h5>
            </Card.Header>
            <Card.Body>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>New Status</Form.Label>
                  <Form.Select 
                    value={selectedStatus}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    disabled={saving}
                  >
                    <option value="PENDING">⏳ Pending</option>
                    <option value="INVESTIGATING">🔍 Investigating</option>
                    <option value="VERIFIED">⚠️ Verified (Counterfeit)</option>
                    <option value="RESOLVED">✅ Resolved</option>
                    <option value="DISMISSED">❌ Dismissed</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Review Notes</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    value={reviewNotes}
                    onChange={handleNotesChange}
                    placeholder="Add investigation notes, actions taken, or resolution details..."
                    disabled={saving}
                  />
                </Form.Group>

                {/* Action Buttons */}
                <div className="d-grid gap-2">
                  <Button 
                    variant="primary" 
                    onClick={handleSaveChanges}
                    disabled={!hasChanges || saving}
                  >
                    {saving ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-2" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <FaSave className="me-2" />
                        Save Changes
                      </>
                    )}
                  </Button>

                  {hasChanges && (
                    <Button 
                      variant="outline-secondary" 
                      onClick={handleDiscard}
                      disabled={saving}
                    >
                      Discard Changes
                    </Button>
                  )}
                </div>
              </Form>
            </Card.Body>
          </Card>

          {/* Previous Review Info */}
          {report.reviewed_by && (
            <Card>
              <Card.Header>
                <h5 className="mb-0">Review History</h5>
              </Card.Header>
              <Card.Body>
                <p className="mb-2">
                  <strong>Reviewed By:</strong><br />
                  {report.reviewed_by}
                </p>
                {report.review_notes && (
                  <div>
                    <strong>Previous Notes:</strong>
                    <p className="text-muted mt-1">{report.review_notes}</p>
                  </div>
                )}
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>

      {/* Confirmation Modal */}
      <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Status Update</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to update this report?</p>
          <div className="bg-light p-3 rounded">
            <strong>New Status:</strong> {getStatusBadge(selectedStatus)}
            {reviewNotes && (
              <div className="mt-2">
                <strong>Notes:</strong>
                <p className="mb-0 mt-1">{reviewNotes}</p>
              </div>
            )}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={confirmSave}>
            <FaSave className="me-2" />
            Confirm Save
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ReportDetail;