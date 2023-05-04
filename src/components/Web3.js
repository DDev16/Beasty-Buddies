import Web3 from 'web3';
import EventTicketingABI from './abi/Tama.json'; // Import ABI or define it as a constant

const contractAddress = '0x5FC8d32690cc91D4c39d9d3abcBD16989F875707';
const cost = 0; // Define the cost per pet here (in Ether)

let web3;
let contract;

if (window.ethereum) {
  // Use MetaMask provider if available
  web3 = new Web3(window.ethereum);
  window.ethereum.enable().catch((error) => {
    console.error('Error enabling MetaMask:', error);
  });
} else {
  // Fallback to the local Ethereum node if MetaMask is not available
  const provider = new Web3.providers.HttpProvider('http://localhost:8545');
  web3 = new Web3(provider);
}

contract = new web3.eth.Contract(EventTicketingABI, contractAddress);
console.log("Web3 instance:", web3);
console.log("Contract ABI:", EventTicketingABI);
console.log("Contract address:", contractAddress);
console.log("Contract instance:", contract);



  async function totalSupply() {
    return await contract.methods.totalSupply().call();
  }
  
 

  async function mintPets(amount, from) {
    const requiredPayment = web3.utils.toWei((cost * amount).toString(), "ether");
    await contract.methods.mintPets(amount).send({ from, value: requiredPayment });
  }
  async function getPetInfo() {
    const totalSupply = await contract.methods.totalSupply().call();
    const pets = [];
    for (let i = 1; i <= totalSupply; i++) {
      const petData = await contract.methods.getPetDetails(i);
      pets.push(petData);
    }
    return pets;
  }
  
  
  export {
    web3,
    contract,
    totalSupply,
    mintPets,
    getPetInfo 
  };