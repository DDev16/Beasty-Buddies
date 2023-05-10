import React, { useState } from 'react';
import {
  Box,
  Flex,
  HStack,
  IconButton,
  useDisclosure,
  Stack,
  useMediaQuery,
  Link,
  Text,
  Image,
  Button,
} from '@chakra-ui/react';
import { HamburgerIcon, CloseIcon } from '@chakra-ui/icons';
import logo from '../marketplace/Assets/logo.png';
import Web3 from 'web3';
import './NavBar.css'


const NavLink = ({ children, href, fontSize = 'lg', fontWeight = 'medium' }) => (
  <Link
    href={href}
    fontSize={fontSize}
    fontWeight={fontWeight}
    color="black"
    _hover={{ textDecoration: 'none', color: 'yellow.500' }}
    transition="all 0.3s"
    padding={20}
    
  >
    {children}
  </Link>
);

function NavBar() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isLargerThan768] = useMediaQuery('(min-width: 768px)');
  const [account, setAccount] = useState('');

  const web3 = new Web3(window.ethereum);

const handleConnectWallet = async () => {
  try {
    // Prompt user to connect their wallet
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    
    // Retrieve user's account address
    const accounts = await web3.eth.getAccounts();
    const account = accounts[0];

    // Set the account in state
    setAccount(account);
  } catch (error) {
    console.error('Error connecting wallet:', error);
  }
};

  return (
    
    <Box bg="blue.500"  px={6} py={4} color="white" boxShadow="md">
      
      <Flex h={16} alignItems={'center'} justifyContent={'space-between'} marginLeft={150} >
        
      <Image src={logo} alt="Tamagotchi NFT logo" w={100} mx="auto" marginTop={75}   />
        <Text fontSize={{ base: 'xl', md: '2xl' }} fontWeight="bold" color="black" marginTop={100}>
  Monsters NFT Inc.
</Text>



        <IconButton
          size="md"
          icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
          aria-label="Open Menu"
          display={{ md: 'none' }}
          onClick={isOpen ? onClose : onOpen}
          variant="ghost"
          color="white"
        />
      </Flex>
      {isLargerThan768 ? (
        <HStack as="nav" spacing={6} display="flex" width="auto" alignItems="center">
          <NavLink href="#home">Home</NavLink>
          <NavLink href="#about">About</NavLink>
          <NavLink href="#contact">Contact</NavLink>
        </HStack>
      ) : (
        isOpen && (
          <Box pb={6}>
            <Stack as={'nav'} spacing={1}>
              <NavLink href="#home">Home</NavLink>
              <NavLink href="#about">About</NavLink>
              <NavLink href="#contact">Contact</NavLink>
            </Stack>
          </Box>
        )
      )}
    </Box>
  );
}

export default NavBar
