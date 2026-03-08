// src/pages/wholesaler/WholesalerReports.js - COMPLETE FIXED VERSION

import React, { useState, useEffect } from "react";
import { Card, Button, Alert, Row, Col, Form, Spinner } from "react-bootstrap";
import WholesalerLayout from "../../../components/wholesaler/WholesalerLayout";
import { 
  getWholesalerInventory, 
  getWholesalerIncoming,
  exportWholesalerInventoryCSV,
  exportWholesalerIncomingCSV,
  exportWholesalerOutgoingCSV,
  exportWholesalerExpiredCSV,
} from "../../../services/api";

export default function WholesalerReports() {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalBatches: 0,
    totalUnits: 0,
    nearExpiry: 0,
    expired: 0,
    pendingIncoming: 0,
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [exportingReport, setExportingReport] = useState(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [inventoryData, incomingData] = await Promise.all([
        getWholesalerInventory(),
        getWholesalerIncoming(),
      ]);

      const inventory = inventoryData.inventory || [];
      const totalUnits = inventory.reduce((sum, item) => sum + item.remaining_quantity, 0);
      const nearExpiry = inventory.filter(item => item.expiry_status === "NEAR_EXPIRY").length;
      const expired = inventory.filter(item => item.expiry_status === "EXPIRED").length;

      setStats({
        totalBatches: inventory.length,
        totalUnits,
        nearExpiry,
        expired,
        pendingIncoming: incomingData.incoming_batches?.length || 0,
      });
    } catch (err) {
      console.error("Failed to load stats:", err);
      setError("Failed to load wholesaler statistics");
    }
  };

  const handleExport = async (exportFunction, reportName) => {
    setExportingReport(reportName);
    setError(null);
    setSuccess(null);

    try {
      const result = await exportFunction();
      setSuccess(result.message || `${reportName} downloaded successfully!`);
    } catch (err) {
      console.error(`Export ${reportName} error:`, err);
      setError(err.detail || `Failed to export ${reportName}`);
    } finally {
      setExportingReport(null);
    }
  };

  const handleExportPDF = () => {
    setError("PDF export feature coming soon!");
  };

  return (
    <WholesalerLayout>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">📑 Reports</h2>
          <p className="text-muted mb-0">Generate and download wholesaler reports</p>
        </div>
      </div>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          <strong>Error:</strong> {error}
        </Alert>
      )}

      {success && (
        <Alert variant="success" dismissible onClose={() => setSuccess(null)}>
          <strong>Success:</strong> {success}
        </Alert>
      )}

      {/* Summary Dashboard */}
      <Card className="border-0 shadow-sm mb-4">
        <Card.Body>
          <h5 className="mb-3">📊 Wholesaler Statistics</h5>
          <Row>
            <Col md={4} className="mb-3">
              <div className="text-center p-3 bg-light rounded">
                <h3 className="mb-1 text-primary">{stats.totalBatches}</h3>
                <small className="text-muted">Total Batches</small>
              </div>
            </Col>
            <Col md={4} className="mb-3">
              <div className="text-center p-3 bg-light rounded">
                <h3 className="mb-1 text-success">{stats.totalUnits}</h3>
                <small className="text-muted">Total Units</small>
              </div>
            </Col>
            <Col md={4} className="mb-3">
              <div className="text-center p-3 bg-light rounded">
                <h3 className="mb-1 text-warning">{stats.pendingIncoming}</h3>
                <small className="text-muted">Pending Incoming</small>
              </div>
            </Col>
            <Col md={6} className="mb-3">
              <div className="text-center p-3 bg-light rounded">
                <h3 className="mb-1 text-warning">{stats.nearExpiry}</h3>
                <small className="text-muted">Near Expiry Batches</small>
              </div>
            </Col>
            <Col md={6} className="mb-3">
              <div className="text-center p-3 bg-light rounded">
                <h3 className="mb-1 text-danger">{stats.expired}</h3>
                <small className="text-muted">Expired Batches</small>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Report Cards */}
      <Row>
        {/* Inventory Report */}
        <Col md={6} className="mb-4">
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <div className="d-flex align-items-start mb-3">
                <div className="report-icon bg-primary-light">📦</div>
                <div>
                  <h5 className="mb-1">Current Inventory Report</h5>
                  <small className="text-muted">Complete list of all batches in wholesaler</small>
                </div>
              </div>
              <ul className="report-details">
                <li>Batch ID, Medicine Name</li>
                <li>Quantity & Expiry Status</li>
                <li>Manufacturer Details</li>
                <li>QR Code URLs</li>
              </ul>
              <div className="d-flex gap-2">
                <Button 
                  variant="primary" 
                  onClick={() => handleExport(exportWholesalerInventoryCSV, "Inventory Report")}
                  disabled={exportingReport !== null}
                  className="flex-grow-1"
                >
                  {exportingReport === "Inventory Report" ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      Exporting...
                    </>
                  ) : (
                    "📊 Export CSV"
                  )}
                </Button>
              
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Incoming Stock Report */}
        <Col md={6} className="mb-4">
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <div className="d-flex align-items-start mb-3">
                <div className="report-icon bg-success-light">📥</div>
                <div>
                  <h5 className="mb-1">Incoming Stock Report</h5>
                  <small className="text-muted">All received batches from warehouse</small>
                </div>
              </div>
              <ul className="report-details">
                <li>Transfer Date & Batch ID</li>
                <li>Warehouse Details</li>
                <li>Quantity Received</li>
                <li>Acceptance Status</li>
              </ul>
              <div className="d-flex gap-2">
                <Button 
                  variant="success"
                  onClick={() => handleExport(exportWholesalerIncomingCSV, "Incoming Stock Report")}
                  disabled={exportingReport !== null}
                  className="flex-grow-1"
                >
                  {exportingReport === "Incoming Stock Report" ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      Exporting...
                    </>
                  ) : (
                    "📊 Export CSV"
                  )}
                </Button>
                
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Outgoing Transfers Report */}
        <Col md={6} className="mb-4">
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <div className="d-flex align-items-start mb-3">
                <div className="report-icon bg-warning-light">📤</div>
                <div>
                  <h5 className="mb-1">Outgoing Transfers Report</h5>
                  <small className="text-muted">All batches transferred to shopkeeper</small>
                </div>
              </div>
              <ul className="report-details">
                <li>Transfer Date & Time</li>
                <li>Batch & shopkeeper Details</li>
                <li>Quantity Transferred</li>
                <li>Blockchain Transaction ID</li>
              </ul>
              <div className="d-flex gap-2">
                <Button 
                  variant="warning"
                  onClick={() => handleExport(exportWholesalerOutgoingCSV, "Outgoing Transfers Report")}
                  disabled={exportingReport !== null}
                  className="flex-grow-1"
                >
                  {exportingReport === "Outgoing Transfers Report" ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      Exporting...
                    </>
                  ) : (
                    "📊 Export CSV"
                  )}
                </Button>
              
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Expired Medicines Report */}
        <Col md={6} className="mb-4">
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <div className="d-flex align-items-start mb-3">
                <div className="report-icon bg-danger-light">⏳</div>
                <div>
                  <h5 className="mb-1">Expired Medicines Report</h5>
                  <small className="text-muted">List of expired and near-expiry batches</small>
                </div>
              </div>
              <ul className="report-details">
                <li>Batch ID & Medicine Name</li>
                <li>Expiry Date & Status</li>
                <li>Remaining Quantity</li>
                <li>Disposal Recommendations</li>
              </ul>
              <div className="d-flex gap-2">
                <Button 
                  variant="danger"
                  onClick={() => handleExport(exportWholesalerExpiredCSV, "Expired Medicines Report")}
                  disabled={exportingReport !== null}
                  className="flex-grow-1"
                >
                  {exportingReport === "Expired Medicines Report" ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      Exporting...
                    </>
                  ) : (
                    "📊 Export CSV"
                  )}
                </Button>
              
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* <style jsx>{
        .report-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          margin-right: 1rem;
          flex-shrink: 0;
        }
        
        .bg-primary-light {
          background-color: #e0e7ff;
        }
        
        .bg-success-light {
          background-color: #dcfce7;
        }
        
        .bg-warning-light {
          background-color: #fef3c7;
        }
        
        .bg-danger-light {
          background-color: #fee2e2;
        }
        
        .report-details {
          font-size: 0.9rem;
          margin-bottom: 1rem;
          padding-left: 1.2rem;
        }
        
        .report-details li {
          margin-bottom: 0.3rem;
        }
      }</style> */}
    </WholesalerLayout>
  );
}