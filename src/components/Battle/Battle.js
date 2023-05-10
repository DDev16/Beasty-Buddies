import React, { useState, useEffect } from "react";
import Web3 from "web3";
import abi from "../abi/Battle.json";
import {
    Box,
    Button,
    CircularProgress,
    Container,
    Grid,
    Snackbar,
    TextField,
    Typography,
} from '@mui/material';
import { styled } from '@mui/system';
import nftAbi from "../abi/Tama.json";
import { alpha } from '@mui/material/styles';
// import LeaderBoard from '../leaderboard/leaderboard.js'


const Root = styled('div')(({ theme }) => ({
    position: 'relative',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    zIndex: 1,
    padding: theme.spacing(4),
    borderRadius: theme.shape.borderRadius * 2,
    boxShadow: `0px 4px 6px ${alpha(theme.palette.primary.dark, 0.2)}, 0px 1px 1px ${alpha(theme.palette.primary.dark, 0.14)}, 0px 2px 1px -1px ${alpha(theme.palette.primary.dark, 0.12)}`,
    backdropFilter: 'blur(4px)',
}));

const Title = styled(Typography)(({ theme }) => ({
    color: '#ffffff',
    fontWeight: 'bold',
    textShadow: '2px 2px #000000',
    marginBottom: theme.spacing(2),
    textTransform: 'uppercase',
    letterSpacing: '2px',
    fontSize: '2rem',
    lineHeight: 1.2,
    [theme.breakpoints.down('sm')]: {
        fontSize: '1.5rem',
    },
}));

const ActionButton = styled(Button)(({ theme }) => ({
  backgroundColor: theme.palette.secondary.main,
  color: theme.palette.common.white,
  fontWeight: theme.typography.fontWeightBold,
  textTransform: 'uppercase',
  letterSpacing: '1px',
  fontSize: '1rem',
  padding: theme.spacing(1, 3),
  borderRadius: theme.shape.borderRadius * 2,
  transition: 'all 0.3s',
  boxShadow: theme.shadows[3],

  '&:hover': {
    backgroundColor: theme.palette.secondary.dark,
    boxShadow: `0px 2px 4px -1px ${alpha(theme.palette.secondary.dark, 0.2)}, 0px 4px 5px 0px ${alpha(theme.palette.secondary.dark, 0.14)}, 0px 1px 10px 0px ${alpha(theme.palette.secondary.dark, 0.12)}`,
  },

  '&:disabled': {
    backgroundColor: alpha(theme.palette.secondary.main, 0.4),
  },

  '&:focus-visible': {
    outline: `2px solid ${theme.palette.secondary.light}`,
    outlineOffset: '2px',
  },

  '&:active': {
    backgroundColor: theme.palette.secondary.dark,
    boxShadow: `0px 2px 4px -1px ${alpha(theme.palette.secondary.dark, 0.2)}, 0px 4px 5px 0px ${alpha(theme.palette.secondary.dark, 0.14)}, 0px 1px 10px 0px ${alpha(theme.palette.secondary.dark, 0.12)}`,
  },
}));



const web3 = new Web3(window.ethereum);

const contractAddress = "0xA7918D253764E42d60C3ce2010a34d5a1e7C1398";
const contract = new web3.eth.Contract(abi, contractAddress);

const nftContractAddress = "0x2910E325cf29dd912E3476B61ef12F49cb931096";
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
    const [attackerImage, setAttackerImage] = useState('');
    const [defenderImage, setDefenderImage] = useState('');
    const [attackerHp, setAttackerHp] = useState(0);
    const [defenderHp, setDefenderHp] = useState(0);
    const [battleLog, setBattleLog] = useState([]);

    useEffect(() => {
        requestAccount();
        fetchAllTokens();
    }, []);

    useEffect(() => {
        fetchImages();
        fetchHp();
    }, [attackerTokenId, defenderTokenId]);

    const fetchHp = async () => {
        if (attackerTokenId && defenderTokenId) {
            try {
                const attackerHp = await nftContract.methods.getHp(attackerTokenId).call();
                const defenderHp = await nftContract.methods.getHp(defenderTokenId).call();
                setAttackerHp(attackerHp);
                setDefenderHp(defenderHp);
            } catch (err) {
                console.error("Failed to fetch HP for attacker and defender", err);
            }
        }
    };

    const fetchImages = async () => {
        if (attackerTokenId && defenderTokenId) {
            setAttackerImage(`https://bafybeidm7jfef6v6l7dutjat52fl3ynv6jrrovhfgfrzipvxmbdnaqsnhm.ipfs.nftstorage.link/${attackerTokenId}.png`);
            setDefenderImage(`https://bafybeidm7jfef6v6l7dutjat52fl3ynv6jrrovhfgfrzipvxmbdnaqsnhm.ipfs.nftstorage.link/${defenderTokenId}.png`);
        }
    };


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
        setBattleLog([...battleLog, `Token ID ( ${attackerTokenId}) attacked!`]);

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
        setBattleLog([...battleLog, `Token ID ( ${attackerTokenId}) used potion!`]);

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
        setBattleLog([...battleLog, `Token ID ( ${attackerTokenId}) used potion!`]);

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
        <Root>
            <Container>
                <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Title variant="h3" component="h1" align="center">
                        Buddy Battles
                    </Title>
                    {/* <LeaderBoard/> */}
                    <Box sx={{ mt: 4 }}>
    <Typography variant="h4" component="h3" gutterBottom>
        Battle Log
    </Typography>
    <Box
        sx={{
            maxHeight: '200px',
            overflowY: 'auto',
            backgroundColor: '#f0f0f0',
            padding: 2,
            borderRadius: 2,
            boxShadow: 1
        }}
    >
        {battleLog.map((event, index) => (
            <Typography key={index} variant="body1">
                {event}
            </Typography>
        ))}
    </Box>
</Box>
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
                                variant="outlined"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Defender Token ID"
                                value={defenderTokenId}
                                onChange={(e) => setDefenderTokenId(e.target.value)}
                                type="number"
                                fullWidth
                                variant="outlined"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <ActionButton
                                variant="contained"
                                color="primary"
                                type="submit"
                                disabled={loading}
                                fullWidth
                            >
                                {loading ? <CircularProgress size={24} /> : "Create Battle"}
                            </ActionButton>
                            <Box
                                sx={{
                                    mt: 4,
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    flexDirection: 'column',
                                    gap: 2,
                                }}
                            >
                                <Box
                                    sx={{
                                        mt: 4,
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        flexDirection: 'column',
                                        gap: 2,
                                    }}
                                >
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            gap: 4,
                                            position: 'relative',
                                        }}
                                    >
                                        {attackerImage && (
                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'center',
                                                }}
                                            >
                                                <img
                                                    src={attackerImage}
                                                    alt={`Attacker Token ID: ${attackerTokenId}`}
                                                    style={{
                                                        width: '350px',
                                                        height: '350px',
                                                        borderRadius: '50%',
                                                        border: '4px solid #4caf50',
                                                    }}
                                                />
                                                <Typography variant="h6" component="h4">
                                                    Attacker
                                                </Typography>
                                                <Typography variant="body1" component="p">
                                                    HP: {attackerHp}
                                                </Typography>
                                            </Box>
                                        )}
                                        <Typography
                                            variant="h2"
                                            component="h3"
                                            gutterBottom
                                            sx={{
                                                background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
                                                borderRadius: 3,
                                                border: 0,
                                                color: 'white',
                                                padding: '0 30px',
                                                boxShadow: '0 3px 5px 2px rgba(255, 105, 135, .3)',
                                            }}
                                        >
                                            VS
                                        </Typography>
                                        {defenderImage && (
                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'center',
                                                }}
                                            >
                                                <img
                                                    src={defenderImage}
                                                    alt={`Defender Token ID: ${defenderTokenId}`}
                                                    style={{
                                                        width: '350px',
                                                        height: '350px',
                                                        borderRadius: '50%',
                                                        border: '4px solid #f44336',
                                                    }}
                                                />
                                                <Typography variant="h6" component="h4">
                                                    Defender
                                                </Typography>
                                                <Typography variant="body1" component="p">
                                                    HP: {defenderHp}
                                                </Typography>
                                            </Box>
                                        )}
                                    </Box>
                                </Box>
                            </Box>
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
                        variant="outlined"
                        sx={{ mb: 2 }}
                    />
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6} md={3}>
                            <ActionButton
                                variant="contained"
                                color="secondary"
                                onClick={handleAttack}
                                fullWidth
                                disabled={loading}
                            >
                                {loading ? <CircularProgress size={24} /> : "Attack"}
                            </ActionButton>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <ActionButton
                                variant="contained"
                                color="secondary"
                                onClick={handleUsePotion}
                                fullWidth
                                disabled={loading}
                            >
                                {loading ? <CircularProgress size={24} /> : "Use Potion"}
                            </ActionButton>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <ActionButton
                                variant="contained"
                                color="secondary"
                                onClick={handleUseShield}
                                fullWidth
                                disabled={loading}
                            >
                                {loading ? <CircularProgress size={24} /> : "Use Shield"}
                            </ActionButton>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <ActionButton
                                variant="contained"
                                color="secondary"
                                onClick={handleUsePowerUp}
                                fullWidth
                                disabled={loading}
                            >
                                {loading ? <CircularProgress size={24} /> : "Use PowerUp"}
                            </ActionButton>
                        </Grid>
                    </Grid>
                </Box>
                {/* <Box sx={{ mt: 4 }}>
                    <Typography variant="h4" component="h3" gutterBottom>
                        Buy Items
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={4}>
                            <ActionButton
                                variant="contained"
                                color="primary"
                                onClick={() => buyShield()}
                                fullWidth
                            >
                                Buy Shield (Cost: 100)
                            </ActionButton>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <ActionButton
                                variant="contained"
                                color="primary"
                                onClick={() => buyPotion()}
                                fullWidth
                            >
                                Buy Potion (Cost: 50)
                            </ActionButton>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <ActionButton
                                variant="contained"
                                color="primary"
                                onClick={() => buyPowerUp()}
                                fullWidth
                            >
                                Buy PowerUp (Cost: 150)
                            </ActionButton>
                        </Grid>
                    </Grid>
                </Box> */}
                <Snackbar
                    open={!!error || !!success}
                    autoHideDuration={6000}
                    onClose={handleSnackbarClose}
                    message={error || success}
                />
            </Container>
        </Root>
    );
}

export default Battle;