import React from 'react';
import Box from '@mui/material/Box';
import { styled } from '@mui/system';

const StyledBox = styled(Box)((props) => ({
  width: props.size,
  height: props.size,
  borderRadius: '50%',
  backgroundColor: 'grey[200]',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  margin: `${props.margin}px`,
  position: 'relative',
  left: '50%',
  top: '50%',
  transform: 'translate(-50%, -50%)',
}));

function PetAvatar({ size = 80, margin = 20 }) {
  return (
    <StyledBox size={size} margin={margin}>
      <img
        src="https://via.placeholder.com/80x80"
        alt="Pet Avatar"
        width="100%"
        height="100%"
        style={{ objectFit: 'cover' }}
      />
    </StyledBox>
  );
}

export default PetAvatar;

