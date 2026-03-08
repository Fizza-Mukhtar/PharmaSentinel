// src/components/DashboardNavbar.js
import React from "react";
import { Container, Row, Col } from "react-bootstrap";

const DashboardNavbar = ({ title, subtitle }) => {
  return (
    <Container fluid className="mb-3">
      <Row className="align-items-center">
        <Col>
          <h2 className="text-white">{title}</h2>
          <p className="text-muted">{subtitle}</p>
        </Col>
      </Row>
    </Container>
  );
};

export default DashboardNavbar;
