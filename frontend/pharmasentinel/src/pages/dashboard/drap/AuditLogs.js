import React, { useState, useEffect } from 'react';
import './DrapResponsive.css';
import { Row, Col, Card, Table, Badge, Form, InputGroup } from 'react-bootstrap';
import { FaClipboardList, FaSearch, FaFilter, FaClock, FaUser } from 'react-icons/fa';
import { getDrapAuditLogs } from '../../../services/api';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => { fetchLogs(); }, []);
  useEffect(() => { filterLogs(); }, [searchTerm, typeFilter, logs]);

  const fetchLogs = async () => {
    try {
      const response = await getDrapAuditLogs();
      if (response.success) setLogs(response.logs);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterLogs = () => {
    let filtered = [...logs];
    if (searchTerm) filtered = filtered.filter(log => 
      log.user?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    if (typeFilter !== 'all') filtered = filtered.filter(log => log.type === typeFilter);
    setFilteredLogs(filtered);
  };

  const getTypeBadge = (type) => {
    const config = {
      'BATCH_CREATED': { bg: 'success', text: 'Batch Created' },
      'TRANSFER': { bg: 'info', text: 'Transfer' },
      'BLOCKCHAIN': { bg: 'primary', text: 'Blockchain' },
      'USER_ACTION': { bg: 'warning', text: 'User Action' }
    };
    const c = config[type] || { bg: 'secondary', text: type };
    return <Badge bg={c.bg}>{c.text}</Badge>;
  };

  if (loading) return <div className="loading-container"><div className="spinner-border text-primary" /></div>;

  return (
    <div style={{ animation: 'fadeIn 0.3s ease-in' }}>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a', margin: '0 0 8px 0', display: 'flex', alignItems: 'center' }}>
          <FaClipboardList style={{ marginRight: '12px' }} />
          Audit Logs
        </h2>
        <p style={{ fontSize: '0.95rem', color: '#64748b', margin: 0 }}>System activity and compliance records</p>
      </div>

      <Card style={{ border: 'none', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', marginBottom: '16px' }}>
        <Card.Body style={{ padding: '20px' }}>
          <Row className="g-3">
            <Col lg={6}>
              <InputGroup>
                <InputGroup.Text style={{ background: '#f8fafc', borderColor: '#e2e8f0' }}>
                  <FaSearch />
                </InputGroup.Text>
                <Form.Control
                  placeholder="Search by user or action..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ borderColor: '#e2e8f0' }}
                />
              </InputGroup>
            </Col>
            <Col lg={4}>
              <Form.Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} style={{ borderColor: '#e2e8f0' }}>
                <option value="all">All Types</option>
                <option value="BATCH_CREATED">Batch Created</option>
                <option value="TRANSFER">Transfers</option>
                <option value="BLOCKCHAIN">Blockchain</option>
              </Form.Select>
            </Col>
            <Col lg={2}>
              <div style={{ padding: '10px 16px', background: '#f8fafc', borderRadius: '8px', textAlign: 'center', fontSize: '0.9rem', fontWeight: 500, color: '#64748b' }}>
                <FaFilter style={{ marginRight: '8px' }} />
                {filteredLogs.length} logs
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Card style={{ border: 'none', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
        <Card.Body style={{ padding: 0 }}>
          <Table hover responsive style={{ margin: 0 }}>
            <thead style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
              <tr>
                {['ID', 'Type', 'Action', 'User', 'Details', 'Timestamp'].map(h => (
                  <th key={h} style={{ padding: '16px 20px', fontSize: '0.85rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px', border: 'none' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length === 0 ? (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>No audit logs found</td></tr>
              ) : (
                filteredLogs.map((log, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '16px 20px', fontFamily: 'Courier New', fontSize: '0.85rem' }}>{log.id}</td>
                    <td>{getTypeBadge(log.type)}</td>
                    <td style={{ fontWeight: 600 }}>{log.action}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FaUser style={{ color: '#64748b' }} />
                        {log.user}
                        <Badge bg="secondary" style={{ fontSize: '0.7rem' }}>{log.user_role}</Badge>
                      </div>
                    </td>
                    <td style={{ fontSize: '0.85rem', color: '#64748b', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {JSON.stringify(log.details).substring(0, 50)}...
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
                        <FaClock style={{ color: '#94a3b8' }} />
                        {log.timestamp}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </div>
  );
};

export default AuditLogs;
