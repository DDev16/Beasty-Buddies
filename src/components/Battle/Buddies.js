import React, { useState, useEffect } from "react";
import Web3 from "web3";
import nftAbi from "../abi/Tama.json";
import battleAbi from "../abi/Battle.json";
import { Box, Typography, TextField, Grid, CircularProgress, Button, List, ListItem, ListItemText } from "@mui/material";
import { styled } from '@mui/system';

const web3 = new Web3(window.ethereum);
const nftContractAddress = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9";
const nftContract = new web3.eth.Contract(nftAbi, nftContractAddress);
const battleContractAddress = "0x99bbA657f2BbC93c02D617f8bA121cB8Fc104Acf";
const battleContract = new web3.eth.Contract(battleAbi, battleContractAddress);

const Loading = styled(CircularProgress)(({ theme }) => ({
    position: 'fixed',
    top: '50%',
    left: '50%',
}));

function Buddies() {
    const [search, setSearch] = useState("");
    const [account, setAccount] = useState(null);
    const [tokens, setTokens] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [attackerTokenId, setAttackerTokenId] = useState(null);
    const [ownedTokens, setOwnedTokens] = useState([]);
    const [battles, setBattles] = useState([]);

    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                await requestAccount();
                await fetchData();
                await fetchAllTokens();
                const intervalId = setInterval(fetchData, 10000);
                return () => clearInterval(intervalId);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        })();
    }, [account]); // add account to the dependency array
    
    async function fetchData() {
        setLoading(true);
        try {
            await fetchOwnedTokens();
        } catch (err) {
            setError(`Failed to fetch data. Error: ${err.message}`);
        }
        setLoading(false);
    }
    
    async function fetchOwnedTokens() {
        if(account) {
            const totalSupply = await nftContract.methods.totalSupply().call();
            const ownedTokens = [];
            for (let tokenId = 1; tokenId <= totalSupply; tokenId++) {
                const owner = await nftContract.methods.ownerOf(tokenId).call();
                if (owner.toLowerCase() === account.toLowerCase()) {
                    const tokenDetails = await nftContract.methods.getPetDetails(tokenId).call();
                    ownedTokens.push({ tokenId, ...tokenDetails });
                }
            }
            setOwnedTokens(ownedTokens);
        } else {
            setError('Account not connected');
        }
    }
    

    useEffect(() => {
        if (window.ethereum) {
            window.ethereum.on('accountsChanged', function (accounts) {
                setAccount(accounts[0]);
                fetchData();
            });
        }
    }, []);
    
    
    async function fetchAllTokens() {
        const totalSupply = await nftContract.methods.totalSupply().call();
        const tokens = [];
        for (let tokenId = 1; tokenId <= totalSupply; tokenId++) {
            const petDetails = await nftContract.methods.getPetDetails(tokenId).call();
            tokens.push({ tokenId, ...petDetails });
        }
        setTokens(tokens);
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



    
    async function requestAccount() {
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        setAccount(accounts[0]);
    }


    const createBattle = async (defenderTokenId) => {
        if (!attackerTokenId) {
            setError('Please select an attacker token first');
            return;
        }
        try {
            const tx = await battleContract.methods.createBattle(attackerTokenId, defenderTokenId).send({ from: account });
            const battleId = tx.events.NewBattle.returnValues.battleId;
            console.log(`Battle created with ID: ${battleId} between tokens ${attackerTokenId} and ${defenderTokenId}`);
            setBattles([...battles, {battleId, attacker: attackerTokenId, defender: defenderTokenId}]);
        } catch (error) {
            console.error(error);
            setError(`Battle creation failed: ${error.message}`);        }
    };
    

    const handleSelectAttacker = (tokenId) => {
        setAttackerTokenId(tokenId);
      };

    return (
        <Box sx={{ mt: 4, backgroundColor: '#00000', padding: 4, borderRadius: 2, boxShadow: 1 }}>
          <Typography variant="h3" component="h1" backgroundColor='#fafafa' gutterBottom align="center" fontWeight="bold" borderRadius="10px" color="primary">
            🕵️‍♂️ Scout Your Battle Opponent 🕵️‍♀️
          </Typography>
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', marginBottom: 3, borderRadius: 2, padding: 1 }}>
            <TextField
              variant="outlined"
              label="🔍 Search Tokens"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ width: '60%', minWidth: '300px', backgroundColor: '#f0f0f0', borderRadius: 2 }}
            />
          </Box>
          <Typography variant="h4" component="h2" color="primary" mt={4}>
        Your Tokens
      </Typography>
      <List>
    {ownedTokens.map((token) => (
        <ListItem
            key={token.tokenId}
            disablePadding
            sx={{ display: 'flex', justifyContent: 'space-between' }}
        >
            <ListItemText primary={`Token ID: ${token.tokenId}`} />
            {battles.filter(battle => battle.attacker === token.tokenId || battle.defender === token.tokenId).map(battle => (
                <ListItemText primary={`Battle ID: ${battle.battleId}`} />
            ))}
            <Button
                variant="contained"
                color="primary"
                disabled={attackerTokenId === token.tokenId}
                onClick={() => handleSelectAttacker(token.tokenId)}
            >
                Select Attacker
            </Button>
        </ListItem>
    ))}
</List>

          <Typography variant="h4" component="h2" color="primary" mt={4}>
            All Tokens
          </Typography>
          <Grid container spacing={3}>
            {tokens.map((token) => (
              <Grid item xs={12} sm={6} md={4} key={token.tokenId}>
                <Box sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  backgroundColor: 'background.paper',
                  boxShadow: 2,
                  borderRadius: 2,
                  padding: 2,
                  margin: 1,
                }}>
                  <img
                    src={getImageUrl(token.level, token.id)}
                    alt={'Token ${token.tokenId}'}
                    style={{ maxWidth: '100%', height: 'auto', objectFit: 'contain', marginBottom: 2, borderRadius: 2 }}
                  />
                  <Typography variant="subtitle1" component="p" fontWeight="bold" color="text.primary">
                    🆔 Token ID: {token.tokenId}
                  </Typography>
                  <Typography variant="body1" component="p" color="text.secondary">
                    📛 Name: {token.name}
                  </Typography>
                  <Typography variant="body1" component="p" color="text.secondary">
                    🎂 Birth Time: {token.birthTime}
                  </Typography>
                  <Typography variant="body1" component="p" color="text.secondary">
                    🕒 Last Interaction: {token.lastInteraction}
                  </Typography>
                  <Typography variant="body1" component="p" color="text.secondary">
                    📊 Level: {token.level}
                  </Typography>
                  <Typography variant="body1" component="p" color="text.secondary">
                    😄 Happiness: {token.happiness}
                  </Typography>
                  <Typography variant="body1" component="p" color="text.secondary">
                    🍔 Hunger: {token.hunger}
              </Typography>
              <Typography variant="body1" component="p" color="text.secondary">
                🌟 XP: {token.xp}
              </Typography>
              <Typography variant="body1" component="p" color="text.secondary">
                🌪️ Element: {token.element}
              </Typography>
              <Typography variant="body1" component="p" color="text.secondary">
                ❤️ HP: {token.hp}
              </Typography>
              <Typography variant="body1" component="p" color="text.secondary">
                💪 Power: {token.power}
              </Typography>
              <Button
                variant="contained"
                color="secondary"
                onClick={() => createBattle(token.tokenId)}
                sx={{ mt: 1 }}
              >
                Battle
              </Button>
            </Box>
          </Grid>
        ))}
      </Grid>
      </Box>
      );
      }
      
      export default Buddies;