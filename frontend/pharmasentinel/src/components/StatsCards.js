// src/components/StatsCards.js
import React from "react";
import { Row, Col, Card } from "react-bootstrap";
import { 
  FaBoxes, 
  FaWarehouse, 
  FaExchangeAlt, 
  FaCheckCircle 
} from "react-icons/fa";

export default function StatsCard({ stats, loading }) {
  if (loading) {
    return <StatsCardsLoading />;
  }

  const cards = [
    {
      id: 1,
      title: "Total Batches",
      value: stats?.total_batches || 0,
      icon: <FaBoxes />,
      color: "primary",
      gradient: "linear-gradient(135deg, #667eea 0%, #120a5e 100%)",
    },
    {
      id: 2,
      title: "In Stock",
      value: stats?.in_stock || 0,
      icon: <FaWarehouse />,
      color: "success",
      gradient: "linear-gradient(135deg, #0f9b0f 0%, #00c853 100%)",
    },
    {
      id: 3,
      title: "Total Transfers",
      value: stats?.total_transfers || 0,
      icon: <FaExchangeAlt />,
      color: "warning",
      gradient: "linear-gradient(135deg, #ff6f00 0%, #ffa726 100%)",
    },
    {
      id: 4,
      title: "Verified",
      value: stats?.total_batches || 0,
      icon: <FaCheckCircle />,
      color: "info",
      gradient: "linear-gradient(135deg, #00acc1 0%, #0097a7 100%)",
    },
  ];

  return (
    <Row className="g-4">
      {cards.map((card, index) => (
        <Col key={card.id} xs={12} sm={6} lg={3}>
          <Card 
            className={`stats-card ${card.color} fade-in`}
            style={{ 
              animationDelay: `${index * 0.1}s`,
              animationFillMode: 'both'
            }}
          >
            <Card.Body>
              <div 
                className="stats-icon" 
                style={{ background: card.gradient }}
              >
                {card.icon}
              </div>
              <div className="stats-value">{card.value}</div>
              <div className="stats-label">{card.title}</div>
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>
  );
}

// Loading skeleton component
function StatsCardsLoading() {
  return (
    <Row className="g-4">
      {[1, 2, 3, 4].map((i) => (
        <Col key={i} xs={12} sm={6} lg={3}>
          <Card className="stats-card">
            <Card.Body>
              <div className="skeleton" style={{ width: "64px", height: "64px", borderRadius: "16px", marginBottom: "1rem" }}></div>
              <div className="skeleton skeleton-title" style={{ width: "80px", height: "40px", marginBottom: "0.5rem" }}></div>
              <div className="skeleton skeleton-text" style={{ width: "120px", height: "16px" }}></div>
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>
  );
}