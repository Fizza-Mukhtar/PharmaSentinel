import React, { useState, useEffect } from 'react';
import './DrapResponsive.css';
import { Row, Col, Card, Table, Badge } from 'react-bootstrap';
import { FaUsers, FaBoxes, FaCheckCircle } from 'react-icons/fa';
import { getDrapDistributors } from '../../../services/api';

const Distributors = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const response = await getDrapDistributors();
      if (response.success) setData(response.distributors);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading-container"><div className="spinner-border text-primary" /></div>;

  return (
    <div style={{ animation: 'fadeIn 0.3s ease-in' }}>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a', margin: '0 0 8px 0', display: 'flex', alignItems: 'center' }}>
          <FaUsers style={{ marginRight: '12px' }} />
          Distributors
        </h2>
        <p style={{ fontSize: '0.95rem', color: '#64748b', margin: 0 }}>Monitor all registered distributors</p>
      </div>

      <Row className="g-3 mb-4">
        <Col md={4}>
          <Card style={{ border: 'none', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
            <Card.Body style={{ textAlign: 'center' }}>
              <h3 style={{ fontSize: '2rem', fontWeight: 700, color: '#1e3a8a', margin: '0 0 8px 0' }}>{data.length}</h3>
              <p style={{ fontSize: '0.9rem', color: '#64748b', margin: 0 }}>Total Distributors</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card style={{ border: 'none', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
            <Card.Body style={{ textAlign: 'center' }}>
              <h3 style={{ fontSize: '2rem', fontWeight: 700, color: '#10b981', margin: '0 0 8px 0' }}>{data.filter(d => d.is_active).length}</h3>
              <p style={{ fontSize: '0.9rem', color: '#64748b', margin: 0 }}>Active</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card style={{ border: 'none', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
            <Card.Body style={{ textAlign: 'center' }}>
              <h3 style={{ fontSize: '2rem', fontWeight: 700, color: '#3b82f6', margin: '0 0 8px 0' }}>{data.reduce((sum, d) => sum + (d.inventory_items || 0), 0)}</h3>
              <p style={{ fontSize: '0.9rem', color: '#64748b', margin: 0 }}>Total Inventory Items</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card style={{ border: 'none', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
        <Card.Body style={{ padding: 0 }}>
          <Table hover responsive style={{ margin: 0 }}>
            <thead style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
              <tr>
                {['Username', 'Email', 'Inventory', 'Received', 'Sent', 'Status', 'Joined'].map(h => (
                  <th key={h} style={{ padding: '16px 20px', fontSize: '0.85rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', border: 'none' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((dist, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '16px 20px', fontWeight: 600 }}>{dist.username}</td>
                  <td>{dist.email}</td>
                  <td><Badge bg="primary">{dist.inventory_items || 0}</Badge></td>
                  <td><Badge bg="success">{dist.transfers_received || 0}</Badge></td>
                  <td><Badge bg="info">{dist.transfers_sent || 0}</Badge></td>
                  <td>{dist.is_active ? <Badge bg="success"><FaCheckCircle /> Active</Badge> : <Badge bg="danger">Inactive</Badge>}</td>
                  <td>{new Date(dist.date_joined).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </div>
  );
};

export default Distributors;