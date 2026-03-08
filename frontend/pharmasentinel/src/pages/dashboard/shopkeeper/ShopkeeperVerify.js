import React, { useState } from "react";
import { Row, Col, Card, Form, Button, Spinner, Badge, Alert } from "react-bootstrap";
import { 
  FiShield, 
  FiSearch, 
  FiCheckCircle, 
  FiAlertTriangle, 
  FiPackage, 
  FiTrendingUp,
  FiLock,
  FiAlertOctagon,
  FiInfo,
  FiMapPin,
  FiClock
} from "react-icons/fi";
import ShopkeeperLayout from "../../../components/shopkeeper/ShopkeeperLayout";
import { verifyBatch } from "../../../services/api";

export default function ShopkeeperVerify() {
  const [batchId, setBatchId] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleVerify = async (e) => {
    e.preventDefault();
    
    if (!batchId.trim()) {
      setError("Please enter a batch ID");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await verifyBatch(batchId.trim());
      setResult(response);
    } catch (err) {
      setError(err?.detail || err?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setBatchId("");
    setResult(null);
    setError(null);
  };

  const getSeverityColor = (result) => {
    if (!result) return '#047857';
    const severity = result.severity;
    if (severity === 'CRITICAL') return '#dc2626';
    if (severity === 'HIGH') return '#ea580c';
    if (severity === 'MEDIUM') return '#f59e0b';
    return result.valid && result.authentic ? '#047857' : '#dc2626';
  };

  const getStatusIcon = (result) => {
    if (!result) return <FiShield size={56} />;
    const severity = result.severity;
    if (severity === 'CRITICAL') return <FiAlertOctagon size={56} />;
    if (severity === 'HIGH' || severity === 'MEDIUM') return <FiAlertTriangle size={56} />;
    return result.valid && result.authentic ? <FiCheckCircle size={56} /> : <FiAlertOctagon size={56} />;
  };

  return (
    <ShopkeeperLayout>
      {/* Header */}
      <div className="mb-4">
        <h2 className="mb-1 d-flex align-items-center gap-2">
          <FiShield style={{ color: "#047857" }} />
          Verify Medicine Authenticity
        </h2>
        <p className="text-muted mb-0">
          Verify medicine authenticity for customers using blockchain
        </p>
      </div>

      {/* Search Form */}
      <Card className="border-0 shadow-sm mb-4">
        <Card.Body className="p-4">
          <h5 className="mb-3 fw-semibold d-flex align-items-center gap-2" style={{ color: "#047857" }}>
            <FiSearch />
            Enter Batch ID to Verify
          </h5>
          <Form onSubmit={handleVerify}>
            <Row className="align-items-end g-3">
              <Col md={8}>
                <Form.Group>
                  <Form.Label className="fw-semibold">Batch ID *</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g., BTH-2026-001"
                    value={batchId}
                    onChange={(e) => setBatchId(e.target.value)}
                    disabled={loading}
                    style={{ 
                      fontSize: "1.1rem",
                      fontFamily: "monospace",
                      fontWeight: "600",
                      height: "50px"
                    }}
                  />
                  <Form.Text className="text-muted d-flex align-items-center gap-1">
                    <FiInfo size={14} />
                    Enter batch ID from medicine packaging or QR code
                  </Form.Text>
                </Form.Group>
              </Col>
              <Col md={4}>
                <div className="d-flex gap-2">
                  <Button
                    variant="success"
                    type="submit"
                    disabled={loading || !batchId.trim()}
                    className="flex-grow-1"
                    style={{ height: "50px" }}
                  >
                    {loading ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-2" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        <FiSearch className="me-2" />
                        Verify
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline-secondary"
                    onClick={handleClear}
                    style={{ height: "50px" }}
                    disabled={loading}
                  >
                    Clear
                  </Button>
                </div>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>

      {/* Error Message */}
      {error && (
        <Alert variant="danger" className="shadow-sm border-0" dismissible onClose={() => setError(null)}>
          <div className="d-flex align-items-center gap-3">
            <FiAlertOctagon size={40} />
            <div>
              <h5 className="mb-1 fw-bold d-flex align-items-center gap-2">
                <FiAlertTriangle />
                Verification Failed
              </h5>
              <p className="mb-0">{error}</p>
              <small className="text-muted">
                This medicine may be counterfeit. Do not sell or consume.
              </small>
            </div>
          </div>
        </Alert>
      )}

      {/* Verification Result */}
      {result && (
        <>
          {/* Authenticity Status */}
          <Card 
            className="border-0 shadow-sm mb-4"
            style={{ 
              borderLeft: `6px solid ${getSeverityColor(result)}`,
              backgroundColor: result.valid && result.authentic ? "#f0fdf4" : "#fef2f2"
            }}
          >
            <Card.Body className="p-4">
              <div className="d-flex align-items-center gap-4">
                <div style={{ color: getSeverityColor(result) }}>
                  {getStatusIcon(result)}
                </div>
                <div className="flex-grow-1">
                  <h2 className="mb-2 fw-bold" style={{ color: getSeverityColor(result) }}>
                    {result.title || result.status}
                  </h2>
                  <p className="mb-2" style={{ fontSize: "1.1rem", fontWeight: "500" }}>
                    {result.message}
                  </p>
                  {result.action && (
                    <Alert variant="warning" className="mb-0 mt-3">
                      <FiAlertTriangle className="me-2" />
                      <strong>Action Required:</strong> {result.action}
                    </Alert>
                  )}
                  {result.contact && (
                    <div className="mt-3">
                      <small className="text-muted">
                        <strong>DRAP Hotline:</strong> {result.contact.drap_hotline}
                      </small>
                    </div>
                  )}
                </div>
              </div>
            </Card.Body>
          </Card>

          {/* Medicine Information */}
          {result.medicine && (
            <Card className="border-0 shadow-sm mb-4">
              <Card.Body>
                <h5 className="mb-3 fw-semibold d-flex align-items-center gap-2" style={{ color: "#047857" }}>
                  <FiPackage />
                  Medicine Batch Information
                </h5>
                <Row>
                  <Col md={6} className="mb-3">
                    <div className="p-3 border rounded" style={{ backgroundColor: "#f9fafb" }}>
                      <small className="text-muted fw-semibold d-block mb-1">BATCH ID</small>
                      <div className="fw-bold mt-1" style={{ fontSize: "1.2rem", fontFamily: "monospace", color: "#047857" }}>
                        {result.medicine.batch_id}
                      </div>
                    </div>
                  </Col>
                  <Col md={6} className="mb-3">
                    <div className="p-3 border rounded" style={{ backgroundColor: "#f9fafb" }}>
                      <small className="text-muted fw-semibold d-block mb-1">MEDICINE NAME</small>
                      <div className="fw-bold mt-1" style={{ fontSize: "1.2rem" }}>
                        {result.medicine.name}
                      </div>
                    </div>
                  </Col>
                  <Col md={4} className="mb-3">
                    <div className="p-3 border rounded" style={{ backgroundColor: "#f9fafb" }}>
                      <small className="text-muted fw-semibold d-block mb-1">MANUFACTURER</small>
                      <div className="fw-bold mt-1">{result.medicine.manufacturer}</div>
                    </div>
                  </Col>
                  <Col md={4} className="mb-3">
                    <div className="p-3 border rounded" style={{ backgroundColor: "#f9fafb" }}>
                      <small className="text-muted fw-semibold d-block mb-1">MANUFACTURE DATE</small>
                      <div className="fw-bold mt-1">{result.medicine.manufactured_on}</div>
                    </div>
                  </Col>
                  <Col md={4}>
                    <div className="p-3 border rounded" style={{ backgroundColor: "#f9fafb" }}>
                      <small className="text-muted fw-semibold d-block mb-1">EXPIRY DATE</small>
                      <div className="fw-bold mt-1">{result.medicine.expires_on}</div>
                    </div>
                  </Col>
                  {result.medicine.qr_code && (
                    <Col md={12} className="mt-3">
                      <div className="text-center p-3 border rounded" style={{ backgroundColor: "#f9fafb" }}>
                        <small className="text-muted fw-semibold d-block mb-2">QR CODE</small>
                        <img 
                          src={result.medicine.qr_code} 
                          alt="Batch QR Code" 
                          style={{ maxWidth: "200px", border: "2px solid #047857", borderRadius: "8px" }}
                        />
                      </div>
                    </Col>
                  )}
                </Row>
              </Card.Body>
            </Card>
          )}

          {/* Batch Info (for error cases) */}
          {result.batch_info && !result.medicine && (
            <Card className="border-0 shadow-sm mb-4">
              <Card.Body>
                <h5 className="mb-3 fw-semibold d-flex align-items-center gap-2" style={{ color: "#047857" }}>
                  <FiPackage />
                  Batch Information
                </h5>
                <Row>
                  <Col md={6} className="mb-3">
                    <small className="text-muted d-block">Batch ID</small>
                    <strong>{result.batch_info.batch_id}</strong>
                  </Col>
                  <Col md={6} className="mb-3">
                    <small className="text-muted d-block">Medicine Name</small>
                    <strong>{result.batch_info.name}</strong>
                  </Col>
                  <Col md={6} className="mb-3">
                    <small className="text-muted d-block">Manufacturer</small>
                    <strong>{result.batch_info.manufacturer}</strong>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          )}

          {/* Alerts */}
          {result.alerts && result.alerts.length > 0 && (
            <Card className="border-0 shadow-sm mb-4">
              <Card.Body>
                {result.alerts.map((alert, idx) => (
                  <Alert 
                    key={idx}
                    variant={alert.type === 'critical' ? 'danger' : alert.type === 'warning' ? 'warning' : 'info'}
                    className="mb-2"
                  >
                    <FiInfo className="me-2" />
                    {alert.message}
                  </Alert>
                ))}
              </Card.Body>
            </Card>
          )}

          {/* Security Status */}
          {result.security && (
            <Card className="border-0 shadow-sm mb-4">
              <Card.Body>
                <h5 className="mb-3 fw-semibold d-flex align-items-center gap-2" style={{ color: "#047857" }}>
                  <FiLock />
                  Security Status
                </h5>
                <Row>
                  <Col md={4} className="mb-3">
                    <div className="p-3 border rounded" style={{ backgroundColor: "#f9fafb" }}>
                      <small className="text-muted fw-semibold d-block mb-1">BLOCKCHAIN</small>
                      <Badge bg={result.security.blockchain_verified ? 'success' : 'danger'}>
                        {result.security.blockchain_verified ? 'Verified' : 'Invalid'}
                      </Badge>
                    </div>
                  </Col>
                  <Col md={4} className="mb-3">
                    <div className="p-3 border rounded" style={{ backgroundColor: "#f9fafb" }}>
                      <small className="text-muted fw-semibold d-block mb-1">TAMPER PROOF</small>
                      <Badge bg={result.security.tamper_proof ? 'success' : 'danger'}>
                        {result.security.tamper_proof ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                  </Col>
                  <Col md={4} className="mb-3">
                    <div className="p-3 border rounded" style={{ backgroundColor: "#f9fafb" }}>
                      <small className="text-muted fw-semibold d-block mb-1">VERIFIED AT</small>
                      <strong className="d-block mt-1 small">{result.security.verified_at}</strong>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          )}

          {/* Detailed Info */}
          {result.detailed_info && (
            <Card className="border-0 shadow-sm mb-4">
              <Card.Body>
                <h5 className="mb-3 fw-semibold d-flex align-items-center gap-2" style={{ color: "#047857" }}>
                  <FiInfo />
                  Distribution Status
                </h5>
                <Row>
                  <Col md={3} className="mb-3">
                    <div className="p-3 border rounded" style={{ backgroundColor: "#f9fafb" }}>
                      <small className="text-muted fw-semibold d-block mb-1">STATUS</small>
                      <Badge bg={result.detailed_info.batch_status === 'ACTIVE' ? 'success' : 'danger'}>
                        {result.detailed_info.batch_status}
                      </Badge>
                    </div>
                  </Col>
                  <Col md={3} className="mb-3">
                    <div className="p-3 border rounded" style={{ backgroundColor: "#f9fafb" }}>
                      <small className="text-muted fw-semibold d-block mb-1">MANUFACTURED</small>
                      <strong>{result.detailed_info.total_manufactured} units</strong>
                    </div>
                  </Col>
                  <Col md={3} className="mb-3">
                    <div className="p-3 border rounded" style={{ backgroundColor: "#f9fafb" }}>
                      <small className="text-muted fw-semibold d-block mb-1">DISTRIBUTED</small>
                      <strong>{result.detailed_info.total_distributed} units</strong>
                    </div>
                  </Col>
                  <Col md={3} className="mb-3">
                    <div className="p-3 border rounded" style={{ backgroundColor: "#f9fafb" }}>
                      <small className="text-muted fw-semibold d-block mb-1">REMAINING</small>
                      <strong>{result.detailed_info.remaining_in_supply} units</strong>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          )}

          {/* Supply Chain Journey */}
          {result.journey && result.journey.steps && result.journey.steps.length > 0 && (
            <Card className="border-0 shadow-sm mb-4">
              <Card.Body>
                <h5 className="mb-4 fw-semibold d-flex align-items-center gap-2" style={{ color: "#047857" }}>
                  <FiTrendingUp />
                  {result.journey.title || "Supply Chain Journey"}
                </h5>
                <div className="position-relative" style={{ paddingLeft: "40px" }}>
                  {result.journey.steps.map((step, idx) => (
                    <div key={idx} className="mb-4 position-relative">
                      <div
                        style={{
                          position: "absolute",
                          left: "-28px",
                          top: "10px",
                          width: "36px",
                          height: "36px",
                          borderRadius: "50%",
                          backgroundColor: "#047857",
                          border: "4px solid white",
                          boxShadow: "0 0 0 2px #047857",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "white",
                          fontSize: "1rem",
                          zIndex: 1
                        }}
                      >
                        <FiMapPin />
                      </div>
                      {idx < result.journey.steps.length - 1 && (
                        <div
                          style={{
                            position: "absolute",
                            left: "-12px",
                            top: "46px",
                            width: "4px",
                            height: "calc(100% + 12px)",
                            backgroundColor: "#d1fae5"
                          }}
                        />
                      )}
                      <Card
                        style={{
                          backgroundColor: idx === 0 ? "#f0fdf4" : "#f9fafb",
                          border: `2px solid ${idx === 0 ? "#86efac" : "#e5e7eb"}`
                        }}
                      >
                        <Card.Body className="p-3">
                          <div className="d-flex justify-content-between align-items-start">
                            <div className="flex-grow-1">
                              <Badge bg="secondary" className="mb-2">Step {step.step}</Badge>
                              <h6 className="fw-bold mb-2" style={{ color: "#047857" }}>
                                {step.stage}
                              </h6>
                              <div className="mb-2">
                                <strong>{step.location}</strong>
                              </div>
                              <Badge bg="success">{step.status}</Badge>
                            </div>
                            <div className="text-end">
                              <small className="text-muted d-block">
                                <FiClock className="me-1" />
                                {step.date}
                              </small>
                            </div>
                          </div>
                        </Card.Body>
                      </Card>
                    </div>
                  ))}
                </div>
              </Card.Body>
            </Card>
          )}

          {/* Blockchain Trail */}
          {result.detailed_info?.blockchain?.trail && (
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h5 className="mb-0 fw-semibold d-flex align-items-center gap-2" style={{ color: "#047857" }}>
                    <FiShield />
                    Blockchain Verification Trail
                  </h5>
                  <Badge bg={result.detailed_info.blockchain.is_valid ? "success" : "danger"} className="px-3 py-2">
                    {result.detailed_info.blockchain.trail.length} Verified Blocks
                  </Badge>
                </div>
                
                <div className="position-relative" style={{ paddingLeft: "40px" }}>
                  {result.detailed_info.blockchain.trail.map((block, idx) => {
                    const txData = block.transaction_data || {};
                    
                    return (
                      <div key={idx} className="mb-3 position-relative">
                        <div
                          style={{
                            position: "absolute",
                            left: "-28px",
                            top: "10px",
                            width: "36px",
                            height: "36px",
                            borderRadius: "50%",
                            backgroundColor: "#6366f1",
                            border: "4px solid white",
                            boxShadow: "0 0 0 2px #6366f1",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "white",
                            fontSize: "1rem"
                          }}
                        >
                          <FiPackage />
                        </div>
                        {idx < result.detailed_info.blockchain.trail.length - 1 && (
                          <div
                            style={{
                              position: "absolute",
                              left: "-12px",
                              top: "46px",
                              width: "4px",
                              height: "calc(100% + 12px)",
                              backgroundColor: "#ddd6fe"
                            }}
                          />
                        )}
                        <Card 
                          style={{ 
                            backgroundColor: idx === 0 ? "#ede9fe" : "#f9fafb",
                            border: `2px solid ${idx === 0 ? "#c4b5fd" : "#e5e7eb"}`
                          }}
                        >
                          <Card.Body className="p-3">
                            <div className="d-flex justify-content-between align-items-start mb-2">
                              <div className="flex-grow-1">
                                <Badge bg="dark" className="mb-2">Block #{block.index}</Badge>
                                <h6 className="fw-bold mb-1" style={{ color: "#6366f1" }}>
                                  {txData.action || "TRANSACTION"}
                                </h6>
                                {txData.medicine_name && (
                                  <div className="small mb-2" style={{ color: "#6b7280" }}>
                                    {txData.medicine_name}
                                  </div>
                                )}
                                <div className="d-flex gap-3 flex-wrap">
                                  {txData.quantity && (
                                    <div className="small">
                                      <strong>Quantity:</strong> {txData.quantity} units
                                    </div>
                                  )}
                                  {txData.from_user && (
                                    <div className="small">
                                      <strong>From:</strong> {txData.from_user}
                                    </div>
                                  )}
                                  {txData.to_user && (
                                    <div className="small">
                                      <strong>To:</strong> {txData.to_user}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="text-end">
                                <small className="text-muted d-block">
                                  {new Date(block.timestamp).toLocaleDateString()}
                                </small>
                                <small className="text-muted d-block">
                                  {new Date(block.timestamp).toLocaleTimeString()}
                                </small>
                              </div>
                            </div>
                            <div className="mt-2 pt-2" style={{ borderTop: "1px solid #e5e7eb" }}>
                              <div className="small text-muted">
                                <strong>Created By:</strong> {block.created_by || "System"}
                              </div>
                            </div>
                          </Card.Body>
                        </Card>
                      </div>
                    );
                  })}
                </div>
              </Card.Body>
            </Card>
          )}
        </>
      )}

      {/* Empty State */}
      {!result && !error && !loading && (
        <Card className="border-0 shadow-sm">
          <Card.Body className="text-center py-5">
            <FiShield size={60} style={{ color: "#047857" }} className="mb-3" />
            <h3 className="mb-3 fw-bold">Verify Medicine Authenticity</h3>
            <p className="text-muted mb-4" style={{ maxWidth: "700px", margin: "0 auto", fontSize: "1.05rem" }}>
              Enter a batch ID above to verify medicine authenticity using blockchain technology.
            </p>
            
            <Row className="mt-5 g-4">
              <Col md={4}>
                <Card className="border-0 h-100" style={{ backgroundColor: "#f0fdf4" }}>
                  <Card.Body className="p-4">
                    <FiCheckCircle size={40} style={{ color: "#047857" }} className="mb-3" />
                    <h5 className="fw-bold mb-2">Blockchain Verified</h5>
                    <p className="text-muted small mb-0">
                      100% tamper-proof verification
                    </p>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={4}>
                <Card className="border-0 h-100" style={{ backgroundColor: "#eff6ff" }}>
                  <Card.Body className="p-4">
                    <FiTrendingUp size={40} style={{ color: "#3b82f6" }} className="mb-3" />
                    <h5 className="fw-bold mb-2">Complete Trail</h5>
                    <p className="text-muted small mb-0">
                      Track every step from manufacturer
                    </p>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={4}>
                <Card className="border-0 h-100" style={{ backgroundColor: "#fef3c7" }}>
                  <Card.Body className="p-4">
                    <FiAlertTriangle size={40} style={{ color: "#f59e0b" }} className="mb-3" />
                    <h5 className="fw-bold mb-2">Counterfeit Detection</h5>
                    <p className="text-muted small mb-0">
                      Instant detection of fake medicines
                    </p>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      )}
    </ShopkeeperLayout>
  );
}