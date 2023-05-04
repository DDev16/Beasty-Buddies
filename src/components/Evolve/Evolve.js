import React from 'react';

function Evolve({ tokenId, evolve }) {
  return (
    <section>
      <h2>Evolve</h2>
      <button onClick={() => evolve(tokenId)}>Evolve Pet</button>
    </section>
  );
}

export default Evolve;
