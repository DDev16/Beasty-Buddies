// StyledComponents.js

import { styled, alpha } from '@mui/system';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

export const Root = styled('div')(({ theme }) => ({
    position: 'relative',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    zIndex: 1,
    padding: theme.spacing(4),
    borderRadius: theme.shape.borderRadius * 2,
    boxShadow: `0px 4px 6px ${alpha(theme.palette.primary.dark, 0.2)}, 0px 1px 1px ${alpha(theme.palette.primary.dark, 0.14)}, 0px 2px 1px -1px ${alpha(theme.palette.primary.dark, 0.12)}`,
    backdropFilter: 'blur(4px)',
}));

export const Title = styled(Typography)(({ theme }) => ({
    color: '#ffffff',
    fontWeight: 'bold',
    textShadow: '2px 2px #000000',
    marginBottom: theme.spacing(2),
    textTransform: 'uppercase',
    letterSpacing: '2px',
    fontSize: '2rem',
    lineHeight: 1.2,
    [theme.breakpoints.down('sm')]: {
        fontSize: '1.5rem',
    },
}));

export const ActionButton = styled(Button)(({ theme }) => ({
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

