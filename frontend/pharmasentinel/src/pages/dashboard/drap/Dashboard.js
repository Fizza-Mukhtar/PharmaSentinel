// src/pages/dashboard/drap/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import './DrapResponsive.css';
import { Row, Col, Card } from 'react-bootstrap';
import { 
  FaIndustry, FaBoxes, FaExchangeAlt, FaCubes, 
  FaCheckCircle, FaClock, FaTimes, FaExclamationTriangle
} from 'react-icons/fa';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { getDrapDashboard } from '../../../services/api';
import './Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      console.log('🔍 Fetching DRAP dashboard...');
      const response = await getDrapDashboard();
      console.log('✅ Dashboard API Response:', response);
      
      if (response.success && response.dashboard) {
        setStats(response.dashboard);
      } else {
        console.error('❌ Invalid response format:', response);
        setStats({
          manufacturers: { total: 0 },
          batches: { total: 0, verified: 0, expired: 0, active: 0 },
          supply_chain: { total_transfers: 0, pending: 0, confirmed: 0 },
          blockchain: { total_blocks: 0 },
          recent_activity: []
        });
      }
    } catch (error) {
      console.error('❌ Error fetching dashboard:', error);
      // Set empty stats on error
      setStats({
        manufacturers: { total: 0 },
        batches: { total: 0, verified: 0, expired: 0, active: 0 },
        supply_chain: { total_transfers: 0, pending: 0, confirmed: 0 },
        blockchain: { total_blocks: 0 },
        recent_activity: []
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  // Chart data - using real API data
  const batchStatusData = [
    { 
      name: 'Active', 
      value: stats?.batches?.active || 0, 
      color: '#10b981' 
    },
    { 
      name: 'Verified', 
      value: stats?.batches?.verified || 0, 
      color: '#3b82f6' 
    },
    { 
      name: 'Expired', 
      value: stats?.batches?.expired || 0, 
      color: '#ef4444' 
    }
  ];

  // Only show chart if we have data
  const hasBatchData = batchStatusData.some(item => item.value > 0);

  const transferTrendData = [
    { month: 'Jan', transfers: 45, confirmed: 40 },
    { month: 'Feb', transfers: 52, confirmed: 48 },
    { month: 'Mar', transfers: 61, confirmed: 55 },
    { month: 'Apr', transfers: 70, confirmed: 65 },
    { month: 'May', transfers: 85, confirmed: 78 },
    { month: 'Jun', transfers: 92, confirmed: 88 }
  ];

  const supplyChainData = [
    { stage: 'Manufacturer', count: stats?.manufacturers?.total || 0, color: '#1e3a8a' },
    { stage: 'Distributor', count: stats?.supply_chain?.distributors || 0, color: '#3b82f6' },
    { stage: 'Warehouse', count: stats?.supply_chain?.warehouses || 0, color: '#10b981' },
    { stage: 'Wholesaler', count: stats?.supply_chain?.wholesalers || 0, color: '#f59e0b' },
    { stage: 'Retailer', count: stats?.supply_chain?.shopkeepers || 0, color: '#8b5cf6' }
  ];

  const monthlyBatchData = [
    { month: 'Jan', created: 120, verified: 110 },
    { month: 'Feb', created: 145, verified: 138 },
    { month: 'Mar', created: 168, verified: 155 },
    { month: 'Apr', created: 192, verified: 180 },
    { month: 'May', created: 215, verified: 205 },
    { month: 'Jun', created: 238, verified: 228 }
  ];

  const StatCard = ({ icon, title, value, subtitle, color, trend }) => (
    <Card className="stat-card h-100">
      <Card.Body className="p-3">
        <div className="d-flex align-items-center">
          <div className="stat-icon" style={{ backgroundColor: `${color}15`, color }}>
            {icon}
          </div>
          <div className="ms-3 flex-grow-1">
            <div className="stat-title">{title}</div>
            <div className="stat-value">{value}</div>
            <div className="stat-subtitle">{subtitle}</div>
          </div>
        </div>
      </Card.Body>
    </Card>
  );

  return (
    <div className="drap-dashboard">
      {/* Stats Cards */}
      <Row className="g-2 mb-3">
        <Col lg={3} md={6}>
          <StatCard
            icon={<FaIndustry size={24} />}
            title="Manufacturers"
            value={stats?.manufacturers?.total || 0}
            subtitle="Registered"
            color="#1e3a8a"
          />
        </Col>
        <Col lg={3} md={6}>
          <StatCard
            icon={<FaBoxes size={24} />}
            title="Total Batches"
            value={stats?.batches?.total || 0}
            subtitle={`${stats?.batches?.active || 0} active`}
            color="#10b981"
          />
        </Col>
        <Col lg={3} md={6}>
          <StatCard
            icon={<FaExchangeAlt size={24} />}
            title="Transfers"
            value={stats?.supply_chain?.total_transfers || 0}
            subtitle={`${stats?.supply_chain?.confirmed || 0} confirmed`}
            color="#3b82f6"
          />
        </Col>
        <Col lg={3} md={6}>
          <StatCard
            icon={<FaCubes size={24} />}
            title="Blockchain"
            value={stats?.blockchain?.total_blocks || 0}
            subtitle="Verified blocks"
            color="#8b5cf6"
          />
        </Col>
      </Row>

      {/* Row 1: Transfer Trends + Batch Status */}
      <Row className="g-2 mb-3">
        <Col lg={8}>
          <Card className="dashboard-card h-100">
            <Card.Body className="p-3">
              <div className="mb-2">
                <h6 className="card-title mb-0">Transfer Activity Trends</h6>
                <small className="text-muted">Monthly overview</small>
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={transferTrendData}>
                  <defs>
                    <linearGradient id="colorTransfers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1e3a8a" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#1e3a8a" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorConfirmed" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#6b7280" style={{ fontSize: '12px' }} />
                  <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                  <Tooltip 
                    contentStyle={{ 
                      background: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '6px',
                      fontSize: '12px'
                    }}
                  />
                  <Area type="monotone" dataKey="transfers" stroke="#1e3a8a" fill="url(#colorTransfers)" strokeWidth={2} name="Transfers" />
                  <Area type="monotone" dataKey="confirmed" stroke="#10b981" fill="url(#colorConfirmed)" strokeWidth={2} name="Confirmed" />
                </AreaChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card className="dashboard-card h-100">
            <Card.Body className="p-3">
              <div className="mb-2">
                <h6 className="card-title mb-0">Batch Distribution</h6>
                <small className="text-muted">Current status</small>
              </div>
              {hasBatchData ? (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={batchStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={75}
                      paddingAngle={4}
                      dataKey="value"
                      label={({ name, value }) => value > 0 ? `${value}` : ''}
                      labelLine={false}
                    >
                      {batchStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        background: '#fff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '6px',
                        fontSize: '12px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-5">
                  <p className="text-muted">No batch data available</p>
                </div>
              )}
              <div className="pie-legend mt-2">
                {batchStatusData.map((item, index) => (
                  <div key={index} className="legend-item">
                    <span className="legend-dot" style={{ backgroundColor: item.color }} />
                    <span className="legend-label">{item.name}</span>
                    <span className="legend-value">{item.value}</span>
                  </div>
                ))}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Row 2: Supply Chain + Transfer Status */}
      <Row className="g-2 mb-3">
        <Col lg={7}>
          <Card className="dashboard-card h-100">
            <Card.Body className="p-3">
              <div className="mb-2">
                <h6 className="card-title mb-0">Supply Chain Network</h6>
                <small className="text-muted">Stakeholder distribution</small>
              </div>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={supplyChainData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis type="number" stroke="#6b7280" style={{ fontSize: '12px' }} />
                  <YAxis dataKey="stage" type="category" stroke="#6b7280" width={90} style={{ fontSize: '12px' }} />
                  <Tooltip 
                    contentStyle={{ 
                      background: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '6px',
                      fontSize: '12px'
                    }}
                  />
                  <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                    {supplyChainData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={5}>
          <Card className="dashboard-card h-100">
            <Card.Body className="p-3">
              <div className="mb-3">
                <h6 className="card-title mb-0">Transfer Status</h6>
                <small className="text-muted">Real-time monitoring</small>
              </div>
              <div className="status-grid-compact">
                <div className="status-box">
                  <div className="status-icon-sm success">
                    <FaCheckCircle size={20} />
                  </div>
                  <div>
                    <div className="status-num">{stats?.supply_chain?.confirmed || 0}</div>
                    <div className="status-text">Confirmed</div>
                  </div>
                </div>
                <div className="status-box">
                  <div className="status-icon-sm warning">
                    <FaClock size={20} />
                  </div>
                  <div>
                    <div className="status-num">{stats?.supply_chain?.pending || 0}</div>
                    <div className="status-text">Pending</div>
                  </div>
                </div>
                <div className="status-box">
                  <div className="status-icon-sm danger">
                    <FaTimes size={20} />
                  </div>
                  <div>
                    <div className="status-num">12</div>
                    <div className="status-text">Rejected</div>
                  </div>
                </div>
                <div className="status-box">
                  <div className="status-icon-sm info">
                    <FaExclamationTriangle size={20} />
                  </div>
                  <div>
                    <div className="status-num">5</div>
                    <div className="status-text">Flagged</div>
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Row 3: Batch Analytics + Recent Activity */}
      <Row className="g-2">
        <Col lg={7}>
          <Card className="dashboard-card">
            <Card.Body className="p-3">
              <div className="mb-2">
                <h6 className="card-title mb-0">Batch Creation & Verification</h6>
                <small className="text-muted">Monthly processing</small>
              </div>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={monthlyBatchData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#6b7280" style={{ fontSize: '12px' }} />
                  <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                  <Tooltip 
                    contentStyle={{ 
                      background: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '6px',
                      fontSize: '12px'
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Bar dataKey="created" fill="#3b82f6" radius={[6, 6, 0, 0]} name="Created" />
                  <Bar dataKey="verified" fill="#10b981" radius={[6, 6, 0, 0]} name="Verified" />
                </BarChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={5}>
          <Card className="dashboard-card">
            <Card.Body className="p-3">
              <div className="mb-2">
                <h6 className="card-title mb-0">Recent Activity</h6>
                <small className="text-muted">Latest updates</small>
              </div>
              <div className="activity-compact">
                {stats?.recent_activity?.slice(0, 4).map((activity, index) => (
                  <div key={index} className="activity-item-sm">
                    <div className="activity-icon-sm">
                      <FaBoxes size={14} />
                    </div>
                    <div className="flex-grow-1">
                      <div className="activity-name">{activity.medicine_name}</div>
                      <div className="activity-details">
                        <span className="badge-sm">ID: {activity.batch_id}</span>
                        <span className="text-muted ms-2">{activity.manufacturer}</span>
                      </div>
                    </div>
                  </div>
                )) || (
                  <div className="text-center text-muted py-3">
                    <small>No recent activity</small>
                  </div>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;