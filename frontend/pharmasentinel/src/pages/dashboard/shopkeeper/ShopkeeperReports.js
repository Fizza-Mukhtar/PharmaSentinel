// src/pages/shopkeeper/ShopkeeperReports.js
import React, { useState, useEffect } from "react";
import { Row, Col, Card, Button, Spinner } from "react-bootstrap";
import ShopkeeperLayout from "../../../components/shopkeeper/ShopkeeperLayout";
import {
  getShopkeeperReport,
  exportShopkeeperInventoryCSV,
  exportShopkeeperSalesCSV,
  exportShopkeeperIncomingCSV,
  exportShopkeeperExpiredCSV,
} from "../../../services/api";

export default function ShopkeeperReports() {
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState(null);
  const [exportingReport, setExportingReport] = useState(null);

  useEffect(() => {
    loadReport();
  }, []);

  const loadReport = async () => {
    setLoading(true);
    try {
      const response = await getShopkeeperReport();
      setReport(response.report);
    } catch (error) {
      console.error("Failed to load report:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (exportFn, reportName) => {
    setExportingReport(reportName);
    try {
      const blob = await exportFn();
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${reportName.replace(/ /g, "_")}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Export failed:", error);
      alert("Failed to export report");
    } finally {
      setExportingReport(null);
    }
  };

  if (loading) {
    return (
      <ShopkeeperLayout>
        <div className="text-center py-5">
          <Spinner animation="border" variant="success" />
          <p className="mt-3 text-muted">Loading reports...</p>
        </div>
      </ShopkeeperLayout>
    );
  }

  if (!report) {
    return (
      <ShopkeeperLayout>
        <div className="text-center py-5">
          <h5 className="text-muted">Failed to load report data</h5>
          <Button variant="success" onClick={loadReport} className="mt-3">
            Try Again
          </Button>
        </div>
      </ShopkeeperLayout>
    );
  }

  return (
    <ShopkeeperLayout>
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" />

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">
            <i className="bi bi-file-earmark-text me-2" style={{ color: "#10b981" }}></i>
            Reports & Export
          </h2>
          <p className="text-muted mb-0">Generate and download comprehensive reports</p>
        </div>
        <Button variant="outline-secondary" onClick={loadReport}>
          <i className="bi bi-arrow-clockwise me-2"></i>
          Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      <Row className="mb-4">
        <Col md={6}>
          <Card className="border-0 shadow-sm h-100" style={{ borderLeft: "4px solid #10b981" }}>
            <Card.Body>
              <h5 className="mb-3 fw-semibold" style={{ color: "#10b981" }}>
                <i className="bi bi-box-seam me-2"></i>
                Inventory Summary
              </h5>
              <Row>
                <Col xs={6} className="mb-3">
                  <div className="text-center p-3" style={{ backgroundColor: "#f0fdf4", borderRadius: "8px" }}>
                    <h4 className="mb-0 fw-bold" style={{ color: "#10b981" }}>
                      {report.inventory.total_batches}
                    </h4>
                    <small className="text-muted">Total Batches</small>
                  </div>
                </Col>
                <Col xs={6} className="mb-3">
                  <div className="text-center p-3" style={{ backgroundColor: "#dbeafe", borderRadius: "8px" }}>
                    <h4 className="mb-0 fw-bold" style={{ color: "#3b82f6" }}>
                      {report.inventory.total_quantity}
                    </h4>
                    <small className="text-muted">Total Stock</small>
                  </div>
                </Col>
                <Col xs={4}>
                  <div className="text-center p-2" style={{ backgroundColor: "#fef3c7", borderRadius: "8px" }}>
                    <h5 className="mb-0 fw-bold" style={{ color: "#f59e0b" }}>
                      {report.inventory.low_stock}
                    </h5>
                    <small className="text-muted" style={{ fontSize: "0.7rem" }}>Low Stock</small>
                  </div>
                </Col>
                <Col xs={4}>
                  <div className="text-center p-2" style={{ backgroundColor: "#ffedd5", borderRadius: "8px" }}>
                    <h5 className="mb-0 fw-bold" style={{ color: "#f97316" }}>
                      {report.inventory.expiring_soon}
                    </h5>
                    <small className="text-muted" style={{ fontSize: "0.7rem" }}>Expiring</small>
                  </div>
                </Col>
                <Col xs={4}>
                  <div className="text-center p-2" style={{ backgroundColor: "#fee2e2", borderRadius: "8px" }}>
                    <h5 className="mb-0 fw-bold" style={{ color: "#ef4444" }}>
                      {report.inventory.expired}
                    </h5>
                    <small className="text-muted" style={{ fontSize: "0.7rem" }}>Expired</small>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card className="border-0 shadow-sm h-100" style={{ borderLeft: "4px solid #8b5cf6" }}>
            <Card.Body>
              <h5 className="mb-3 fw-semibold" style={{ color: "#8b5cf6" }}>
                <i className="bi bi-graph-up me-2"></i>
                Sales Summary
              </h5>
              <Row>
                <Col xs={6} className="mb-3">
                  <div className="text-center p-3" style={{ backgroundColor: "#f5f3ff", borderRadius: "8px" }}>
                    <h4 className="mb-0 fw-bold" style={{ color: "#8b5cf6" }}>
                      {report.sales.all_time.count}
                    </h4>
                    <small className="text-muted">Total Sales</small>
                  </div>
                </Col>
                <Col xs={6} className="mb-3">
                  <div className="text-center p-3" style={{ backgroundColor: "#fce7f3", borderRadius: "8px" }}>
                    <h4 className="mb-0 fw-bold" style={{ color: "#ec4899" }}>
                      {report.sales.all_time.quantity}
                    </h4>
                    <small className="text-muted">Units Sold</small>
                  </div>
                </Col>
                <Col xs={4}>
                  <div className="text-center p-2" style={{ backgroundColor: "#dcfce7", borderRadius: "8px" }}>
                    <h5 className="mb-0 fw-bold" style={{ color: "#10b981" }}>
                      {report.sales.today.count}
                    </h5>
                    <small className="text-muted" style={{ fontSize: "0.7rem" }}>Today</small>
                  </div>
                </Col>
                <Col xs={4}>
                  <div className="text-center p-2" style={{ backgroundColor: "#dbeafe", borderRadius: "8px" }}>
                    <h5 className="mb-0 fw-bold" style={{ color: "#3b82f6" }}>
                      {report.sales.this_week.count}
                    </h5>
                    <small className="text-muted" style={{ fontSize: "0.7rem" }}>This Week</small>
                  </div>
                </Col>
                <Col xs={4}>
                  <div className="text-center p-2" style={{ backgroundColor: "#e0e7ff", borderRadius: "8px" }}>
                    <h5 className="mb-0 fw-bold" style={{ color: "#6366f1" }}>
                      {report.sales.this_month.count}
                    </h5>
                    <small className="text-muted" style={{ fontSize: "0.7rem" }}>This Month</small>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Top Medicines */}
      {report.top_medicines && report.top_medicines.length > 0 && (
        <Card className="border-0 shadow-sm mb-4">
          <Card.Body>
            <h5 className="mb-3 fw-semibold" style={{ color: "#10b981" }}>
              <i className="bi bi-trophy me-2"></i>
              Top Selling Medicines
            </h5>
            <Row>
              {report.top_medicines.map((med, idx) => (
                <Col md={4} key={idx} className="mb-3">
                  <Card style={{ backgroundColor: "#f9fafb", border: "1px solid #e5e7eb" }}>
                    <Card.Body>
                      <div className="d-flex align-items-center gap-3">
                        <div
                          style={{
                            width: "50px",
                            height: "50px",
                            borderRadius: "50%",
                            backgroundColor: "#10b981",
                            color: "white",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "1.5rem",
                            fontWeight: "bold",
                          }}
                        >
                          #{idx + 1}
                        </div>
                        <div className="flex-grow-1">
                          <div className="fw-bold">{med.batch__name}</div>
                          <small className="text-muted">{med.batch__batch_id}</small>
                          <div className="mt-1">
                            <span className="badge" style={{ backgroundColor: "#10b981", color: "white" }}>
                              {med.total_sold} units sold
                            </span>
                          </div>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </Card.Body>
        </Card>
      )}

      {/* Export Options */}
      <Card className="border-0 shadow-sm">
        <Card.Body>
          <h5 className="mb-3 fw-semibold" style={{ color: "#10b981" }}>
            <i className="bi bi-download me-2"></i>
            Export Reports
          </h5>
          <p className="text-muted mb-4">Download detailed CSV reports for analysis</p>

          <Row>
            {[
              {
                title: "Full Inventory Report",
                description: "Complete inventory with medicines, quantities, and expiry dates",
                icon: "bi-box-seam",
                color: "#10b981",
                exportFn: exportShopkeeperInventoryCSV,
                reportName: "Shopkeeper Inventory",
              },
              {
                title: "Sales History Report",
                description: "All sales transactions with customer details and timestamps",
                icon: "bi-cart-check",
                color: "#8b5cf6",
                exportFn: exportShopkeeperSalesCSV,
                reportName: "Shopkeeper Sales",
              },
              {
                title: "Incoming Transfers Report",
                description: "All incoming stock transfers from wholesalers",
                icon: "bi-inbox",
                color: "#3b82f6",
                exportFn: exportShopkeeperIncomingCSV,
                reportName: "Shopkeeper Incoming",
              },
              {
                title: "Expired Medicines Report",
                description: "List of all expired medicines in inventory",
                icon: "bi-x-circle",
                color: "#ef4444",
                exportFn: exportShopkeeperExpiredCSV,
                reportName: "Shopkeeper Expired",
              },
            ].map((item, idx) => (
              <Col md={6} key={idx} className="mb-3">
                <Card
                  style={{
                    border: `2px solid ${item.color}20`,
                    transition: "all 0.2s",
                  }}
                >
                  <Card.Body>
                    <div className="d-flex align-items-start gap-3">
                      <div
                        style={{
                          width: "60px",
                          height: "60px",
                          borderRadius: "12px",
                          backgroundColor: `${item.color}15`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "2rem",
                          flexShrink: 0,
                          color: item.color,
                        }}
                      >
                        <i className={`bi ${item.icon}`}></i>
                      </div>
                      <div className="flex-grow-1">
                        <h6 className="fw-bold mb-1" style={{ color: item.color }}>
                          {item.title}
                        </h6>
                        <p className="text-muted small mb-3">{item.description}</p>
                        <Button
                          variant="outline-success"
                          size="sm"
                          onClick={() => handleExport(item.exportFn, item.reportName)}
                          disabled={exportingReport !== null}
                          style={{ borderColor: item.color, color: item.color }}
                        >
                          {exportingReport === item.reportName ? (
                            <>
                              <Spinner animation="border" size="sm" className="me-2" />
                              Exporting...
                            </>
                          ) : (
                            <>
                              <i className="bi bi-download me-2"></i>
                              Download CSV
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Card.Body>
      </Card>
    </ShopkeeperLayout>
  );
}