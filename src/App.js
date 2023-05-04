import React from 'react';
import Mint from './components/Mint/MintPet.js';
import NavBar from './components/NavBar/NavBar.js';
import { Container, Row, Col } from 'react-bootstrap';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css'; // import your CSS file here;
import PetDetails from './components/Pet/PetDetails.js';

function App() {
  return (
    <div className="App">
      <Router>
        <NavBar />
        <Container>
        <Row className="header-section my-5">
  <Col md={{ span: 8, offset: 2 }}>
    <header className="text-center">
      <h1 className="text-4xl font-bold text-primary-900 mb-4">
        Beasty Battle Buddies NFT
      </h1>
      <p className="text-xl text-primary-700">
        Adopt and care for your very own digital pet!
      </p>
      <p className="text-xl text-primary-700 font-bold mb-5">
        Give it love and watch it grow!
      </p>
    </header>
  </Col>
</Row>
          <Row className="my-5">
            <Col md={{ span: 8, offset: 2 }}>
              <Routes>
                <Route path="/" element={<Mint />} />
                {/* Add more routes here as needed */}
              </Routes>
            </Col>
          </Row>
          <PetDetails/>
        </Container>
      </Router>
    </div>
  );
}

export default App;
