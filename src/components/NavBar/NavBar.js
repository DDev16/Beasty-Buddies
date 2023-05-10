import React from 'react';
import PropTypes from 'prop-types';
import { Link, useLocation } from 'react-router-dom';
import { Navbar, Nav, Tooltip, OverlayTrigger } from 'react-bootstrap';
import './NavBar.css';
import Image from '../marketplace/Assets/logo.png'

const routes = [
  { name: 'Home', path: '/' },
  { name: 'Pet Details', path: '/petdetails' },
  { name: 'Battle', path: '/battle' },
  { name: 'Marketplace', path: '/marketplace' },
  { name: 'Buddies', path: '/buddies' },
];

function NavBar() {
  const location = useLocation();
  return (
    <Navbar className="NavBar" expand="lg">
      <Navbar.Brand as={Link} to="/">
        <img 
          src={Image}
          alt="Beasty Battle Buddies"
          width="250" 
          height="250" 
          className="d-inline-block align-top" 
        />  
      </Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="ml-auto">
          {routes.map((route, index) => (
            <OverlayTrigger
              key={index}
              placement="bottom"
              overlay={<Tooltip id={`tooltip-${index}`}>Go to {route.name}</Tooltip>}
            >
              <Nav.Link as={Link} to={route.path} className={location.pathname === route.path ? 'active' : ''}>
                {route.name}
              </Nav.Link>
            </OverlayTrigger>
          ))}
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
}

NavBar.propTypes = {
  location: PropTypes.object.isRequired,
};

export default NavBar;
