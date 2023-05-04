import React, { useState, useEffect } from "react";
import Web3 from "web3";
import abi from "../abi/Battle.json";
import EventTicketingABI from '../abi/Tama.json';
import {
  Button,
  Container,
  TextField,
  Typography,
  Box,
  Grid,
  CircularProgress,
  Snackbar,
} from "@mui/material";

const web3 = new Web3(window.ethereum);
const contractAddress = "0xc3e53F4d16Ae77Db1c982e75a937B9f60FE63690";
const contract = new web3.eth.Contract(abi, contractAddress);
const tokenContract = new web3.eth.Contract(EventTicketingABI, '0xE6E340D132b5f46d1e472DebcD681B2aBc16e57E');

function Battle() {
  const [account, setAccount] = useState(null);
  const [attackerTokenId, setAttackerTokenId] = useState("");
  const [defenderTokenId, setDefenderTokenId] = useState("");
  const [playerWins, setPlayerWins] = useState(0);
  const [battleId, setBattleId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [pets, setPets] = useState([]);

  useEffect(() => {
    requestAccount();
    fetchPets();
  }, []);

  async function requestAccount() {
    setLoading(true);
    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      setAccount(accounts[0]);
      fetchPlayerWins(accounts[0]);
    } catch (err) {
      setError("Failed to connect to Ethereum. Please make sure you have a compatible wallet installed and try again.");
    }
    setLoading(false);
  }

  async function fetchPlayerWins(playerAddress) {
    setLoading(true);
    try {
      const wins = await contract.methods.playerWins(playerAddress).call();
      setPlayerWins(wins);
    } catch (err) {
      setError("Failed to fetch player wins. Please try again later.");
    }
    setLoading(false);
  }

  async function fetchPets() {
    setLoading(true);
    try {
      const totalSupply = await tokenContract.methods.totalSupply().call();
      const ownedTokenIds = [];

      for (let i = 1; i <= totalSupply; i++) {
        const owner = await tokenContract.methods.ownerOf(i).call();
        if (owner === account) {
          ownedTokenIds.push(i);
        }
      }

      const pets = [];

      for (const tokenId of ownedTokenIds) {
        const tokenUri = await tokenContract.methods.tokenURI(tokenId).call();
        const response = await fetch(tokenUri);
        const metadata = await response.json();
        const pet = {
          id: tokenId,
          name: metadata.name,
          description: metadata.description,
          image: metadata.image,
        };
        pets.push(pet);
      }

      setPets(pets);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }

  async function createBattle() {
    setLoading(true);
    try {
      await contract.methods
        .createBattle(parseInt(attackerTokenId), parseInt(defenderTokenId))
        .send({ from: account });
      setSuccess("Battle created successfully.");
    }

 catch (err) {
  setError("Failed to create battle. Please make sure you entered valid Token IDs and try again.");
}
setLoading(false);
}

async function handleAttack() {
setLoading(true);
try {
await contract.methods.attack(battleId).send({ from: account });
setSuccess("Action performed successfully.");
} catch (err) {
setError("Failed to perform action. Please try again later.");
}
setLoading(false);
}

async function handleUsePotion() {
setLoading(true);
try {
await contract.methods.usePotion(battleId).send({ from: account });
setSuccess("Action performed successfully.");
} catch (err) {
setError("Failed to perform action. Please try again later.");
}
setLoading(false);
}

async function handleUseShield() {
setLoading(true);
try {
await contract.methods.useShield(battleId).send({ from: account });
setSuccess("Action performed successfully.");
} catch (err) {
setError("Failed to perform action. Please try again later.");
}
setLoading(false);
}

async function handleUsePowerUp() {
setLoading(true);
try {
await contract.methods.usePowerUp(battleId).send({ from: account });
setSuccess("Action performed successfully.");
} catch (err) {
setError("Failed to perform action. Please try again later.");
}
setLoading(false);
}

function handleSnackbarClose() {
setError("");
setSuccess("");
}

function validateTokenId(tokenId) {
if (isNaN(parseInt(tokenId)) || parseInt(tokenId) <= 0) {
setError("Token ID must be a positive number.");
return false;
}
return true;
}

return (
<Container>
<Box sx={{ mt: 4 }}>
<Typography variant="h3" component="h1" gutterBottom>
Pokemon Battle
</Typography>
{account && (
<Typography variant="h5" component="h2" gutterBottom>
Account: {account}
</Typography>
)}
<Typography variant="h5" component="h2" gutterBottom>
Player Wins: {playerWins}
</Typography>
</Box>
<Box sx={{ mt: 4 }}>
<Typography variant="h4" component="h3" gutterBottom>
Your Pets
</Typography>
<Grid container spacing={2}>
{pets.map((pet) => (
<Grid item key={pet.id} xs={12} sm={6} md={4}>
<Box sx={{ border: 1, borderColor: "primary.main", p: 2 }}>
<Typography variant="h6" gutterBottom>
{pet.name}
</Typography>
<Typography variant="body1" gutterBottom>
{pet.description}
</Typography>
<img src={pet.image} alt={pet.name} style={{ maxWidth: "100%" }} />
</Box>
</Grid>
))}
</Grid>
</Box>
<Box component="form" onSubmit={(e) => {
e.preventDefault();
if (validateTokenId(attackerTokenId) && validateTokenId(defenderTokenId)) {
createBattle();
}
}} sx={{ mt: 4 }}>
<Grid container spacing={2}>
<Grid item xs={12} sm={6}>
<TextField
label="Attacker Token ID"
value={attackerTokenId}
onChange={(e) => setAttackerTokenId(e.target.value)}
type="number"
/>
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <TextField
          label="Defender Token ID"
          value={defenderTokenId}
          onChange={(e) => setDefenderTokenId(e.target.value)}
          type="number"
          fullWidth
        />
      </Grid>
      <Grid item xs={12}>
        <Button
          variant="contained"
          color="primary"
          type="submit"
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : "Create Battle"}
        </Button>
      </Grid>
    </Grid>
  </Box>
  <Box sx={{ mt: 4 }}>
    <Typography variant="h4" component="h3" gutterBottom>
      Perform Actions
    </Typography>
    <TextField
      label="Battle ID"
      value={battleId}
      onChange={(e) => setBattleId(e.target.value)}
      type="number"
      fullWidth
      sx={{ mb: 2 }}
    />
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6} md={3}>
        <Button
          variant="contained"
          color="secondary"
          onClick={handleAttack}
          fullWidth
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : "Attack"}
        </Button>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Button
          variant="contained"
          color="secondary"
          onClick={handleUsePotion}
          fullWidth
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : "Use Potion"}
        </Button>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Button
          variant="contained"
          color="secondary"
          onClick={handleUseShield}
          fullWidth
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : "Use Shield"}
        </Button>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Button
          variant="contained"
          color="secondary"
          onClick={handleUsePowerUp}
          fullWidth
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : "Use PowerUp"}
        </Button>
      </Grid>
    </Grid>
  </Box>
  <Snackbar
    open={!!error || !!success}
    autoHideDuration={6000}
    onClose={handleSnackbarClose}
    message={error || success}
  />
</Container>
);
}

export default Battle;