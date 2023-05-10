import React, { useState, useEffect } from "react";
import Web3 from "web3";
import nftAbi from "../abi/Tama.json";
import { Box, Typography, TextField, Grid, Card, CardContent, CardMedia, CircularProgress } from "@mui/material";
import { styled } from '@mui/system';

const web3 = new Web3(window.ethereum);
const nftContractAddress = "0x2910E325cf29dd912E3476B61ef12F49cb931096";
const nftContract = new web3.eth.Contract(nftAbi, nftContractAddress);

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

    useEffect(() => {
        requestAccount();
        fetchAllTokens();
    }, []);


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
        setLoading(true);
        try {
            const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
            setAccount(accounts[0]);
        } catch (err) {
            setError("Failed to connect to Ethereum. Please make sure you have a compatible wallet installed and try again.");
        }
        setLoading(false);
    }


    return (
        <Box sx={{ mt: 4, backgroundColor: '#00000', padding: 4, borderRadius: 2, boxShadow: 1 }}>
<Typography variant="h3" component="h1" backgroundColor='#fafafa' gutterBottom align="center" fontWeight="bold" borderRadius= "10px"color="primary">
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
<Grid container spacing={3}>
{filterTokens(tokens).map((token) => (
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
</Box>
</Grid>
))}
</Grid>
</Box> 
    );
}

export default Buddies;