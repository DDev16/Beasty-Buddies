import React, { useState } from 'react';
import { Container, Grid, Typography, Link, Box, IconButton, TextField, Button } from '@mui/material';
import { Facebook, Instagram, Twitter, LinkedIn, ArrowUpward } from '@mui/icons-material';
import logo from '../marketplace/Assets/logo.png';
import { useTheme } from '@mui/system';
import useMediaQuery from '@mui/material/useMediaQuery';

function Footer() {
  const [email, setEmail] = useState("");
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.up('md'));

  const handleBackToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  return (
    <Box 
      sx={{
        backgroundImage: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
        borderTop: '5px solid #FE6B8B',
        color: 'background.paper',
        p: 5,
      }}
    >
      <Container>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Box 
              component="img" 
              src={logo} 
              alt="logo" 
              sx={{
                maxHeight: '60px',
                mb: 2,
                filter: 'drop-shadow(0 0 10px #FE6B8B)',
                animation: 'spin 10s linear infinite',
                '@keyframes spin': {
                  from: { transform: 'rotate(0deg)' },
                  to: { transform: 'rotate(360deg)' },
                },
              }}
            />
            <Typography variant="h6" gutterBottom color="inherit" sx={{ textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)' }}>&copy; 2023 My Website</Typography>
            <Typography variant="subtitle2" color="inherit" sx={{ textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)' }}>Powered by Monsters NFT Inc.</Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box 
              sx={{
                display: matches ? 'flex' : 'block',
                flexDirection: matches ? 'row' : 'column',
                gap: 2,
              }}
            >
              <Link href="#" underline="none" color="inherit" sx={{ fontSize: '1.2rem', '&:hover': { color: 'background.paper', textDecoration: 'underline' } }}>Home</Link>
              <Link href="#" underline="none" color="inherit" sx={{ fontSize: '1.2rem', '&:hover': { color: 'background.paper', textDecoration: 'underline' } }}>About</Link>
              <Link href="#" underline="none" color="inherit" sx={{ fontSize: '1.2rem', '&:hover': { color: 'background.paper', textDecoration: 'underline' } }}>Services</Link>
              <Link href="#" underline="none" color="inherit" sx={{ fontSize: '1.2rem', '&:hover': { color: 'background.paper', textDecoration: 'underline' } }}>Contact</Link>
            </Box>
          </Grid>
         
          <Grid item xs={12} md={4}>
            <Box 
              sx={{
                display: 'flex',
                gap: 2,
                justifyContent: 'center',
                flexDirection: { xs: 'column', md: 'row' },
              }}
            >
              <IconButton color="inherit" aria-label="Facebook" sx={{ '&:hover': { transform: 'scale(1.2)', color: '#3b5998', filter: 'drop-shadow(0 0 10px #3b5998)' } }}>
                <Facebook />
              </IconButton>
              <IconButton color="inherit" aria-label="Instagram" sx={{ '&:hover': { transform: 'scale(1.2)', color: '#E1306C', filter: 'drop-shadow(0 0 10px #E1306C)' } }}>
                <Instagram />
              </IconButton>
              <IconButton color="inherit" aria-label="Twitter" sx={{ '&:hover': { transform: 'scale(1.2)', color: '#1DA1F2', filter: 'drop-shadow(0 0 10px #1DA1F2)' } }}>
                <Twitter />
              </IconButton>
              <IconButton color="inherit" aria-label="LinkedIn" sx={{ '&:hover': { transform: 'scale(1.2)', color: '#0A66C2', filter: 'drop-shadow(0 0 10px #0A66C2)' } }}>
                <LinkedIn />
              </IconButton>
            </Box>
          </Grid>
          <Grid item xs={12} md={8}>
            <Typography variant="h6" gutterBottom>Stay updated with our news!</Typography>
            <Box 
              sx={{
                display: 'flex',
                gap: 2,
                flexDirection: { xs: 'column', md: 'row' },
              }}
            >
              <TextField variant="outlined" color="primary" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} fullWidth />
              <Button variant="contained" color="primary">Subscribe</Button>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box 
              sx={{
                display: 'flex',
                justifyContent: 'flex-end',
              }}
            >
              <Button onClick={handleBackToTop} startIcon={<ArrowUpward />} variant="contained" color="primary">Back to top</Button>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

export default Footer;