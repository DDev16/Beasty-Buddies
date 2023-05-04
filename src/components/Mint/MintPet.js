import React, { useState, useEffect } from 'react';
import { web3, totalSupply, mintPets } from '../Web3';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

const MAX_SUPPLY = 10000; // Update this value with the correct maximum supply for your contract
const MAX_MINT_PER_TRANSACTION = 10;

function Mint() {
const [amount, setAmount] = useState(1);
const [currentTotalSupply, setCurrentTotalSupply] = useState(0);
const [remainingSupply, setRemainingSupply] = useState(MAX_SUPPLY);
const [loading, setLoading] = useState(false);
const [alertOpen, setAlertOpen] = useState(false);
const [alertMessage, setAlertMessage] = useState('');
const [alertSeverity, setAlertSeverity] = useState('success');

// Fetch the total supply and update the remaining supply
useEffect(() => {
const fetchTotalSupply = async () => {
const supply = await totalSupply();
setCurrentTotalSupply(supply);
setRemainingSupply(MAX_SUPPLY - supply);
};


fetchTotalSupply();
}, []);

const handleChange = (event) => {
const value = parseInt(event.target.value);

if (value < 1 || value > MAX_MINT_PER_TRANSACTION || isNaN(value)) {
  return;
}

setAmount(value);
};

const handleMint = async () => {
setLoading(true);

try {
  const accounts = await web3.eth.getAccounts();
  const account = accounts[0];

  if (!account) {
    setAlertSeverity('error');
    setAlertMessage('Please connect your MetaMask wallet.');
    setAlertOpen(true);
    setLoading(false);
    return;
  }

  if (amount > remainingSupply) {
    setAlertSeverity('error');
    setAlertMessage(`Only ${remainingSupply} pets left. Please choose a smaller quantity.`);
    setAlertOpen(true);
    setLoading(false);
    return;
  }

  await mintPets(amount, account);
  setAlertSeverity('success');
  setAlertMessage(`Successfully minted ${amount} pets!`);
  setAlertOpen(true);

  // Update total supply and remaining supply after minting
  const newTotalSupply = await totalSupply();
  setCurrentTotalSupply(newTotalSupply);
  setRemainingSupply(MAX_SUPPLY - newTotalSupply);
} catch (error) {
  console.error('Minting failed:', error);
  setAlertSeverity('error');
setAlertMessage('Minting failed. Please check the console for details.');
setAlertOpen(true);
} finally {
setLoading(false);
}
};

const handleCloseAlert = () => {
setAlertOpen(false);
};

return (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      backgroundColor: 'background.paper',
      p: 4,
      borderRadius: 20,
      boxShadow: 4,
      maxWidth: 1000,
      margin: '0 auto',
      mt: 6,
    }}
  >
   <Typography
  variant="h2"
  align="center"
  gutterBottom
  sx={{
    fontFamily: 'Montserrat, sans-serif',
    fontWeight: 'bold',
    color: '#f9a828',
    textShadow: '1px 1px 3px rgba(0, 0, 0, 0.3)',
    letterSpacing: '2px',
    marginTop: {xs: '1rem', sm: '2rem', md: '3rem'},
    marginBottom: {xs: '1rem', sm: '2rem', md: '3rem'},
    background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    fontSize: {xs: '3rem', sm: '4rem', md: '5rem'},
  }}
>
  Mint Your Battle Buddy! 
</Typography>


    <Box sx={{ mb: 4, width: '100%', textAlign: 'center' }}>
    </Box>
    <Typography variant="body1" align="center" gutterBottom sx={{ mb: 4 }}>
      <strong>{currentTotalSupply} / {MAX_SUPPLY}</strong> pets minted. Only{' '}
      <strong>{remainingSupply}</strong> pets left!
    </Typography>
    <TextField
      type="number"
      inputProps={{ min: 1, max: MAX_MINT_PER_TRANSACTION }}
      value={amount}
      onChange={handleChange}
      sx={{ mb: 4, width: '100%' }}
      label="How many pets do you want to mint?"
      variant="outlined"
    />
    <Button
      variant="contained"
      color="primary"
      onClick={handleMint}
      disabled={loading || amount > remainingSupply}
      sx={{ width: '100%', mb: 2 }}
    >
      {loading ? (
        <CircularProgress color="secondary" size={24} />
      ) : (
        'Mint Pets'
      )}
    </Button>
    <Snackbar
      open={alertOpen}
      autoHideDuration={6000}
      onClose={handleCloseAlert}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Alert onClose={handleCloseAlert} severity={alertSeverity}>
        {alertMessage}
      </Alert>
    </Snackbar>
  </Box>
);
}

export default Mint;