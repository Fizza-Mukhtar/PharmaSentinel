// src/pages/dashboard/drap/Analytics.jsx
import React, { useState, useEffect } from 'react';
import './DrapResponsive.css';
import { Row, Col, Card, Form } from 'react-bootstrap';
import { 
  FaChartLine, FaIndustry, FaBoxes, FaNetworkWired,
  FaCheckCircle, FaTimes, FaExclamationTriangle
} from 'react-icons/fa';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer
} from 'recharts';
import { getDrapAnalytics } from '../../../services/api';
import './Analytics.css';

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [timeRange, setTimeRange] = useState('6months');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await getDrapAnalytics();
      
      if (response.success) {
        setAnalytics(response.report);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  // Sample data (replace with real API data)
  const batchTrendData = [
    { month: 'Jan', created: 45, expired: 5, verified: 40 },
    { month: 'Feb', created: 52, expired: 8, verified: 44 },
    { month: 'Mar', created: 61, expired: 6, verified: 55 },
    { month: 'Apr', created: 70, expired: 10, verified: 60 },
    { month: 'May', created: 85, expired: 12, verified: 73 },
    { month: 'Jun', created: 92, expired: 15, verified: 77 }
  ];

  const manufacturerPerformanceData = [
    { name: 'PharmaCo', batches: 145, verified: 140, compliance: 96.5 },
    { name: 'MediLife', batches: 120, verified: 115, compliance: 95.8 },
    { name: 'HealthPlus', batches: 98, verified: 95, compliance: 96.9 },
    { name: 'CurePharma', batches: 87, verified: 82, compliance: 94.2 },
    { name: 'VitalMeds', batches: 76, verified: 74, compliance: 97.4 }
  ];

  const transferStatusData = [
    { name: 'Confirmed', value: 1250, color: '#10b981' },
    { name: 'Pending', value: 340, color: '#f59e0b' },
    { name: 'Rejected', value: 85, color: '#ef4444' }
  ];

  const blockchainCoverageData = [
    { name: 'With Blockchain', value: analytics?.blockchain?.batches_tracked || 245, color: '#1e3a8a' },
    { name: 'Without Blockchain', value: 28, color: '#ef4444' }
  ];

  const StatCard = ({ icon, title, value, subtitle, color, bgColor, trend }) => (
    <Card className="analytics-stat-card">
      <Card.Body>
        <div className="analytics-stat-content">
          <div className="analytics-stat-icon" style={{ backgroundColor: bgColor, color }}>
            {icon}
          </div>
          <div className="analytics-stat-details">
            <p className="analytics-stat-label">{title}</p>
            <h3 className="analytics-stat-value">{value}</h3>
            <p className="analytics-stat-subtitle">{subtitle}</p>
            {trend && (
              <span className={`analytics-trend ${trend > 0 ? 'positive' : 'negative'}`}>
                {trend > 0 ? '+' : ''}{trend}%
              </span>
            )}
          </div>
        </div>
      </Card.Body>
    </Card>
  );

  if (loading && !analytics) {
    return (
      <div className="loading-container">
        <div className="spinner-border text-primary" />
      </div>
    );
  }

  return (
    <div className="analytics-page">
      {/* Header */}
      <div className="analytics-header">
        <div>
          <h2 className="analytics-title">
            <FaChartLine className="me-2" />
            System Analytics
          </h2>
          <p className="analytics-subtitle">
            Comprehensive system performance insights
          </p>
        </div>
        <Form.Select 
          className="time-range-select"
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
        >
          <option value="1month">Last Month</option>
          <option value="3months">Last 3 Months</option>
          <option value="6months">Last 6 Months</option>
          <option value="1year">Last Year</option>
        </Form.Select>
      </div>

      {/* Stats Overview */}
      <Row className="g-3 mb-4">
        <Col lg={3} md={6}>
          <StatCard
            icon={<FaIndustry size={24} />}
            title="Active Manufacturers"
            value={analytics?.manufacturers?.active || 45}
            subtitle="Total registered"
            color="#1e3a8a"
            bgColor="#dbeafe"
            trend={5.2}
          />
        </Col>
        <Col lg={3} md={6}>
          <StatCard
            icon={<FaBoxes size={24} />}
            title="Total Batches"
            value={analytics?.batches?.total || 273}
            subtitle={`${analytics?.batches?.active || 245} active`}
            color="#10b981"
            bgColor="#d1fae5"
            trend={8.7}
          />
        </Col>
        <Col lg={3} md={6}>
          <StatCard
            icon={<FaNetworkWired size={24} />}
            title="Transfer Success Rate"
            value={`${analytics?.transfers?.success_rate || 95.2}%`}
            subtitle="High performance"
            color="#3b82f6"
            bgColor="#dbeafe"
            trend={2.3}
          />
        </Col>
        <Col lg={3} md={6}>
          <StatCard
            icon={<FaCheckCircle size={24} />}
            title="Blockchain Coverage"
            value={`${analytics?.blockchain?.coverage_rate || 89.7}%`}
            subtitle="System integrity"
            color="#8b5cf6"
            bgColor="#ede9fe"
            trend={12.5}
          />
        </Col>
      </Row>

      {/* Charts Row 1 */}
      <Row className="g-3 mb-4">
        <Col lg={8}>
          <Card className="chart-card-analytics">
            <Card.Header>
              <h5>Batch Creation Trends</h5>
              <p>Monthly batch statistics</p>
            </Card.Header>
            <Card.Body>
              <ResponsiveContainer width="100%" height={320}>
                <AreaChart data={batchTrendData}>
                  <defs>
                    <linearGradient id="colorCreated" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1e3a8a" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#1e3a8a" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorVerified" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="created" 
                    stroke="#1e3a8a" 
                    fill="url(#colorCreated)"
                    strokeWidth={2}
                    name="Created"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="verified" 
                    stroke="#10b981" 
                    fill="url(#colorVerified)"
                    strokeWidth={2}
                    name="Verified"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card className="chart-card-analytics">
            <Card.Header>
              <h5>Transfer Status</h5>
              <p>Distribution overview</p>
            </Card.Header>
            <Card.Body>
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie
                    data={transferStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {transferStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="pie-legend-analytics">
                {transferStatusData.map((item, index) => (
                  <div key={index} className="legend-item-analytics">
                    <span 
                      className="legend-color-analytics" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="legend-label-analytics">{item.name}</span>
                    <span className="legend-value-analytics">{item.value}</span>
                  </div>
                ))}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Charts Row 2 */}
      <Row className="g-3 mb-4">
        <Col lg={7}>
          <Card className="chart-card-analytics">
            <Card.Header>
              <h5>Manufacturer Performance</h5>
              <p>Top 5 manufacturers by compliance</p>
            </Card.Header>
            <Card.Body>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={manufacturerPerformanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="batches" fill="#1e3a8a" radius={[8, 8, 0, 0]} name="Total Batches" />
                  <Bar dataKey="verified" fill="#10b981" radius={[8, 8, 0, 0]} name="Verified" />
                </BarChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={5}>
          <Card className="chart-card-analytics">
            <Card.Header>
              <h5>Blockchain Coverage</h5>
              <p>System integrity status</p>
            </Card.Header>
            <Card.Body>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={blockchainCoverageData}
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {blockchainCoverageData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Key Metrics */}
      <Row className="g-3">
        <Col lg={12}>
          <Card className="metrics-card">
            <Card.Header>
              <h5>Key Performance Indicators</h5>
            </Card.Header>
            <Card.Body>
              <Row className="g-3">
                <Col md={3}>
                  <div className="metric-item">
                    <div className="metric-icon success">
                      <FaCheckCircle />
                    </div>
                    <div>
                      <h4>{analytics?.batches?.total || 273}</h4>
                      <p>Total Batches Created</p>
                    </div>
                  </div>
                </Col>
                <Col md={3}>
                  <div className="metric-item">
                    <div className="metric-icon warning">
                      <FaExclamationTriangle />
                    </div>
                    <div>
                      <h4>{analytics?.batches?.expired || 28}</h4>
                      <p>Expired Batches</p>
                      <small className="text-danger">{((28/273)*100).toFixed(1)}% expiry rate</small>
                    </div>
                  </div>
                </Col>
                <Col md={3}>
                  <div className="metric-item">
                    <div className="metric-icon info">
                      <FaNetworkWired />
                    </div>
                    <div>
                      <h4>{analytics?.transfers?.successful || 1250}</h4>
                      <p>Successful Transfers</p>
                      <small className="text-success">95.2% success rate</small>
                    </div>
                  </div>
                </Col>
                <Col md={3}>
                  <div className="metric-item">
                    <div className="metric-icon danger">
                      <FaTimes />
                    </div>
                    <div>
                      <h4>85</h4>
                      <p>Rejected Transfers</p>
                      <small className="text-muted">4.8% rejection rate</small>
                    </div>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Analytics;