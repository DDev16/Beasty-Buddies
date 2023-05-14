import React, { useState, useEffect } from 'react';
import { web3 } from '../Web3.js';
import EventTicketingABI from '../abi/Tama.json';
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Container,
  Grid,
  Typography,
  TextField,
} from '@mui/material';
import { styled } from '@mui/system';
import '../Pet/PetDetails.css';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EqualizerIcon from '@mui/icons-material/Equalizer';
import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAlt';
import MoodIcon from '@mui/icons-material/Mood';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import FastfoodIcon from '@mui/icons-material/Fastfood';
import PetsIcon from '@mui/icons-material/Pets';
// Import IconButton and alternative icons
import SportsEsportsIcon from '@mui/icons-material/SportsEsports'; // Replace PlayIcon
import EmojiPeopleIcon from '@mui/icons-material/EmojiPeople'; // Replace InteractIcon
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh'; // Replace Evolv
import EditIcon from '@mui/icons-material/Edit';



const StyledCard = styled(Card)(({ theme }) => ({
  minHeight: '600px',
  borderRadius: '12px',
  boxShadow: '0 4px 10px rgba(0, 0, 0, 0.15)',
  transition: '0.3s',
  '&:hover': {
    transform: 'scale(1.03)',
    boxShadow: '0 6px 12px rgba(0, 0, 0, 0.25)',
  },
}));

const StyledImage = styled('img')({
  borderRadius: '8px',
  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
  transition: '0.3s',
  '&:hover': {
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)',
  },
});

const StyledCardActions = styled(CardActions)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
}));
const StyledButton = styled(Button)(({ theme }) => ({
  marginBottom: '8px',
  transition: '0.3s',
  background: 'linear-gradient(to right, #8e2de2, #4a00e0, #00c6fb)',
  color: '#fff',
  fontSize: '1.2rem',
  borderRadius: '4px',
  padding: '12px 16px',
  boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
  border: '2px solid #8e2de2',
  '&:hover': {
    boxShadow: '0px 8px 16px rgba(0, 0, 0, 0.2)',
    transform: 'translateY(-2px)',
    background: 'linear-gradient(to right, #8e2de2, #4a00e0, #00c6fb)',
  },
  '&:active': {
    boxShadow: 'none',
    transform: 'translateY(2px)',
    background: '#8e2de2',
    border: '2px solid #8e2de2',
  },
  '&:focus': {
    outline: 'none',
  },
}));







const contractAddress = '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9';

const PetDetails = () => {
  const [newName, setNewName] = useState('');

  const [contract, setContract] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [pets, setPets] = useState([]);

  const getImageUrl = (level, id) => {
    let imageUrl;
    if (level >= 2) {
      imageUrl = `https://bafybeidm7jfef6v6l7dutjat52fl3ynv6jrrovhfgfrzipvxmbdnaqsnhm.ipfs.nftstorage.link/${id}.png`;
    } else {
      imageUrl = `https://bafybeih6ocvp4vmuibfe2xvuvjjujdi5fi7bb4aylvvakrvejztmuwx7ee.ipfs.nftstorage.link/${id}.png`;
    }
    return imageUrl;
  };

  const onSetNameClick = async (tokenId) => {
    if (!contract) return;

    try {
      await contract.methods.setName(tokenId, newName).send({ from: accounts[0] });

      // Refresh pet details
      const updatedPetDetails = await contract.methods.getPetDetails(tokenId).call();
      const updatedPets = pets.map((pet) => (pet.tokenId === tokenId ? { tokenId, ...updatedPetDetails } : pet));
      setPets(updatedPets);

      // Clear the input field
      setNewName('');
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const initWeb3 = async () => {
      if (!web3) {
        console.log('Please install MetaMask!');
        return;
      }

      const contractInstance = new web3.eth.Contract(EventTicketingABI, contractAddress);
      setContract(contractInstance);

      const accounts = await web3.eth.getAccounts();
      setAccounts(accounts);
    };

    initWeb3();
  }, []);

  useEffect(() => {
    if (!contract) return;

    const fetchPets = async () => {
      const totalSupply = await contract.methods.totalSupply().call();
      const ownedTokenIds = [];

      for (let i = 1; i <= totalSupply; i++) {
        try {
          const owner = await contract.methods.ownerOf(i).call();
          if (owner === accounts[0]) {
            ownedTokenIds.push(i);
          }
        } catch (err) {
          console.error(err);
        }
      }

      const petDetails = await Promise.all(
        ownedTokenIds.map(async (tokenId) => {
          const details = await contract.methods.getPetDetails(tokenId).call();
          return { tokenId, ...details };
        }),
      );

      setPets(petDetails);
    };

    fetchPets();
  }, [contract, accounts]);

  const onInteractClick = async (tokenId, action) => {
    if (!contract) return;

    try {
      switch (action) {
        case 'feed':
          await contract.methods.feed(tokenId).send({ from: accounts[0] });
          break;
        case 'play':
          await contract.methods.play(tokenId).send({ from: accounts[0] });
          break;
        case 'evolve':
          await contract.methods.evolve(tokenId).send({ from: accounts[0] });
          break;
        default:
          break;
      }

      // Refresh pet details
      const updatedPetDetails = await contract.methods.getPetDetails(tokenId).call();
      const updatedPets = pets.map((pet) => (pet.tokenId === tokenId ? { tokenId, ...updatedPetDetails } : pet));
      setPets(updatedPets);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Container maxWidth="md">
      <Typography
  variant="h3"
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
    fontSize: {xs: '2rem', sm: '3rem', md: '4rem'},
  }}
>
  Your Buddies
</Typography>

      <Grid container spacing={3}>
        {pets.map((pet) => (
          <Grid item xs={12} sm={6} md={4} key={pet.tokenId}>
            <StyledCard>
              <CardContent>
                <StyledImage
                  src={getImageUrl(pet.level, pet.id)}
                  alt={`${pet.name}`}
                  width="100%"
                />
                <Typography
  variant="h5"
  gutterBottom
  sx={{
    fontFamily: 'Montserrat, sans-serif',
    fontWeight: 700,
    marginTop: '2rem',
    textShadow: '1px 1px 1px #FF0000, 2px 2px 1px #0000FF',
    WebkitTextStrokeWidth: '1px',
    WebkitTextStrokeColor: '#FFD700',
    color: '#333',
    letterSpacing: '0.1rem',
    textTransform: 'uppercase',
    textAlign: 'center'
  }}
>
<PetsIcon sx={{ fontSize: 36, mr: 1 }} />
  {pet.name}
</Typography>



<Typography sx={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 'medium', mt: 1 }} variant="subtitle1">
      Pet Details
 </Typography>
  {/* Add the token ID to the container */}
  <Typography
          variant="subtitle1"
          sx={{
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 'medium',
            mt: 1,
            textAlign: 'center'
          }}
        >
          Token ID: {pet.tokenId}
        </Typography>
  <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', mt: 2 }}>      
 </Box>
 <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', mt: 1 }}>
     <CalendarTodayIcon sx={{ fontSize: 36, mr: 1 }} />
     <Typography sx={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 'medium' }} variant="subtitle1">
         DOB: {new Date(pet.birthTime * 1000).toLocaleDateString()}
     </Typography>
 </Box>
 <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', mt: 1 }}>
     <AccessTimeIcon sx={{ fontSize: 36, mr: 1 }} />
     <Typography sx={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 'medium' }} variant="subtitle1">
         Last Interaction: {new Date(pet.lastInteraction * 1000).toLocaleString()}
     </Typography>
 </Box>
 
 <Typography sx={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 'medium', mt: 2 }} variant="h2">
     Stats
 </Typography>
<Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', mt: 2 }}>
     <EqualizerIcon sx={{ fontSize: 36, mr: 1 }} />
     <Typography sx={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 'medium' }} variant="subtitle1">
         Level: {pet.level} | XP: {pet.xp} | Element: {pet.element} | HP: {pet.hp} | Power: {pet.power}
     </Typography>
 </Box>
 
 <Typography sx={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 'medium', mt: 2 }} variant="h3">
     Needs
 </Typography>
 <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', mt: 2 }}>
     <SentimentSatisfiedAltIcon sx={{ fontSize: 36, mr: 1 }} />
     <Typography sx={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 'medium' }} variant="subtitle1">
         Happiness: {pet.happiness} <MoodIcon sx={{ fontSize: 16, mb: -1, ml: 1 }} />
     </Typography>
 </Box>
 <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', mt: 1 }}>
     <RestaurantIcon sx={{ fontSize: 36, mr: 1 }} />
    <Typography sx={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 'medium' }} variant="subtitle1">
         Hunger: {pet.hunger} <FastfoodIcon sx={{ fontSize: 16, mb: -1, ml: 1 }} />
     </Typography>
 </Box>


              </CardContent>
              <StyledCardActions>
                <Box mt={1} mb={1}>
                  <TextField
                    label="New Name"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    sx={{ width: '100%' }}
                    InputProps={{ sx: { fontFamily: 'Montserrat, sans-serif', fontWeight: 'medium' } }}
                    InputLabelProps={{ sx: { fontFamily: 'Montserrat, sans-serif', fontWeight: 'medium' } }}
                  />
                  <StyledButton
                    onClick={() => onSetNameClick(pet.tokenId)}
                    sx={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 'bold', mt: 1 }}
                  >
                    Set Name
                    <EditIcon/>
                  </StyledButton>
                </Box>
                <StyledButton
                  onClick={() => onInteractClick(pet.tokenId, 'feed')}
                  sx={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 'bold' }}
                >
                  Feed
                  <FastfoodIcon/>
                </StyledButton>
                <StyledButton
                  onClick={() => onInteractClick(pet.tokenId, 'play')}
                  sx={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 'bold' }}
                >
                  Play
                  <SportsEsportsIcon />

                </StyledButton>
                <StyledButton
                  
                  onClick={() => onInteractClick(pet.tokenId, 'interact')}
                  sx={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 'bold' }}
                >
                  Interact
                  <EmojiPeopleIcon />

                </StyledButton>
                <StyledButton
                  
                  onClick={() => onInteractClick(pet.tokenId, 'evolve')}
                  sx={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 'bold' }}
                >
                  Evolve
                  <AutoFixHighIcon />

                </StyledButton>
                
              </StyledCardActions>
            </StyledCard>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default PetDetails;