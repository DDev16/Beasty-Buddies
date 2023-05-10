import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar, Nav } from 'react-bootstrap';
import './NavBar.css'

function NavBar() {
  return (
    <Navbar bg="dark" variant="dark" expand="lg">
      <Navbar.Brand as={Link} to="/">Beasty Battle Buddies</Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="mr-auto">
          <Nav.Link as={Link} to="/">Home</Nav.Link>
          <Nav.Link as={Link} to="/petdetails">Pet Details</Nav.Link>
          <Nav.Link as={Link} to="/battle">Battle</Nav.Link>
          <Nav.Link as={Link} to="/marketplace">Marketplace</Nav.Link>
          <Nav.Link as={Link} to="/buddies">Buddies</Nav.Link>
          {/* Add more Nav.Links here as needed */}
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
}

export default NavBar;