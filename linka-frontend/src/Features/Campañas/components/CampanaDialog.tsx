import { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  Box,
} from "@mui/material";

type Props = {
  open: boolean;
  mode: "create" | "edit";
  initialName?: string;
  loading: boolean;
  onClose: () => void;
  onSubmit: (nombre: string) => void | Promise<void>;
};

export default function CampanaDialog({
  open,
  mode,
  initialName = "",
  loading,
  onClose,
  onSubmit,
}: Props) {
  const [nombre, setNombre] = useState(initialName);

  useEffect(() => setNombre(initialName), [initialName, open]);

  const title = mode === "create" ? "Crear nueva campaña" : "Editar campaña";
  const confirmLabel = mode === "create" ? "Guardar Campaña" : "Guardar cambios";

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <Box p={3}>
        {/* Título */}
        <DialogTitle sx={{ px: 0, pb: 2 }}>
          <Typography variant="h6" fontWeight={700}>
            {title}
          </Typography>
        </DialogTitle>

        {/* Contenido */}
        <DialogContent sx={{ px: 0 }} dividers>
          <Typography fontWeight={600} mb={1}>
            Nombre de la campaña
          </Typography>
          <TextField
            fullWidth
            placeholder="Ej. Lanzamiento Linka"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
        </DialogContent>

        {/* Botones */}
        <DialogActions sx={{ px: 0, pt: 3 }} >
          <Button
            onClick={onClose}
            variant="outlined"
            color="info"
          >
            Cancelar
          </Button>
          <Button
            onClick={() => onSubmit(nombre.trim())}
            variant="contained"
            color="secondary"
            disabled={loading || !nombre.trim()}
          >
            {confirmLabel}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
