import React from 'react';

function Interact({ tokenId, interact }) {
  return (
    <section>
      <h2>Interact</h2>
      <button onClick={() => interact(tokenId)}>Interact with Pet</button>
    </section>
  );
}

export default Interact;
