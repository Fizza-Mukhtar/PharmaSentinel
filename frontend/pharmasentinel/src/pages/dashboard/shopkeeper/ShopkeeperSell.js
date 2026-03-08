// src/pages/shopkeeper/ShopkeeperSell.js
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Row, Col, Card, Form, Button, Spinner, Badge, Table, Alert } from "react-bootstrap";
import ShopkeeperLayout from "../../../components/shopkeeper/ShopkeeperLayout";
import { getShopkeeperInventory, shopkeeperSellMedicine } from "../../../services/api";

export default function ShopkeeperSell() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [loading, setLoading] = useState(true);
  const [inventory, setInventory] = useState([]);
  const [searchName, setSearchName] = useState("");
  
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [quantity, setQuantity] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [selling, setSelling] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    loadInventory();
    if (location.state?.batch) {
      setSelectedBatch(location.state.batch);
    }
  }, [location.state]);

  const loadInventory = async () => {
    setLoading(true);
    setErrorMessage("");
    try {
      const response = await getShopkeeperInventory();
      const availableInventory = (response.inventory || []).filter(
        (item) => item.expiry_status !== "EXPIRED" && (item.remaining_quantity || 0) > 0
      );
      setInventory(availableInventory);
    } catch (error) {
      console.error("Failed to load inventory:", error);
      setErrorMessage("Failed to load inventory");
    } finally {
      setLoading(false);
    }
  };

  const filteredInventory = inventory.filter((item) =>
    !searchName || item.medicine_name?.toLowerCase().includes(searchName.toLowerCase())
  );

  const handleSelectBatch = (batch) => {
    setSelectedBatch(batch);
    setQuantity("");
    setSuccessMessage("");
    setErrorMessage("");
  };

  const handleSell = async (e) => {
    e.preventDefault();

    if (!selectedBatch) {
      setErrorMessage("Please select a batch");
      return;
    }

    const qty = parseInt(quantity);
    if (!qty || qty <= 0) {
      setErrorMessage("Please enter valid quantity");
      return;
    }

    const availableQty = selectedBatch.remaining_quantity || 0;
    if (qty > availableQty) {
      setErrorMessage(`Only ${availableQty} units available`);
      return;
    }

    setSelling(true);
    setErrorMessage("");
    
    try {
      await shopkeeperSellMedicine(
        selectedBatch.batch_id, 
        qty, 
        customerName || "Walk-in Customer"
      );
      
      setSuccessMessage(`Successfully sold ${qty} units of ${selectedBatch.medicine_name}`);
      setSelectedBatch(null);
      setQuantity("");
      setCustomerName("");
      
      setTimeout(() => {
        loadInventory();
        setSuccessMessage("");
      }, 2000);
    } catch (error) {
      console.error("Failed to sell:", error);
      setErrorMessage(error.detail || "Failed to record sale");
    } finally {
      setSelling(false);
    }
  };

  if (loading) {
    return (
      <ShopkeeperLayout>
        <div className="text-center py-5">
          <Spinner animation="border" variant="success" />
          <p className="mt-3 text-muted">Loading inventory...</p>
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
            <i className="bi bi-cart-plus me-2" style={{ color: "#10b981" }}></i>
            Sell Medicine
          </h2>
          <p className="text-muted mb-0">Process customer purchases</p>
        </div>
        <Button variant="outline-secondary" onClick={loadInventory}>
          <i className="bi bi-arrow-clockwise me-2"></i>
          Refresh
        </Button>
      </div>

      {/* Messages */}
      {successMessage && (
        <Alert variant="success" dismissible onClose={() => setSuccessMessage("")}>
          <i className="bi bi-check-circle me-2"></i>
          {successMessage}
        </Alert>
      )}
      
      {errorMessage && (
        <Alert variant="danger" dismissible onClose={() => setErrorMessage("")}>
          <i className="bi bi-exclamation-triangle me-2"></i>
          {errorMessage}
        </Alert>
      )}

      <Row>
        {/* Left: Available Inventory */}
        <Col lg={7} md={12}>
          <Card className="border-0 shadow-sm mb-4">
            <Card.Body>
              <h5 className="mb-3 fw-semibold">
                <i className="bi bi-box-seam me-2" style={{ color: "#10b981" }}></i>
                Available Stock
              </h5>

              <Form.Group className="mb-3">
                <Form.Control
                  type="text"
                  placeholder="Search medicines..."
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                />
              </Form.Group>

              {filteredInventory.length > 0 ? (
                <div className="table-responsive" style={{ maxHeight: "500px", overflowY: "auto" }}>
                  <Table hover size="sm">
                    <thead style={{ backgroundColor: "#f9fafb", position: "sticky", top: 0, zIndex: 1 }}>
                      <tr>
                        <th>Medicine</th>
                        <th>Available</th>
                        <th>Expiry</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredInventory.map((item) => (
                        <tr
                          key={item.batch_id}
                          style={{
                            backgroundColor: selectedBatch?.batch_id === item.batch_id ? "#dcfce7" : "white",
                            cursor: "pointer"
                          }}
                          onClick={() => handleSelectBatch(item)}
                        >
                          <td>
                            <div className="fw-semibold">{item.medicine_name}</div>
                            <code className="small" style={{ fontSize: "0.75rem", color: "#6b7280" }}>
                              {item.batch_id}
                            </code>
                          </td>
                          <td>
                            <Badge bg={item.low_stock ? "warning" : "success"}>
                              {item.remaining_quantity || 0}
                            </Badge>
                          </td>
                          <td>
                            <Badge bg={item.expiry_status === "SAFE" ? "success" : "warning"} className="small">
                              {item.expiry_status === "SAFE" ? "Safe" : "Expiring Soon"}
                            </Badge>
                          </td>
                          <td>
                            <Button
                              variant="outline-success"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectBatch(item);
                              }}
                            >
                              Select
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-4">
                  <i className="bi bi-box-seam" style={{ fontSize: "3rem", color: "#d1d5db" }}></i>
                  <p className="text-muted mt-2">No medicines available for sale</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Right: Sale Form */}
        <Col lg={5} md={12}>
          <Card className="border-0 shadow-sm" style={{ position: "sticky", top: "20px" }}>
            <Card.Body>
              <h5 className="mb-3 fw-semibold">
                <i className="bi bi-cart-check me-2" style={{ color: "#10b981" }}></i>
                Sale Details
              </h5>

              {selectedBatch ? (
                <Form onSubmit={handleSell}>
                  <Card className="mb-3" style={{ backgroundColor: "#f0fdf4", border: "2px solid #10b981" }}>
                    <Card.Body>
                      <h6 className="fw-bold" style={{ color: "#10b981" }}>
                        {selectedBatch.medicine_name}
                      </h6>
                      <div className="small text-muted mb-2">
                        <strong>Batch ID:</strong> {selectedBatch.batch_id}
                      </div>
                      <div className="d-flex justify-content-between flex-wrap gap-2">
                        <span className="small">
                          <strong>Available:</strong>{" "}
                          <Badge bg="success">{selectedBatch.remaining_quantity || 0} units</Badge>
                        </span>
                        <span className="small">
                          <strong>Expiry:</strong> {selectedBatch.expiry_date ? new Date(selectedBatch.expiry_date).toLocaleDateString() : "N/A"}
                        </span>
                      </div>
                    </Card.Body>
                  </Card>

                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold">Customer Name (Optional)</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter customer name..."
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                    />
                    <Form.Text className="text-muted">Leave blank for walk-in customer</Form.Text>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold">Quantity *</Form.Label>
                    <Form.Control
                      type="number"
                      placeholder="Enter quantity to sell..."
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      min="1"
                      max={selectedBatch.remaining_quantity || 0}
                      required
                    />
                    <Form.Text className="text-muted">
                      Max: {selectedBatch.remaining_quantity || 0} units
                    </Form.Text>
                  </Form.Group>

                  <div className="d-flex gap-2">
                    <Button
                      variant="success"
                      type="submit"
                      disabled={selling || !quantity}
                      className="flex-grow-1"
                    >
                      {selling ? (
                        <>
                          <Spinner animation="border" size="sm" className="me-2" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-check-circle me-2"></i>
                          Complete Sale
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline-secondary"
                      onClick={() => {
                        setSelectedBatch(null);
                        setQuantity("");
                        setCustomerName("");
                        setErrorMessage("");
                      }}
                      disabled={selling}
                    >
                      Cancel
                    </Button>
                  </div>
                </Form>
              ) : (
                <div className="text-center py-5">
                  <i className="bi bi-box-seam" style={{ fontSize: "4rem", color: "#d1d5db" }}></i>
                  <p className="text-muted mt-3">Select a medicine from the inventory list</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </ShopkeeperLayout>
  );
}