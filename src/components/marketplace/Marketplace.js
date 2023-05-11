import React, { useState, useEffect } from "react";
import Web3 from "web3";
import abi from "../abi/Battle.json";
import {
    Box,
    Button,
    Card,
    CardContent,
    CardMedia,
    CircularProgress,
    Container,
    Grid,
    Snackbar,
    Typography,
} from '@mui/material';
import { styled } from '@mui/system';
import { alpha } from '@mui/material/styles';
import MuiAlert from '@mui/material/Alert';
import ShieldImage from '../Assets/shield.png';
import PotionImage from '../Assets/potion.png';
import PowerUpImage from '../Assets/powerUp.png';
import { wordWrap } from "polished";

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


let web3;
let contract;

if (window.ethereum) {
    web3 = new Web3(window.ethereum);
    window.ethereum.enable();
} else if (window.web3) {
    web3 = new Web3(window.web3.currentProvider);
} else {
    window.alert("Non-Ethereum browser detected. Consider trying MetaMask!");
}

const ItemCard = styled(Card)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing(3),
    backgroundColor: alpha(theme.palette.background.default, 0.7),
    boxShadow: theme.shadows[5],
}));


const ItemImage = styled(CardMedia)(({ theme }) => ({
    height: '200px',  // Adjust this to your needs
    objectFit: 'contain', // This makes sure your image fits into the container while maintaining aspect ratio
    marginBottom: theme.spacing(2),
}));

const ITEM_DATA = {
    Shield: { 
        description: 'Increase your defense.', 
        image: ShieldImage, 
    },
    Potion: { 
        description: 'Regenerate your health.', 
        image: PotionImage, 
    },
    PowerUp: { 
        description: 'Boost your power.', 
        image: PowerUpImage, 
    },
};


const contractAddress = "0x8f86403A4DE0BB5791fa46B8e795C547942fE4Cf";
contract = new web3.eth.Contract(abi, contractAddress);

function Marketplace() {
    const [account, setAccount] = useState("");
    const [loading, setLoading] = useState(false);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState("success");

    useEffect(() => {
        if (window.ethereum) {
            window.ethereum.enable().then((accounts) => {
                setAccount(accounts[0]);
            });
        }
    }, []);

    const buyItem = async (itemType) => {
        setLoading(true);
        try {
            await contract.methods[`buy${itemType}`]().send({ from: account });
            setSnackbarMessage(`Successfully bought ${itemType}!`);
            setSnackbarSeverity("success");
        } catch (error) {
            setSnackbarMessage(`Error buying ${itemType}: ${error.message}`);
            setSnackbarSeverity("error");
        } finally {
            setLoading(false);
            setSnackbarOpen(true);
        }
    };

    const handleSnackbarClose = (event, reason) => {
        if (reason === 'clickaway') {
          return;
        }
        setSnackbarOpen(false);
    };

    return (
        <Container>
            <Typography 
    variant="h3" 
    component="h3" 
    gutterBottom 
    align="center"
    style={{
        color: '#FFFFFF', // Bright Orange color
        textShadow: '8px 2px 8px #000000', // Black text shadow for 3D effect
        fontFamily: 'Arial, sans-serif', // Change the font if needed
        fontWeight: 'bold', // Make the text bold
        letterSpacing: '2px', // Increase spacing between letters
        textTransform: 'uppercase', // Make text uppercase for more impact
        marginBottom: '20px', // Increase bottom margin
        backgroundColor: '#0000', // A subtle background color
        borderRadius: '5px', // Rounded corners
        padding: '10px' ,// Padding around the text
        wordWrap:'wordWrap'
    }}
>
    Marketplace
</Typography>

            <Grid container spacing={3}>
                {Object.keys(ITEM_DATA).map((itemType) => (
                    <Grid item xs={12} sm={6} md={4} key={itemType}>
                        <ItemCard>
                        <img src={ITEM_DATA[itemType].image} alt={itemType} style={{width: '100%', objectFit: 'contain'}} />

                            <CardContent>
                                <Typography variant="h5" component="div" gutterBottom>
                                    {itemType}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" paragraph>
                                    {ITEM_DATA[itemType].description}
                                </Typography>
                                <ActionButton disabled={loading} onClick={() => buyItem(itemType)}>
                                    Buy {itemType}
                                </ActionButton>
                            </CardContent>
                        </ItemCard>
                    </Grid>
                ))}
            </Grid>
            {loading && <CircularProgress />}
            <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
                <MuiAlert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
                    {snackbarMessage}
                </MuiAlert>
            </Snackbar>
        </Container>
    );
}

export default Marketplace;
