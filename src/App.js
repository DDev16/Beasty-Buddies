import React from 'react';
import Mint from './components/Mint/MintPet.js';
import NavBar from './components/NavBar/NavBar.js';
import { Container, Row, Col } from 'react-bootstrap';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css'; // import your CSS file here;
import PetDetails from './components/Pet/PetDetails.js';
import SliderComponent from './components/Slider.js';
import { Spacer } from '@chakra-ui/react';
import  Battle  from './components/Battle/Battle.js'
import { createTheme, ThemeProvider } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#1976d2",
    },
    secondary: {
      main: "#dc004e",
    },
  },
});


const images = [
  process.env.PUBLIC_URL + '/assets/MonsterDaddy_Disney_Pixar_Style_cute_and_adorable_newborn_baby__6e0683f7-39c2-4857-a8f7-072bb33f7af1.png',
  process.env.PUBLIC_URL + '/assets/MonsterDaddy_Disney_Pixar_Style_cute_and_adorable_newborn_baby__ba6f3ff0-0d14-4bcb-a3af-dd76bf138756.png',

  process.env.PUBLIC_URL + '/assets/BABY (1).png',
  process.env.PUBLIC_URL + '/assets/MonsterDaddy_Disney_Pixar_Style_cute_and_adorable_newborn_baby__ba6f3ff0-0d14-4bcb-a3af-dd76bf138756.png',
];


function App() {
  return (
    
    <div className="App">
      <Router>
        <NavBar />
        <Container>
  <Col md={{ span: 8, offset: 2 }}>
    <header className="text-center">
    <div className="bg-gradient-to-r from-pink-500 to-purple-500">
    <h1 className="text-5xl md:text-7xl font-bold text-white mb-4" style={{textShadow: "2px 2px 4px #000000", fontFamily: "Montserrat"}}>
  <span className="animate-pulse">Beasty</span> 
  <span className="animate-pulse md:text-6xl" style={{color: "#00FFFF"}}>Battle</span> 
  <span className="animate-pulse">Buddies</span> 
  <Spacer></Spacer>
  <span className="animate-bounce text-3xl md:text-5xl" style={{color: "#FFD700"}}>NFT</span>
</h1>

</div>

<div className="text-center py-8">
<h2 className="text-4xl font-bold text-primary-900 mb-4 animate-pulse" style={{textShadow: "2px 2px 4px rgba(0, 0, 0, 0.3), -webkit-text-stroke: 1px #fff", fontFamily: "'Roboto', sans-serif", color: "#f75f00", background: "linear-gradient(45deg, #f75f00, #ffc107)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"}}>
  Bring home your own digital pet
</h2>



  <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
    <p className="max-w-xl text-xl text-gray-600 mb-0">
      Adopt a loyal companion that will brighten your days and warm your heart. Our digital pets are always there for you, ready to play, learn, and grow with you.
    </p>
    <p className="mt-4 text-xl text-primary-700 font-bold">
      Nurture it with care, and see it thrive!
    </p>
  </div>
</div>




<SliderComponent images={images} />

    </header>
  </Col>
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
      <ThemeProvider theme={theme}>
      <Battle/>
          </ThemeProvider>

    </div>
    
  );
}

export default App;
