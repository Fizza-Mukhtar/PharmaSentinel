import React, { useEffect, useState } from "react";
import { getManufacturerTransfers } from "../../../services/api";
import {
  Table,
  Container,
  Row,
  Col,
  Form,
  Card,
  Badge,
  Spinner,
  Alert,
  InputGroup,
} from "react-bootstrap";
import { FaSearch, FaExchangeAlt, FaBoxes } from "react-icons/fa";
import ManufacturerLayout from "../../../components/manufacturer/ManufacturerLayout";

const ViewTransfers = () => {
  const [transfers, setTransfers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTransfers();
  }, []);

  const fetchTransfers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getManufacturerTransfers();
      setTransfers(res.transfers || []);
    } catch (error) {
      console.error("Error fetching transfers:", error);
      setError("Failed to load transfers. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const filteredTransfers = transfers.filter((t) => {
    const searchLower = search.toLowerCase();
    return (
      t.batch_id?.toLowerCase().includes(searchLower) ||
      t.batch_name?.toLowerCase().includes(searchLower) ||
      t.receiver_username?.toLowerCase().includes(searchLower)
    );
  });

  const totalUnits = filteredTransfers.reduce(
    (sum, t) => sum + (t.quantity || 0),
    0
  );

  return (
    <ManufacturerLayout active="transfers">
      <Container fluid className="py-4">
        {/* PAGE TITLE */}
        <Row className="mb-4">
          <Col>
            <h3 className="fw-bold mb-1">Transfer History</h3>
            <p className="text-muted mb-0">
              Track all medicine batch transfers to distributors
            </p>
          </Col>
        </Row>

        {/* ERROR ALERT */}
        {error && (
          <Alert variant="danger" dismissible onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* SEARCH */}
        <Row className="mb-4">
          <Col md={6} lg={4}>
            <InputGroup>
              <InputGroup.Text className="bg-white">
                <FaSearch className="text-muted" />
              </InputGroup.Text>
              <Form.Control
                type="text"
                placeholder="Search by batch ID, name, or receiver"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border-start-0"
              />
            </InputGroup>
          </Col>
        </Row>

        {/* STATS CARDS */}
        <Row className="mb-4 g-3">
          <Col md={4}>
            <Card className="border-0 shadow-sm h-100">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <div className="text-muted small mb-1">Total Transfers</div>
                    <h2 className="fw-bold mb-0">{filteredTransfers.length}</h2>
                  </div>
                  <div
                    className="d-flex align-items-center justify-content-center"
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "12px",
                      backgroundColor: "#e0e7ff",
                    }}
                  >
                    <FaExchangeAlt className="text-primary" size={24} />
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col md={4}>
            <Card className="border-0 shadow-sm h-100 bg-info bg-opacity-10">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <div className="text-muted small mb-1">Sent</div>
                    <h2 className="fw-bold mb-0 text-info">
                      {filteredTransfers.length}
                    </h2>
                  </div>
                  <div
                    className="d-flex align-items-center justify-content-center"
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "12px",
                      backgroundColor: "#0dcaf0",
                      opacity: 0.2,
                    }}
                  >
                    <FaExchangeAlt className="text-info" size={24} />
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col md={4}>
            <Card className="border-0 shadow-sm h-100 bg-success bg-opacity-10">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <div className="text-muted small mb-1">Total Units</div>
                    <h2 className="fw-bold mb-0 text-success">{totalUnits}</h2>
                  </div>
                  <div
                    className="d-flex align-items-center justify-content-center"
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "12px",
                      backgroundColor: "#198754",
                      opacity: 0.2,
                    }}
                  >
                    <FaBoxes className="text-success" size={24} />
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* TABLE */}
        <Row>
          <Col>
            <Card className="border-0 shadow-sm">
              <Card.Body className="p-0">
                {loading ? (
                  <div className="text-center py-5">
                    <Spinner animation="border" variant="primary" />
                    <p className="text-muted mt-3">Loading transfers...</p>
                  </div>
                ) : filteredTransfers.length === 0 ? (
                  <Alert variant="warning" className="m-4 text-center">
                    <FaExchangeAlt size={48} className="mb-3 text-warning" />
                    <h5>No transfers found</h5>
                    <p className="mb-0 text-muted">
                      {search
                        ? "Try adjusting your search criteria"
                        : "No transfers have been made yet"}
                    </p>
                  </Alert>
                ) : (
                  <div className="table-responsive">
                    <Table hover className="mb-0 align-middle">
                      <thead className="table-light">
                        <tr>
                          <th className="border-0">Transfer ID</th>
                          <th className="border-0">Batch ID</th>
                          <th className="border-0">Medicine Name</th>
                          <th className="border-0">Quantity</th>
                          <th className="border-0">Receiver</th>
                          <th className="border-0">Role</th>
                          <th className="border-0">Status</th>
                          <th className="border-0">Timestamp</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredTransfers.map((t) => (
                          <tr key={t.transfer_id}>
                            <td className="fw-semibold">{t.transfer_id}</td>
                            <td>
                              <code className="bg-light px-2 py-1 rounded">
                                {t.batch_id}
                              </code>
                            </td>
                            <td>{t.batch_name}</td>
                            <td>
                              <Badge bg="primary" className="fw-semibold">
                                {t.quantity}
                              </Badge>
                            </td>
                            <td>{t.receiver_username}</td>
                            <td>
                              <span className="text-muted small text-uppercase">
                                {t.receiver_role}
                              </span>
                            </td>
                            <td>
                              <Badge
                                bg={
                                  t.status === "CONFIRMED"
                                    ? "success"
                                    : t.status === "PENDING"
                                    ? "warning"
                                    : "secondary"
                                }
                              >
                                {t.status}
                              </Badge>
                            </td>
                            <td className="text-muted small">
                              {new Date(t.timestamp).toLocaleString("en-US", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                )}
              </Card.Body>

              {filteredTransfers.length > 0 && (
                <Card.Footer className="bg-white border-top">
                  <div className="d-flex justify-content-between align-items-center">
                    <small className="text-muted">
                      Showing {filteredTransfers.length} of {transfers.length}{" "}
                      transfers
                    </small>
                  </div>
                </Card.Footer>
              )}
            </Card>
          </Col>
        </Row>
      </Container>
    </ManufacturerLayout>
  );
};

export default ViewTransfers;