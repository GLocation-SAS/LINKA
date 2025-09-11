// src/Features/Mensajes/components/StepMensaje.tsx
import { Box, Typography, TextField } from "@mui/material";

type Props = {
  mensaje: string;
  setMensaje: (v: string) => void;
};

export default function StepMensaje({ mensaje, setMensaje }: Props) {
  return (
    <Box p={3} bgcolor={"white"} borderRadius={2}>
      <Typography variant="h6" fontWeight={700}>
        2. Mensaje
      </Typography>
      <Typography variant="body1" color="text.secondary" mb={2}>
        Redacta tu mensaje
      </Typography>
      <TextField
        fullWidth
        multiline
        minRows={4}
        placeholder="Escribe aquí..."
        value={mensaje}
        onChange={(e) => setMensaje(e.target.value)}
      />
    </Box>
  );
}
