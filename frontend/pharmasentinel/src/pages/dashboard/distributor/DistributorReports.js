// src/pages/distributor/DistributorReports.js
import React, { useState, useEffect } from "react";
import { Card, Button, Alert, Row, Col, Spinner } from "react-bootstrap";
import DistributorLayout from "../../../components/distributor/Distributorlayout";
import { 
  getDistributorInventory, 
  getDistributorTransferHistory,
  exportDistributorInventoryCSV,
  exportDistributorOutgoingCSV,
  exportDistributorExpiredCSV,
} from "../../../services/api";

export default function DistributorReports() {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalBatches: 0,
    totalUnits: 0,
    nearExpiry: 0,
    expired: 0,
    pendingOutgoing: 0,
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [exportingReport, setExportingReport] = useState(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [inventoryData, outgoingData] = await Promise.all([
        getDistributorInventory(),
        getDistributorTransferHistory(),
      ]);

      const inventory = inventoryData.inventory || [];
      const totalUnits = inventory.reduce((sum, item) => sum + (item.remaining_quantity || 0), 0);
      const nearExpiry = inventory.filter(item => item.expiry_status === "NEAR_EXPIRY").length;
      const expired = inventory.filter(item => item.expiry_status === "EXPIRED").length;

      setStats({
        totalBatches: inventory.length,
        totalUnits,
        nearExpiry,
        expired,
        pendingOutgoing: outgoingData.transfers?.length || 0,
      });
    } catch (err) {
      console.error("Failed to load distributor stats:", err);
      setError("Failed to load distributor statistics");
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

  return (
    <DistributorLayout>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1 fw-bold">Reports</h2>
          <p className="text-muted mb-0">Generate and download distributor reports</p>
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
          <h5 className="mb-3 fw-bold">Distributor Statistics</h5>
          <Row className="g-3">
            <Col md={4}>
              <div className="text-center p-3 bg-light rounded">
                <h3 className="mb-1 text-primary fw-bold">{stats.totalBatches}</h3>
                <small className="text-muted text-uppercase" style={{ fontSize: '0.75rem' }}>Total Batches</small>
              </div>
            </Col>
            <Col md={4}>
              <div className="text-center p-3 bg-light rounded">
                <h3 className="mb-1 text-success fw-bold">{stats.totalUnits}</h3>
                <small className="text-muted text-uppercase" style={{ fontSize: '0.75rem' }}>Total Units</small>
              </div>
            </Col>
            <Col md={4}>
              <div className="text-center p-3 bg-light rounded">
                <h3 className="mb-1 text-warning fw-bold">{stats.pendingOutgoing}</h3>
                <small className="text-muted text-uppercase" style={{ fontSize: '0.75rem' }}>Pending Outgoing Transfers</small>
              </div>
            </Col>
            <Col md={6}>
              <div className="text-center p-3 bg-light rounded">
                <h3 className="mb-1 text-warning fw-bold">{stats.nearExpiry}</h3>
                <small className="text-muted text-uppercase" style={{ fontSize: '0.75rem' }}>Near Expiry Batches</small>
              </div>
            </Col>
            <Col md={6}>
              <div className="text-center p-3 bg-light rounded">
                <h3 className="mb-1 text-danger fw-bold">{stats.expired}</h3>
                <small className="text-muted text-uppercase" style={{ fontSize: '0.75rem' }}>Expired Batches</small>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Report Cards */}
      <Row className="g-4">
        {/* Inventory Report */}
        <Col md={6}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <div className="d-flex align-items-start mb-3">
                <div className="report-icon bg-primary-light">
                  <div style={{ width: "24px", height: "24px", backgroundColor: "#6366f1", borderRadius: "4px" }}></div>
                </div>
                <div>
                  <h5 className="mb-1 fw-bold">Current Inventory Report</h5>
                  <small className="text-muted">Complete list of all batches in distributor inventory</small>
                </div>
              </div>
              <ul className="report-details">
                <li>Batch ID, Medicine Name</li>
                <li>Quantity & Expiry Status</li>
                <li>Manufacturer Details</li>
                <li>QR Code URLs</li>
              </ul>
              <Button 
                variant="primary" 
                onClick={() => handleExport(exportDistributorInventoryCSV, "Inventory Report")}
                disabled={exportingReport !== null}
                className="w-100"
              >
                {exportingReport === "Inventory Report" ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Exporting...
                  </>
                ) : (
                  "Export CSV"
                )}
              </Button>
            </Card.Body>
          </Card>
        </Col>

        {/* Outgoing Transfers Report */}
        <Col md={6}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <div className="d-flex align-items-start mb-3">
                <div className="report-icon bg-warning-light">
                  <div style={{ width: "24px", height: "24px", backgroundColor: "#f59e0b", borderRadius: "4px" }}></div>
                </div>
                <div>
                  <h5 className="mb-1 fw-bold">Outgoing Transfers Report</h5>
                  <small className="text-muted">All batches transferred to warehouses</small>
                </div>
              </div>
              <ul className="report-details">
                <li>Transfer Date & Time</li>
                <li>Batch & Warehouse Details</li>
                <li>Quantity Transferred</li>
                <li>Blockchain Transaction ID</li>
              </ul>
              <Button 
                variant="warning"
                onClick={() => handleExport(exportDistributorOutgoingCSV, "Outgoing Transfers Report")}
                disabled={exportingReport !== null}
                className="w-100"
              >
                {exportingReport === "Outgoing Transfers Report" ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Exporting...
                  </>
                ) : (
                  "Export CSV"
                )}
              </Button>
            </Card.Body>
          </Card>
        </Col>

        {/* Expired Medicines Report */}
        <Col md={6}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <div className="d-flex align-items-start mb-3">
                <div className="report-icon bg-danger-light">
                  <div style={{ width: "24px", height: "24px", backgroundColor: "#ef4444", borderRadius: "4px" }}></div>
                </div>
                <div>
                  <h5 className="mb-1 fw-bold">Expired Medicines Report</h5>
                  <small className="text-muted">List of expired and near-expiry batches</small>
                </div>
              </div>
              <ul className="report-details">
                <li>Batch ID & Medicine Name</li>
                <li>Expiry Date & Status</li>
                <li>Remaining Quantity</li>
                <li>Disposal Recommendations</li>
              </ul>
              <Button 
                variant="danger"
                onClick={() => handleExport(exportDistributorExpiredCSV, "Expired Medicines Report")}
                disabled={exportingReport !== null}
                className="w-100"
              >
                {exportingReport === "Expired Medicines Report" ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Exporting...
                  </>
                ) : (
                  "Export CSV"
                )}
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <style jsx>{`
        .report-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 1rem;
          flex-shrink: 0;
        }
        
        .bg-primary-light {
          background-color: #e0e7ff;
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
      `}</style>
    </DistributorLayout>
  );
}