// src/pages/public/CustomerVerification.js
import React, { useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Alert,
  Spinner,
  Badge,
  ListGroup,
} from "react-bootstrap";
import { verifyMedicineForCustomer } from "../../services/api";

export default function CustomerVerification() {
  const [batchId, setBatchId] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleVerify = async (e) => {
    e.preventDefault();
    
    if (!batchId.trim()) {
      setError("Please enter a Batch ID");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setResult(null);
      
      const data = await verifyMedicineForCustomer(batchId.trim());
      setResult(data);
    } catch (err) {
      setError(err.detail || "Failed to verify medicine");
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const getAuthenticBadge = (authentic) => {
    if (authentic) {
      return <Badge bg="success" className="fs-4">✅ AUTHENTIC</Badge>;
    }
    return <Badge bg="danger" className="fs-4">❌ FAKE / INVALID</Badge>;
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col lg={8}>
          {/* Header */}
          <div className="text-center mb-5">
            <h1 className="display-5 mb-3">🔍 Medicine Verification</h1>
            <p className="lead text-muted">
              Verify the authenticity of your medicine using the Batch ID
            </p>
          </div>

          {/* Verification Form */}
          <Card className="shadow-lg mb-4">
            <Card.Body className="p-4">
              <Form onSubmit={handleVerify}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">
                    Enter Batch ID <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g., BATCH-001"
                    value={batchId}
                    onChange={(e) => setBatchId(e.target.value)}
                    size="lg"
                  />
                  <Form.Text className="text-muted">
                    You can find the Batch ID on the medicine packaging or QR code
                  </Form.Text>
                </Form.Group>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-100"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        className="me-2"
                      />
                      Verifying...
                    </>
                  ) : (
                    "🔍 Verify Medicine"
                  )}
                </Button>
              </Form>
            </Card.Body>
          </Card>

          {/* Error Alert */}
          {error && (
            <Alert variant="danger" dismissible onClose={() => setError("")}>
              <Alert.Heading>❌ Verification Failed</Alert.Heading>
              <p className="mb-0">{error}</p>
            </Alert>
          )}

          {/* Verification Result */}
          {result && (
            <Card className="shadow-lg">
              <Card.Header
                className={
                  result.authentic
                    ? "bg-success text-white"
                    : "bg-danger text-white"
                }
              >
                <div className="d-flex justify-content-between align-items-center">
                  <h4 className="mb-0">Verification Result</h4>
                  {getAuthenticBadge(result.authentic)}
                </div>
              </Card.Header>
              <Card.Body className="p-4">
                {/* Main Message */}
                <Alert
                  variant={result.authentic ? "success" : "danger"}
                  className="mb-4"
                >
                  <h5>{result.message}</h5>
                </Alert>

                {/* Medicine Details */}
                <h5 className="mb-3">📋 Medicine Details</h5>
                <ListGroup className="mb-4">
                  <ListGroup.Item>
                    <strong>Batch ID:</strong> <code>{result.batch_id}</code>
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <strong>Medicine Name:</strong> {result.medicine_name}
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <strong>Manufacturer:</strong> {result.manufacturer}
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <strong>Manufacture Date:</strong>{" "}
                    {result.manufacture_date
                      ? new Date(result.manufacture_date).toLocaleDateString()
                      : "N/A"}
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <strong>Expiry Date:</strong>{" "}
                    {result.expiry_date
                      ? new Date(result.expiry_date).toLocaleDateString()
                      : "N/A"}
                    {result.is_expired && (
                      <Badge bg="danger" className="ms-2">
                        EXPIRED
                      </Badge>
                    )}
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <strong>Current Holder:</strong>{" "}
                    {result.current_holder || "N/A"}
                  </ListGroup.Item>
                </ListGroup>

                {/* Blockchain Verification */}
                <h5 className="mb-3">🔗 Blockchain Verification</h5>
                <ListGroup className="mb-4">
                  <ListGroup.Item>
                    <strong>Blockchain Valid:</strong>{" "}
                    {result.blockchain_valid ? (
                      <Badge bg="success">✅ Valid</Badge>
                    ) : (
                      <Badge bg="danger">❌ Invalid</Badge>
                    )}
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <strong>All Stages Completed:</strong>{" "}
                    {result.all_stages_completed ? (
                      <Badge bg="success">✅ Yes</Badge>
                    ) : (
                      <Badge bg="warning">⚠️ No</Badge>
                    )}
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <strong>Total Blockchain Blocks:</strong>{" "}
                    {result.total_blocks}
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <strong>Already Sold:</strong>{" "}
                    {result.is_sold ? (
                      <Badge bg="danger">⚠️ Yes - Possible Counterfeit!</Badge>
                    ) : (
                      <Badge bg="success">✅ No</Badge>
                    )}
                  </ListGroup.Item>
                </ListGroup>

                {/* Supply Chain Trail */}
                <h5 className="mb-3">🚚 Supply Chain Trail</h5>
                <div className="mb-4">
                  {result.stages_passed && result.stages_passed.length > 0 ? (
                    <div className="d-flex flex-wrap gap-2">
                      {result.stages_passed.map((stage, index) => (
                        <Badge
                          key={index}
                          bg="primary"
                          className="fs-6 py-2 px-3"
                        >
                          {index + 1}. {stage}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted">No supply chain data available</p>
                  )}
                </div>

                {/* Warning Messages */}
                {!result.authentic && (
                  <Alert variant="danger">
                    <Alert.Heading>⚠️ WARNING</Alert.Heading>
                    <ul className="mb-0">
                      {!result.all_stages_completed && (
                        <li>Medicine did not pass through all required supply chain stages</li>
                      )}
                      {result.is_expired && (
                        <li>Medicine has expired - DO NOT USE</li>
                      )}
                      {result.is_sold && (
                        <li>This QR code has been used before - Possible counterfeit!</li>
                      )}
                      {!result.blockchain_valid && (
                        <li>Blockchain has been tampered with</li>
                      )}
                    </ul>
                  </Alert>
                )}

                {/* Action Button */}
                <div className="text-center mt-4">
                  <Button
                    variant="outline-primary"
                    onClick={() => {
                      setBatchId("");
                      setResult(null);
                      setError("");
                    }}
                  >
                    🔍 Verify Another Medicine
                  </Button>
                </div>
              </Card.Body>
            </Card>
          )}

          {/* Instructions */}
          {!result && !error && (
            <Card className="mt-4 shadow-sm">
              <Card.Header className="bg-info text-white">
                <strong>ℹ️ How to Verify</strong>
              </Card.Header>
              <Card.Body>
                <ol className="mb-0">
                  <li className="mb-2">
                    Locate the Batch ID on your medicine packaging
                  </li>
                  <li className="mb-2">
                    Enter the Batch ID in the form above
                  </li>
                  <li className="mb-2">
                    Click "Verify Medicine" button
                  </li>
                  <li className="mb-0">
                    Check the verification result to ensure your medicine is authentic
                  </li>
                </ol>
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>
    </Container>
  );
}