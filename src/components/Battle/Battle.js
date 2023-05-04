import React, { useState, useEffect } from "react";
import Web3 from "web3";
import abi from "../abi/Battle.json";
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
import nftAbi from "../abi/Tama.json";



const web3 = new Web3(window.ethereum);

const contractAddress = "0xc3e53F4d16Ae77Db1c982e75a937B9f60FE63690";
const contract = new web3.eth.Contract(abi, contractAddress);

const nftContractAddress = "0xE6E340D132b5f46d1e472DebcD681B2aBc16e57E";
const nftContract = new web3.eth.Contract(nftAbi, nftContractAddress);

function Battle() {
  const [account, setAccount] = useState(null);
  const [attackerTokenId, setAttackerTokenId] = useState("");
  const [defenderTokenId, setDefenderTokenId] = useState("");
  const [playerWins, setPlayerWins] = useState(0);
  const [battleId, setBattleId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [tokens, setTokens] = useState([]);
  const [search, setSearch] = useState("");
  const [playerItems, setPlayerItems] = useState([]);

  useEffect(() => {
    requestAccount();
    fetchAllTokens();
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
  function filterTokens(tokens) {
    return tokens.filter((token) => {
      const query = search.toLowerCase();
      return (
        token.tokenId.toString().includes(query) ||
        token.name.toLowerCase().includes(query) ||
        token.level.toString().includes(query) ||
        token.element.toLowerCase().includes(query)
      );
    });
  }
  

  const getImageUrl = (level, id) => {
    let imageUrl;
    if (level >= 2) {
      imageUrl = `https://bafybeidm7jfef6v6l7dutjat52fl3ynv6jrrovhfgfrzipvxmbdnaqsnhm.ipfs.nftstorage.link/${id}.png`;
    } else {
      imageUrl = `https://bafybeih6ocvp4vmuibfe2xvuvjjujdi5fi7bb4aylvvakrvejztmuwx7ee.ipfs.nftstorage.link/${id}.png`;
    }
    return imageUrl;
  };


  async function buyShield() {
    const cost = 100;
    const effectValue = 20;
    const useCount = 1;
    try {
      await contract.methods.buyShield().send({ from: account, value: cost });
      playerItems.push({
        itemType: "Shield",
        effectValue,
        isActive: false,
        useCount,
      });
      setSuccess("Shield bought successfully.");
    } catch (err) {
      setError("Failed to buy Shield. Please try again later.");
    }
  }
  
  async function buyPotion() {
    const cost = 50;
    const effectValue = 50;
    const useCount = 1;
    try {
      await contract.methods.buyPotion().send({ from: account, value: cost });
      playerItems.push({
        itemType: "Potion",
        effectValue,
        isActive: false,
        useCount,
      });
      setSuccess("Potion bought successfully.");
    } catch (err) {
      setError("Failed to buy Potion. Please try again later.");
    }
  }
  
  async function buyPowerUp() {
    const cost = 150;
    const effectValue = 30;
    const useCount = 1;
    try {
      await contract.methods.buyPowerUp().send({ from: account, value: cost });
      playerItems.push({
        itemType: "PowerUp",
        effectValue,
        isActive: false,
        useCount,
      });
      setSuccess("PowerUp bought successfully.");
    } catch (err) {
      setError("Failed to buy PowerUp. Please try again later.");
    }
  }
  
  async function fetchAllTokens() {
    setLoading(true);
    try {
      const totalSupply = await nftContract.methods.totalSupply().call();
      const tokens = [];
      for (let tokenId = 1; tokenId <= totalSupply; tokenId++) {
        const petDetails = await nftContract.methods.getPetDetails(tokenId).call();
        tokens.push({ tokenId, ...petDetails });
      }
      setTokens(tokens);
    } catch (err) {
      setError("Failed to fetch tokens. Please try again later.");
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
    } catch (err) {
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
    <div style={{ position: 'relative', backgroundColor: 'rgba(255, 255, 255, 0.5)', zIndex: 1 }}>

<Container>
<Box sx={{ mt: 4 }}>
<Typography 
  variant="h3" 
  component="h1" 
  align="center"
  style={{ 
    color: "#ffffff", 
    fontWeight: "bold",
    textShadow: "2px 2px #000000" 
  }}
>
  Buddy Battles
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
<Box component="form" onSubmit={(e) => {
e.preventDefault();
if (validateTokenId(attackerTokenId) && validateTokenId(defenderTokenId)) {
createBattle();
}
}} sx={{ mt: 2 }}>
<Grid container spacing={2}>
<Grid item xs={12} sm={6}>
<TextField
label="Attacker Token ID"
value={attackerTokenId}
onChange={(e) => setAttackerTokenId(e.target.value)}
type="number"
fullWidth
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
  <Box sx={{ mt: 4 }}>
  <Typography variant="h4" component="h3" gutterBottom>
    Buy Items
  </Typography>
  <Grid container spacing={2}>
    <Grid item xs={12} sm={4}>
      <Button
        variant="contained"
        color="primary"
        onClick={() => buyShield()}
        fullWidth
      >
        Buy Shield (Cost: 100)
      </Button>
    </Grid>
    <Grid item xs={12} sm={4}>
      <Button
        variant="contained"
        color="primary"
        onClick={() => buyPotion()}
        fullWidth
      >
        Buy Potion (Cost: 50)
      </Button>
    </Grid>
    <Grid item xs={12} sm={4}>
      <Button
        variant="contained"
        color="primary"
        onClick={() => buyPowerUp()}
        fullWidth
      >
        Buy PowerUp (Cost: 150)
      </Button>
    </Grid>
  </Grid>
</Box>
  <Box sx={{ mt: 4 }}>
      <Typography variant="h4" component="h3" gutterBottom>
        Scout Your Battle
      </Typography>
      <Box sx={{ mt: 2 }}>
        <TextField
          label="Search Tokens"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          fullWidth
        />
      </Box>
      <Grid container spacing={2}>
        {filterTokens(tokens).map((token) =>  (
      <Grid item xs={12} sm={6} md={4} key={token.tokenId}>
        <Box>
          <img src={getImageUrl(token.level, token.id)} alt={`Token ${token.tokenId}`} />
          <Typography variant="body1" component="p">
            Token ID: {token.tokenId}
          </Typography>
          <Typography variant="body1" component="p">
            Name: {token.name}
          </Typography>
          <Typography variant="body1" component="p">
            Birth Time: {token.birthTime}
          </Typography>
          <Typography variant="body1" component="p">
            Last Interaction: {token.lastInteraction}
          </Typography>
          <Typography variant="body1" component="p">
            Level: {token.level}
          </Typography>
          <Typography variant="body1" component="p">
            Happiness: {token.happiness}
          </Typography>
          <Typography variant="body1" component="p">
            Hunger: {token.hunger}
          </Typography>
          <Typography variant="body1" component="p">
            XP: {token.xp}
          </Typography>
          <Typography variant="body1" component="p">
            Element: {token.element}
          </Typography>
          <Typography variant="body1" component="p">
            HP: {token.hp}
          </Typography>
          <Typography variant="body1" component="p">
            Power: {token.power}
          </Typography>
        </Box>
      </Grid>
    ))}
  </Grid>
</Box>

  <Snackbar
    open={!!error || !!success}
    autoHideDuration={6000}
    onClose={handleSnackbarClose}
    message={error || success}
  />
</Container>
</div>
);
}

export default Battle;