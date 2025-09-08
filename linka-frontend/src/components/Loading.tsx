// src/components/Loading.tsx
import { Box } from "@mui/material";
import loadingGif from "../assets/Linka/GIF/GifLinka.gif";

export default function Loading({ height = "200px" }: { height?: string | number }) {
  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      height={height} // ahora dinámico
      width="100%"
    >
      <img src={loadingGif} alt="Loading..." width={80} height={80} />
    </Box>
  );
}
