// src/pages/NotFoundPage.tsx
import { Typography, Button } from "@mui/material";
import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div style={{ padding: 20 }}>
      <Typography variant="h4" color="error" gutterBottom>
        404 - Página no encontrada
      </Typography>
      <Button component={Link} to="/" variant="outlined">
        Volver al inicio
      </Button>
    </div>
  );
}
