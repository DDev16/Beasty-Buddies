import React, { useState, useEffect } from "react";
import Web3 from "web3";
import abi from "../abi/Battle.json";
import {
    Box,
    Container,
    Grid,
    Typography,
} from '@mui/material';
import { styled } from '@mui/system';

// Custom component to handle long addresses
const Address = styled(Typography)(({ theme }) => ({
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
}));

const Score = styled(Typography)(({ theme }) => ({
    color: theme.palette.primary.main,
    fontWeight: 'bold',
}));

const Leaderboard = () => {
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadBlockchainData = async () => {
            const web3 = new Web3(Web3.givenProvider || "http://localhost:8545"); // Use givenProvider if exists otherwise localhost
            const accounts = await web3.eth.getAccounts();
            const battleContract = new web3.eth.Contract(abi, "0x70e0bA845a1A0F2DA3359C97E0285013525FFC49"); // Replace "YourContractAddress" with your deployed contract address

            let leaderboard = [];
            for (let i = 0; i < accounts.length; i++) {
                const score = await battleContract.methods.getScore(accounts[i]).call();
                leaderboard.push({ address: accounts[i], score });
            }

            leaderboard.sort((a, b) => b.score - a.score);
            setLeaderboard(leaderboard);
            setLoading(false);
        };

        loadBlockchainData();
    }, []);

    return (
        <Container>
            <Typography variant="h4">Leaderboard</Typography>
            {loading ? (
                <p>Loading...</p>
            ) : (
                <Box>
                    <Grid container spacing={2}>
                        {leaderboard.map((player, index) => (
                            <Grid item xs={12} sm={6} md={4} key={index}>
                                <Address variant="h6">{index + 1}. {player.address}</Address>
                                <Score variant="body1">Score: {player.score}</Score>
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            )}
        </Container>
    );
};

export default Leaderboard;
