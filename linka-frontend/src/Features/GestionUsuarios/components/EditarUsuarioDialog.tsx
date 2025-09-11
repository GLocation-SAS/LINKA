// src/Features/Usuarios/components/EditarUsuarioDialog.tsx
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
  Stack,
  Box,
  Typography,
} from "@mui/material";
import { useState, useEffect } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (data: { displayName: string; rol: string; estado: string }) => void;
  usuario: any;
}

export default function EditarUsuarioDialog({
  open,
  onClose,
  onSave,
  usuario,
}: Props) {
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [rol, setRol] = useState("gestor");
  const [estado, setEstado] = useState("activo");

  useEffect(() => {
    if (usuario) {
      setEmail(usuario.email || "");
      setDisplayName(usuario.display_name || "");
      setRol(usuario.rol || "gestor");
      setEstado(usuario.estado || "activo");
    }
  }, [usuario]);

  const handleSave = () => {
    onSave({ displayName, rol, estado });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Editar Usuario</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {/* Correo - Solo lectura */}
          <Box>
            <Typography fontSize={14} fontWeight={600} mb={1}>
              Correo
            </Typography>
            <TextField
              fullWidth
              value={email}
              disabled
              placeholder="Correo del usuario"
              sx={{
                "& .MuiInputBase-input::placeholder": { opacity: 1 },
                "& .MuiInputBase-input:focus::placeholder": { opacity: 0 },
              }}
            />
          </Box>

          {/* Nombre - Editable */}
          <Box>
            <Typography fontSize={14} fontWeight={600} mb={1}>
              Nombre
            </Typography>
            <TextField
              fullWidth
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Nombre del usuario"
              sx={{
                "& .MuiInputBase-input::placeholder": { opacity: 1 },
                "& .MuiInputBase-input:focus::placeholder": { opacity: 0 },
              }}
            />
          </Box>

          {/* Rol - Editable */}
          <Box>
            <Typography fontSize={14} fontWeight={600} mb={1}>
              Rol
            </Typography>
            <TextField
              select
              fullWidth
              value={rol}
              onChange={(e) => setRol(e.target.value)}
              placeholder="Selecciona un rol"
              sx={{
                "& .MuiInputBase-input::placeholder": { opacity: 1 },
                "& .MuiInputBase-input:focus::placeholder": { opacity: 0 },
              }}
            >
              <MenuItem value="gestor">Gestor</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
            </TextField>
          </Box>

          {/* Estado - Editable */}
          <Box>
            <Typography fontSize={14} fontWeight={600} mb={1}>
              Estado
            </Typography>
            <TextField
              select
              fullWidth
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
              placeholder="Selecciona un estado"
              sx={{
                "& .MuiInputBase-input::placeholder": { opacity: 1 },
                "& .MuiInputBase-input:focus::placeholder": { opacity: 0 },
              }}
            >
              <MenuItem value="activo">Activo</MenuItem>
              <MenuItem value="inactivo">Inactivo</MenuItem>
            </TextField>
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button variant="outlined" color="info" onClick={onClose}>Cancelar</Button>
        <Button variant="contained" color="secondary" onClick={handleSave}>
          Guardar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
