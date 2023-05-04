import React, { useState, useEffect } from 'react';
import { getPetData } from '../Web3.js';

function PetList() {
  const [pets, setPets] = useState([]);

  useEffect(() => {
    const loadPets = async () => {
      const petInfo = await getPetData(); // Implement this function in web3.js
      setPets(petInfo);
    };

    loadPets();
  }, []);

  return (
    <section>
      <h2>Pet List</h2>
      <ul>
        {pets.map((pet) => (
          <li key={pet.id}>{pet.name}</li>
        ))}
      </ul>
    </section>
  );
}

export default PetList;
