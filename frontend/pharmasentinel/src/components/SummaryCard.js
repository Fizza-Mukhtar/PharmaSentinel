import React from "react";
import { Card } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const SummaryCard = ({ title, value, icon, color = "#1A73E8" }) => {
  return (
    <Card
      className="mb-3"
      style={{
        backdropFilter: "blur(12px)",
        background: "rgba(255,255,255,0.05)",
        borderRadius: "15px",
        color: "white",
        border: "1px solid rgba(255,255,255,0.2)",
        transition: "transform 0.3s, box-shadow 0.3s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-5px)";
        e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.4)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      <Card.Body className="d-flex align-items-center">
        <div
          style={{
            fontSize: "2rem",
            marginRight: "1rem",
            color: color,
            minWidth: "50px",
            textAlign: "center",
          }}
        >
          <FontAwesomeIcon icon={icon} />
        </div>
        <div>
          <Card.Title style={{ fontSize: "0.9rem", color: "#ccc" }}>{title}</Card.Title>
          <Card.Text style={{ fontSize: "1.5rem", fontWeight: "bold" }}>{value}</Card.Text>
        </div>
      </Card.Body>
    </Card>
  );
};

export default SummaryCard;
