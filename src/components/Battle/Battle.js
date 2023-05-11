import React, { useState, useEffect} from "react";
import Web3 from "web3";
import abi from "../abi/Battle.json";
import {
    Box,
    CircularProgress,
    Container,
    Grid,
    Snackbar,
    TextField,
    Typography,
    useTheme,
    Button,

} from '@mui/material';
// import LeaderBoard from '../leaderboard/leaderboard.js'
import { Root, Title, ActionButton } from '../Styled/StyledComponents.js';
import '../Battle/Battle.css'




const web3 = new Web3(window.ethereum);

const contractAddress = "0x8f86403A4DE0BB5791fa46B8e795C547942fE4Cf";
const contract = new web3.eth.Contract(abi, contractAddress);



function Battle() {
    const [account, setAccount] = useState(null);
    const [attackerTokenId, setAttackerTokenId] = useState("");
    const [defenderTokenId, setDefenderTokenId] = useState("");
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
    const theme = useTheme(); // add this line to access the theme object
    const [log, setLog] = useState([]);
    const [userTokenId, setUserTokenId] = useState("");
    const [isConnected, setIsConnected] = useState(false);


    useEffect(() => {
        if (contract) {
            contract.events.NewBattle({}, (error, event) => {
                if (error) {
                    console.error('Error on NewBattle event', error);
                } else {
                    if (event.returnValues.defenderTokenId === userTokenId) {
                        alert(`You are now in a battle! Battle ID: ${event.returnValues.battleId}`);
                    }
                }
            });
        }
    }, [contract, userTokenId]);
    
    useEffect(() => {
        requestAccount();
    }, []);

    useEffect(() => {
        fetchImages();
    }, [attackerTokenId, defenderTokenId]);

   

    

    contract.events.BattleEnded({}, (error, event) => {
        if (error) {
            console.error(error);
        } else {
            setLog([...log, `Battle ${event.returnValues.battleId} ended. Winner: ${event.returnValues.winnerTokenId}`]);
        }
    });
    
    contract.events.CriticalHit({}, (error, event) => {
        if (error) {
            console.error(error);
        } else {
            setLog([...log, `Critical hit in battle ${event.returnValues.battleId}. Attacker: ${event.returnValues.attackerTokenId}`]);
        }
    });
    
    contract.events.CriticalMiss({}, (error, event) => {
        if (error) {
            console.error(error);
        } else {
            setLog([...log, `Critical miss in battle ${event.returnValues.battleId}. Attacker: ${event.returnValues.attackerTokenId}`]);
        }
    });
    
    contract.events.ItemUsed({}, (error, event) => {
        if (error) {
            console.error(error);
        } else {
            setLog([...log, `Item used in battle ${event.returnValues.battleId}. Type: ${event.returnValues.itemType}. User: ${event.returnValues.user}`]);
        }
    });
    

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
            setIsConnected(true);
        } catch (err) {
            setError("Failed to connect to Ethereum. Please make sure you have a compatible wallet installed and try again.");
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

        if (defenderTokenId === userTokenId) {
            alert(`You are now in a battle! Battle ID: ${battleId}`);
          }

        setLoading(false);
        setBattleLog([...battleLog, `Battle Created By ( ${attackerTokenId})!`]);
        
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
    {isConnected ? (
        <Typography variant="h6">Connected: {account}</Typography>
    ) : (
        <Button 
    variant="contained" 
    color="primary" 
    onClick={requestAccount}
    sx={{ 
        mt: 4, 
        mb: 2, 
        px: 4, 
        py: 2, 
        fontWeight: 'bold', 
        borderRadius: 20, 
        textTransform: 'none' 
    }}
>
    {loading ? <CircularProgress size={24} /> : "Connect"}
</Button>
    )}
</Box>

                <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Title className= "title" variant="h1" component="h1" align="center">
                        Buddy Battles
                    </Title>
                    {/* <LeaderBoard/> */}
                    <Box sx={{ mt: 4 }}>
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
        {log.map((message, index) => (
            <Typography key={index} variant="body1">
                {message}
            </Typography>
        ))}
    </Box>
</Box>

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
    display: 'flex',
    flexDirection: ['column', 'row', 'row'],
    justifyContent: 'center',
    alignItems: 'center',
    gap: [3, 4, 4],
    position: 'relative',
    maxWidth: '100%',
  }}
>
  {attackerImage && (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        mb: [3, 0, 0],
      }}
    >
      <img
        src={attackerImage}
        alt={`Image of the attacking token with ID ${attackerTokenId}`}
        style={{
          width: "300px", 
          height: '350px',
          borderRadius: '50%',
          objectFit: 'cover',
          border: `4px solid ${theme.palette.error.main}`,
          transition: 'border-color 0.3s ease-in-out',
        }}
      />
      <Typography
        variant={['subtitle2', 'h6', 'h6']}
        component="h4"
        sx={{ mt: 1 }}
      >
        Attacker
      </Typography>
      <Typography
        variant={['body2', 'body1', 'body1']}
        component="p"
        sx={{ fontFamily: 'monospace' }}
      >
        HP: {attackerHp}
      </Typography>
    </Box>
  )}
  <Typography
    variant={['h4', 'h2', 'h2']}
    component="h3"
    gutterBottom
    sx={{
      background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
      borderRadius: 3,
      border: 0,
      color: 'white',
      padding: ['10px 20px', '0 30px', '0 30px'],
      boxShadow: '0 3px 5px 2px rgba(255, 105, 135, .3)',
      textShadow: '2px 2px #333',
      fontSize: ['3rem', '4rem', '5rem'],
      minWidth: '100px',
      textAlign: 'center',
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
        mt: [3, 0, 0],
      }}
    >
      <img
        src={defenderImage}
        alt={`Image of the defending token with ID ${defenderTokenId}`}
        style={{
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          border: `4px solid ${theme.palette.error.main}`,
          objectFit: 'cover',
transition: 'border-color 0.3s ease-in-out',
}}
/>
<Typography
variant={['subtitle2', 'h6', 'h6']}
component="h4"
sx={{ mt: 1 }}
>
Defender
</Typography>
<Typography
variant={['body2', 'body1', 'body1']}
component="p"
sx={{ fontFamily: 'monospace' }}
>
HP: {defenderHp}
</Typography>
</Box>
)}
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