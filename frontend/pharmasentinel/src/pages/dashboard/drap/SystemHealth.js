import React, { useState, useEffect } from 'react';
import './DrapResponsive.css';
import { Row, Col, Card, Badge, ProgressBar, Button } from 'react-bootstrap';
import { FaHeartbeat, FaDatabase, FaShieldAlt, FaServer, FaSync, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import { getSystemHealth } from '../../../services/api';

const SystemHealth = () => {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchHealth(); }, []);

  const fetchHealth = async () => {
    try {
      const response = await getSystemHealth();
      if (response.success) setHealth(response.health);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    return status === 'OK' ? 'success' : status === 'WARNING' ? 'warning' : 'danger';
  };

  if (loading) return <div className="loading-container"><div className="spinner-border text-primary" /></div>;

  return (
    <div style={{ animation: 'fadeIn 0.3s ease-in' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a', margin: '0 0 8px 0', display: 'flex', alignItems: 'center' }}>
            <FaHeartbeat style={{ marginRight: '12px' }} />
            System Health
          </h2>
          <p style={{ fontSize: '0.95rem', color: '#64748b', margin: 0 }}>Monitor system performance and integrity</p>
        </div>
        <Button variant="primary" onClick={fetchHealth} disabled={loading}>
          <FaSync className={loading ? 'fa-spin' : ''} style={{ marginRight: '8px' }} />
          Refresh
        </Button>
      </div>

      <Row className="g-3 mb-4">
        <Col lg={12}>
          <Card style={{ border: 'none', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', background: health?.status === 'healthy' ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #ef4444, #dc2626)', color: 'white' }}>
            <Card.Body style={{ padding: '32px' }}>
              <div style={{ textAlign: 'center' }}>
                <FaHeartbeat style={{ fontSize: '4rem', marginBottom: '16px' }} />
                <h3 style={{ fontSize: '2rem', fontWeight: 700, margin: '0 0 8px 0', textTransform: 'uppercase' }}>
                  System {health?.status === 'healthy' ? 'Healthy' : 'Degraded'}
                </h3>
                <p style={{ margin: 0, fontSize: '1.1rem', opacity: 0.9 }}>All critical systems operational</p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-3">
        {health?.checks?.map((check, i) => (
          <Col lg={6} key={i}>
            <Card style={{ border: 'none', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', height: '100%' }}>
              <Card.Body style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: check.status === 'OK' ? '#d1fae5' : check.status === 'WARNING' ? '#fef3c7' : '#fee2e2', color: check.status === 'OK' ? '#10b981' : check.status === 'WARNING' ? '#f59e0b' : '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                      {check.status === 'OK' ? <FaCheckCircle /> : <FaExclamationTriangle />}
                    </div>
                    <div>
                      <h5 style={{ margin: '0 0 4px 0', fontWeight: 600, color: '#0f172a' }}>{check.name}</h5>
                      <Badge bg={getStatusColor(check.status)}>{check.status}</Badge>
                    </div>
                  </div>
                </div>
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b' }}>{check.message}</p>
                {check.progress !== undefined && (
                  <div style={{ marginTop: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem', color: '#64748b' }}>
                      <span>Status</span>
                      <span>{check.progress}%</span>
                    </div>
                    <ProgressBar now={check.progress} variant={getStatusColor(check.status)} style={{ height: '8px' }} />
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default SystemHealth;
