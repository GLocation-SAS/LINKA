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
} from "@mui/material";
import { useState, useEffect } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (data: { rol: string; estado: string }) => void;
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
    onSave({ rol, estado });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Editar Usuario</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {/* Correo - Solo lectura */}
          <TextField
            label="Correo"
            value={email}
            fullWidth
            disabled
          />

          {/* Nombre - Solo lectura */}
          <TextField
            label="Nombre"
            value={displayName}
            fullWidth
            disabled
          />

          {/* Rol - Editable */}
          <TextField
            select
            label="Rol"
            value={rol}
            onChange={(e) => setRol(e.target.value)}
            fullWidth
          >
            <MenuItem value="gestor">Gestor</MenuItem>
            <MenuItem value="admin">Admin</MenuItem>
          </TextField>

          {/* Estado - Editable */}
          <TextField
            select
            label="Estado"
            value={estado}
            onChange={(e) => setEstado(e.target.value)}
            fullWidth
          >
            <MenuItem value="activo">Activo</MenuItem>
            <MenuItem value="inactivo">Inactivo</MenuItem>
          </TextField>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button variant="outlined" onClick={onClose}>Cancelar</Button>
        <Button variant="contained" color="secondary" onClick={handleSave}>
          Guardar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
