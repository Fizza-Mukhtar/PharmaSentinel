import React, { useState } from 'react';
import './DrapResponsive.css';
import { Row, Col, Card, Form, Button, Table, Badge } from 'react-bootstrap';
import { FaSearch, FaBoxes, FaQrcode } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { searchDrapBatches } from '../../../services/api';

const SearchBatches = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ batch_id: '', medicine_name: '', manufacturer_id: '', status: '' });
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await searchDrapBatches(formData);
      if (response.success) {
        setResults(response.results);
        setSearched(true);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ animation: 'fadeIn 0.3s ease-in' }}>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a', margin: '0 0 8px 0', display: 'flex', alignItems: 'center' }}>
          <FaSearch style={{ marginRight: '12px' }} />
          Search Batches
        </h2>
        <p style={{ fontSize: '0.95rem', color: '#64748b', margin: 0 }}>Advanced batch search and filtering</p>
      </div>

      <Card style={{ border: 'none', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', marginBottom: '24px' }}>
        <Card.Body style={{ padding: '24px' }}>
          <Form onSubmit={handleSearch}>
            <Row className="g-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label style={{ fontWeight: 600, fontSize: '0.9rem', color: '#475569' }}>Batch ID</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter batch ID..."
                    value={formData.batch_id}
                    onChange={(e) => setFormData({ ...formData, batch_id: e.target.value })}
                    style={{ borderColor: '#e2e8f0', padding: '10px 16px' }}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label style={{ fontWeight: 600, fontSize: '0.9rem', color: '#475569' }}>Medicine Name</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter medicine name..."
                    value={formData.medicine_name}
                    onChange={(e) => setFormData({ ...formData, medicine_name: e.target.value })}
                    style={{ borderColor: '#e2e8f0', padding: '10px 16px' }}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label style={{ fontWeight: 600, fontSize: '0.9rem', color: '#475569' }}>Status</Form.Label>
                  <Form.Select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    style={{ borderColor: '#e2e8f0', padding: '10px 16px' }}
                  >
                    <option value="">All Status</option>
                    <option value="active">Active</option>
                    <option value="expired">Expired</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label style={{ fontWeight: 600, fontSize: '0.9rem', color: '#475569' }}>Manufacturer ID</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter manufacturer ID..."
                    value={formData.manufacturer_id}
                    onChange={(e) => setFormData({ ...formData, manufacturer_id: e.target.value })}
                    style={{ borderColor: '#e2e8f0', padding: '10px 16px' }}
                  />
                </Form.Group>
              </Col>
              <Col md={12}>
                <Button type="submit" variant="primary" disabled={loading} style={{ width: '100%', padding: '12px', fontWeight: 600 }}>
                  {loading ? <><span className="spinner-border spinner-border-sm me-2" />Searching...</> : <><FaSearch className="me-2" />Search Batches</>}
                </Button>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>

      {searched && (
        <Card style={{ border: 'none', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
          <Card.Header style={{ background: 'white', borderBottom: '1px solid #f1f5f9', padding: '20px 24px' }}>
            <h5 style={{ margin: 0, fontWeight: 600 }}>Search Results ({results.length})</h5>
          </Card.Header>
          <Card.Body style={{ padding: 0 }}>
            <Table hover responsive style={{ margin: 0 }}>
              <thead style={{ background: '#f8fafc' }}>
                <tr>
                  {['Batch ID', 'Medicine', 'Manufacturer', 'Quantity', 'Remaining', 'Expiry', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '16px 20px', fontSize: '0.85rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {results.length === 0 ? (
                  <tr><td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}><FaBoxes size={48} style={{ marginBottom: '12px', display: 'block', margin: '0 auto 12px' }} />No results found</td></tr>
                ) : (
                  results.map((batch, i) => (
                    <tr key={i}>
                      <td style={{ padding: '16px 20px', fontFamily: 'Courier New', fontWeight: 600 }}><FaQrcode style={{ marginRight: '8px', color: '#3b82f6' }} />{batch.batch_id}</td>
                      <td>{batch.name}</td>
                      <td>{batch.manufacturer}</td>
                      <td>{batch.quantity?.toLocaleString()}</td>
                      <td><Badge bg="success">{batch.remaining_quantity}</Badge></td>
                      <td>{batch.expiry_date ? new Date(batch.expiry_date).toLocaleDateString() : 'N/A'}</td>
                      <td>
                        <Button size="sm" variant="outline-primary" onClick={() => navigate(`/dashboard/drap/batches/${batch.batch_id}`)}>
                          View Details
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}
    </div>
  );
};

export default SearchBatches;

