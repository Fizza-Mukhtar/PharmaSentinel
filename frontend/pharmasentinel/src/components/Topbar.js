import React from "react";
import { Navbar, Container, Nav, Dropdown } from "react-bootstrap";
import { logoutUser } from "../services/api";

export default function Topbar() {
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <Navbar bg="dark" variant="dark" expand="lg" className="px-3" style={{ marginLeft: "220px" }}>
      <Container fluid>
        <Navbar.Brand>Manufacturer Panel</Navbar.Brand>
        <Nav className="ms-auto">
          <Dropdown align="end">
            <Dropdown.Toggle variant="secondary">{user?.username || "User"}</Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item onClick={logoutUser}>Logout</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </Nav>
      </Container>
    </Navbar>
  );
}
