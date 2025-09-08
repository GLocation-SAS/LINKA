// src/Features/Login/components/InfoPanel.tsx
import { Box, Typography } from "@mui/material";

export default function InfoPanel() {
  return (
    <Box
      sx={{
        flex: 1,
        maxWidth: 900,
        height:700,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        color: "#fff",
        p: 6,
        borderRadius: 4,
        backdropFilter: "blur(20px)",
        backgroundColor: "rgba(82, 81, 81, 0.4)",
      }}
    >
      <Typography variant="h3" fontWeight={700} gutterBottom textAlign="center" width={500}>
        ¡Bienvenido al centro  de envíos masivos!
      </Typography>
      <Typography variant="body1" textAlign="center" width={500}>
        API para envío masivo de mensajes SMS y WhatsApp, incluyendo imágenes y
        videos. Permite autenticación mediante token JWT.
      </Typography>
    </Box>
  );
}
