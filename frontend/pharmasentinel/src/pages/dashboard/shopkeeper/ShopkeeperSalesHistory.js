// src/pages/shopkeeper/ShopkeeperSalesHistory.js
import React, { useState, useEffect } from "react";
import { Row, Col, Card, Form, Button, Spinner, Badge, Table } from "react-bootstrap";
import ShopkeeperLayout from "../../../components/shopkeeper/ShopkeeperLayout";
import { getShopkeeperSalesHistory, exportShopkeeperSalesCSV } from "../../../services/api";

export default function ShopkeeperSalesHistory() {
  const [loading, setLoading] = useState(true);
  const [sales, setSales] = useState([]);
  const [exporting, setExporting] = useState(false);
  
  const [searchName, setSearchName] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  useEffect(() => {
    loadSales();
  }, []);

  const loadSales = async () => {
    setLoading(true);
    try {
      const response = await getShopkeeperSalesHistory();
      setSales(response.sales || []);
    } catch (error) {
      console.error("Failed to load sales:", error);
      alert("Failed to load sales history");
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setSearchName("");
    setDateFrom("");
    setDateTo("");
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const blob = await exportShopkeeperSalesCSV();
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "shopkeeper_sales.csv");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Export failed:", error);
      alert("Failed to export sales data");
    } finally {
      setExporting(false);
    }
  };

  const filteredSales = sales.filter((sale) => {
    if (searchName && !sale.medicine_name.toLowerCase().includes(searchName.toLowerCase())) {
      return false;
    }
    if (dateFrom) {
      const saleDate = new Date(sale.timestamp);
      const fromDate = new Date(dateFrom);
      if (saleDate < fromDate) return false;
    }
    if (dateTo) {
      const saleDate = new Date(sale.timestamp);
      const toDate = new Date(dateTo);
      toDate.setHours(23, 59, 59);
      if (saleDate > toDate) return false;
    }
    return true;
  });

  const totalSales = filteredSales.length;
  const totalQuantity = filteredSales.reduce((sum, sale) => sum + sale.quantity, 0);

  const salesByDate = {};
  filteredSales.forEach((sale) => {
    const date = new Date(sale.timestamp).toLocaleDateString();
    if (!salesByDate[date]) {
      salesByDate[date] = { count: 0, quantity: 0 };
    }
    salesByDate[date].count++;
    salesByDate[date].quantity += sale.quantity;
  });

  if (loading) {
    return (
      <ShopkeeperLayout>
        <div className="text-center py-5">
          <Spinner animation="border" variant="success" />
          <p className="mt-3 text-muted">Loading sales history...</p>
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
            <i className="bi bi-graph-up me-2" style={{ color: "#10b981" }}></i>
            Sales History
          </h2>
          <p className="text-muted mb-0">View all completed sales transactions</p>
        </div>
        <div className="d-flex gap-2">
          <Button
            variant="success"
            onClick={handleExport}
            disabled={exporting || filteredSales.length === 0}
          >
            {exporting ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Exporting...
              </>
            ) : (
              <>
                <i className="bi bi-download me-2"></i>
                Export CSV
              </>
            )}
          </Button>
          <Button variant="outline-secondary" onClick={loadSales}>
            <i className="bi bi-arrow-clockwise me-2"></i>
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <Row className="mb-4">
        <Col md={4}>
          <Card className="border-0 shadow-sm" style={{ borderLeft: "4px solid #10b981" }}>
            <Card.Body>
              <div className="d-flex align-items-center gap-3">
                <div style={{ fontSize: "2.5rem", color: "#10b981" }}>
                  <i className="bi bi-cart-check"></i>
                </div>
                <div>
                  <h3 className="mb-0 fw-bold" style={{ color: "#10b981" }}>
                    {totalSales}
                  </h3>
                  <small className="text-muted">Total Sales</small>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="border-0 shadow-sm" style={{ borderLeft: "4px solid #3b82f6" }}>
            <Card.Body>
              <div className="d-flex align-items-center gap-3">
                <div style={{ fontSize: "2.5rem", color: "#3b82f6" }}>
                  <i className="bi bi-box-seam"></i>
                </div>
                <div>
                  <h3 className="mb-0 fw-bold" style={{ color: "#3b82f6" }}>
                    {totalQuantity}
                  </h3>
                  <small className="text-muted">Units Sold</small>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="border-0 shadow-sm" style={{ borderLeft: "4px solid #8b5cf6" }}>
            <Card.Body>
              <div className="d-flex align-items-center gap-3">
                <div style={{ fontSize: "2.5rem", color: "#8b5cf6" }}>
                  <i className="bi bi-calendar-check"></i>
                </div>
                <div>
                  <h3 className="mb-0 fw-bold" style={{ color: "#8b5cf6" }}>
                    {Object.keys(salesByDate).length}
                  </h3>
                  <small className="text-muted">Active Days</small>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card className="border-0 shadow-sm mb-4">
        <Card.Body>
          <h6 className="mb-3 fw-semibold" style={{ color: "#10b981" }}>
            <i className="bi bi-funnel me-2"></i>
            Filter Sales
          </h6>
          <Row className="align-items-end">
            <Col md={4}>
              <Form.Group>
                <Form.Label className="fw-semibold small">Medicine Name</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Search by medicine name..."
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label className="fw-semibold small">From Date</Form.Label>
                <Form.Control
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label className="fw-semibold small">To Date</Form.Label>
                <Form.Control
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={2}>
              <Button variant="outline-secondary" onClick={handleClear} className="w-100">
                <i className="bi bi-x-lg me-2"></i>
                Clear
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Sales Table */}
      <Card className="border-0 shadow-sm">
        <Card.Body>
          <h5 className="mb-3 fw-semibold" style={{ color: "#10b981" }}>
            <i className="bi bi-list-check me-2"></i>
            Sales Records ({filteredSales.length})
          </h5>

          {filteredSales.length > 0 ? (
            <div className="table-responsive">
              <Table hover>
                <thead style={{ backgroundColor: "#f9fafb" }}>
                  <tr>
                    <th>Sale ID</th>
                    <th>Date & Time</th>
                    <th>Batch ID</th>
                    <th>Medicine Name</th>
                    <th>Quantity Sold</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSales.map((sale) => (
                    <tr key={sale.sale_id}>
                      <td>
                        <code className="px-2 py-1" style={{ backgroundColor: "#f3f4f6", borderRadius: "4px" }}>
                          #{sale.sale_id}
                        </code>
                      </td>
                      <td>
                        <div>
                          <div className="fw-semibold">
                            {new Date(sale.timestamp).toLocaleDateString()}
                          </div>
                          <small className="text-muted">
                            {new Date(sale.timestamp).toLocaleTimeString()}
                          </small>
                        </div>
                      </td>
                      <td>
                        <code className="px-2 py-1" style={{ backgroundColor: "#e0f2fe", borderRadius: "4px" }}>
                          {sale.batch_id}
                        </code>
                      </td>
                      <td className="fw-semibold">{sale.medicine_name}</td>
                      <td>
                        <Badge bg="success" className="px-2 py-1">
                          {sale.quantity} units
                        </Badge>
                      </td>
                      <td>
                        <Badge bg="success" className="px-2 py-1">
                          <i className="bi bi-check-circle me-1"></i>
                          Completed
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-5">
              <i className="bi bi-graph-up" style={{ fontSize: "4rem", color: "#d1d5db" }}></i>
              <h5 className="text-muted mt-3">No sales found</h5>
              <p className="text-muted small">
                {searchName || dateFrom || dateTo
                  ? "Try adjusting your filters"
                  : "Start selling medicines to see sales history"}
              </p>
            </div>
          )}
        </Card.Body>
      </Card>
    </ShopkeeperLayout>
  );
}