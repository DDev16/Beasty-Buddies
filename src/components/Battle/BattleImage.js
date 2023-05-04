import React from "react";
import { Box, Typography } from "@mui/material";

function BattleImage({ token1ImageUrl, token2ImageUrl }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center" }}>
      <Box sx={{ marginRight: 4 }}>
        <img src={token1ImageUrl} alt="Token 1" width={150} height={150} />
      </Box>
      <Typography variant="h2" component="h1" sx={{ marginRight: 4 }}>
        VS
      </Typography>
      <Box sx={{ marginLeft: 4 }}>
        <img src={token2ImageUrl} alt="Token 2" width={150} height={150} />
      </Box>
    </Box>
  );
}

export default BattleImage;