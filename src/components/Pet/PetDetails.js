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
    transform: 'scale(1.05)',
    boxShadow: '0 6px 12px rgba(0, 0, 0, 0.2)',
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
  '&:hover': {
    transform: 'scale(1.05)',
  },
}));

const contractAddress = '0x5FC8d32690cc91D4c39d9d3abcBD16989F875707';

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
    <Typography variant="h4" align="center" gutterBottom>
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
              <Typography className="pet-name" variant="h5" gutterBottom>
                {pet.name}
              </Typography>
              <Typography>ID: {pet.id}</Typography>
              <Typography>Birth Time: {pet.birthTime}</Typography>
              <Typography>Last Interaction: {pet.lastInteraction}</Typography>
              <Typography>Level: {pet.level}</Typography>
              <Typography>Happiness: {pet.happiness}</Typography>
              <Typography>Hunger: {pet.hunger}</Typography>
              <Typography>XP: {pet.xp}</Typography>
              <Typography>Element: {pet.element}</Typography>
              <Typography>HP: {pet.hp}</Typography>
              <Typography>Power: {pet.power}</Typography>
            </CardContent>
            <StyledCardActions>
              <Box mt={1} mb={1}>
                <TextField
                  label="New Name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
                <StyledButton
                  className="button-primary"
                  onClick={() => onSetNameClick(pet.tokenId)}
                >
                  Set Name
                </StyledButton>
              </Box>
              <StyledButton
                className="button-primary"
                onClick={() => onInteractClick(pet.tokenId, 'feed')}
              >
                Feed
              </StyledButton>
              <StyledButton
                className="button-secondary"
                onClick={() => onInteractClick(pet.tokenId, 'play')}
              >
                Play
              </StyledButton>
              <StyledButton
                className="button-success"
                onClick={() => onInteractClick(pet.tokenId, 'evolve')}
              >
                Evolve
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