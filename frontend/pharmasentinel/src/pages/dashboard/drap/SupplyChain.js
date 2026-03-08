// src/pages/dashboard/drap/SupplyChain.js
import React, { useState, useEffect } from 'react';
import './DrapResponsive.css';
import { Row, Col, Card, Table, Badge } from 'react-bootstrap';
import { FaNetworkWired } from 'react-icons/fa';
import { getSupplyChainOverview } from '../../../services/api';

const SupplyChain = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { 
    fetchData(); 
  }, []);

  const fetchData = async () => {
    try {
      const response = await getSupplyChainOverview();
      if (response.success) setData(response.supply_chain);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner-border text-primary" />
      </div>
    );
  }

  return (
    <div className="supply-chain-page" style={{ animation: 'fadeIn 0.3s ease-in', padding: '16px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: 'clamp(1.25rem, 3vw, 1.75rem)', fontWeight: 700, color: '#0f172a', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FaNetworkWired />
          Supply Chain Overview
        </h2>
        <p style={{ fontSize: 'clamp(0.85rem, 2vw, 0.95rem)', color: '#64748b', margin: 0 }}>
          Monitor complete supply chain network
        </p>
      </div>

      <Row className="g-3 mb-4">
        {[
          { title: 'Distributors', value: data?.stakeholders?.distributors || 0, color: '#1e3a8a' },
          { title: 'Warehouses', value: data?.stakeholders?.warehouses || 0, color: '#10b981' },
          { title: 'Wholesalers', value: data?.stakeholders?.wholesalers || 0, color: '#3b82f6' },
          { title: 'Shopkeepers', value: data?.stakeholders?.shopkeepers || 0, color: '#8b5cf6' }
        ].map((stat, i) => (
          <Col lg={3} md={6} key={i}>
            <Card style={{ border: 'none', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', height: '100%' }}>
              <Card.Body>
                <div style={{ textAlign: 'center' }}>
                  <h3 style={{ 
                    fontSize: 'clamp(1.5rem, 4vw, 2rem)', 
                    fontWeight: 700, 
                    color: stat.color, 
                    margin: '0 0 8px 0' 
                  }}>
                    {stat.value}
                  </h3>
                  <p style={{ 
                    fontSize: 'clamp(0.8rem, 1.5vw, 0.9rem)', 
                    color: '#64748b', 
                    margin: 0,
                    fontWeight: 500
                  }}>
                    {stat.title}
                  </p>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <Card style={{ border: 'none', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
        <Card.Header style={{ 
          background: 'white', 
          borderBottom: '1px solid #f1f5f9', 
          padding: '20px 24px',
          borderRadius: '12px 12px 0 0'
        }}>
          <h5 style={{ 
            margin: 0, 
            fontWeight: 600,
            fontSize: 'clamp(1rem, 2vw, 1.125rem)'
          }}>
            Recent Transfers
          </h5>
        </Card.Header>
        <Card.Body style={{ padding: 0 }}>
          <div className="table-responsive">
            <Table hover style={{ margin: 0 }}>
              <thead style={{ background: '#f8fafc' }}>
                <tr>
                  {['Batch ID', 'Medicine', 'From', 'To', 'Quantity', 'Status', 'Date'].map(header => (
                    <th key={header} style={{ 
                      padding: '16px 20px', 
                      fontSize: 'clamp(0.75rem, 1.5vw, 0.85rem)', 
                      fontWeight: 700, 
                      color: '#475569', 
                      textTransform: 'uppercase',
                      whiteSpace: 'nowrap'
                    }}>
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data?.recent_activity && data.recent_activity.length > 0 ? (
                  data.recent_activity.map((activity, i) => (
                    <tr key={i}>
                      <td style={{ 
                        padding: '16px 20px', 
                        fontFamily: 'Courier New', 
                        fontWeight: 600,
                        fontSize: 'clamp(0.8rem, 1.5vw, 0.9rem)'
                      }}>
                        {activity.batch_id}
                      </td>
                      <td style={{ fontSize: 'clamp(0.8rem, 1.5vw, 0.9rem)' }}>
                        {activity.medicine_name}
                      </td>
                      <td>
                        <Badge bg="secondary" style={{ fontSize: 'clamp(0.7rem, 1.5vw, 0.8rem)' }}>
                          {activity.from_user}
                        </Badge>
                      </td>
                      <td>
                        <Badge bg="secondary" style={{ fontSize: 'clamp(0.7rem, 1.5vw, 0.8rem)' }}>
                          {activity.to_user}
                        </Badge>
                      </td>
                      <td style={{ fontSize: 'clamp(0.8rem, 1.5vw, 0.9rem)' }}>
                        {activity.quantity}
                      </td>
                      <td>
                        <Badge bg="success" style={{ fontSize: 'clamp(0.7rem, 1.5vw, 0.8rem)' }}>
                          {activity.status}
                        </Badge>
                      </td>
                      <td style={{ fontSize: 'clamp(0.8rem, 1.5vw, 0.9rem)' }}>
                        {new Date(activity.timestamp).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" style={{ 
                      textAlign: 'center', 
                      padding: '40px 20px',
                      color: '#94a3b8'
                    }}>
                      No recent activity
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default SupplyChain;