// src/Features/Usuarios/components/CrearUsuarioDialog.tsx
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
  Stack,
  Typography,
  Box,
} from "@mui/material";
import { registerWithEmail } from "../../Login/services/authService";
import FeedbackModal from "../../../components/FeedbackModal"; // 👈 importa tu modal

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: () => void; // para refrescar lista
}

export default function CrearUsuarioDialog({ open, onClose, onCreated }: Props) {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rol, setRol] = useState("gestor");

  // Estados de flujo de modales
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState<null | string>(null);
  const [loading, setLoading] = useState(false);

  // ✅ Limpiar formulario cuando se cierra el dialog principal
  useEffect(() => {
    if (!open) {
      resetForm();
      setShowConfirm(false);
      setShowSuccess(false);
      setShowError(null);
      setLoading(false);
    }
  }, [open]);

  const resetForm = () => {
    setDisplayName("");
    setEmail("");
    setPassword("");
    setRol("gestor");
  };

  const isValidEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // Click en "Crear" (abre confirmación primero)
  const handlePreCreate = () => {
    // Validaciones básicas antes de confirmar
    if (!displayName.trim() || !email.trim() || !password.trim() || !rol) {
      setShowError("❌ Todos los campos son obligatorios");
      return;
    }
    if (!isValidEmail(email)) {
      setShowError("❌ Ingresa un correo electrónico válido");
      return;
    }
    setShowError(null);
    setShowConfirm(true);
  };

  // Confirmación aceptada → crear usuario
  const handleCreateConfirmed = async () => {
    setLoading(true);
    try {
      await registerWithEmail(email, password, displayName, rol);
      setShowConfirm(false);
      setShowSuccess(true); // mostrar éxito
    } catch (err: any) {
      console.error("Error al crear usuario:", err);
      setShowConfirm(false);
      setShowError(
        err?.response?.data?.message ||
        "❌ No se pudo crear el usuario. Puede que ya exista."
      );
    } finally {
      setLoading(false);
    }
  };

  // Cierre del modal de éxito
  const handleSuccessClose = () => {
    setShowSuccess(false);
    onCreated(); // refrescar usuarios
    onClose();   // cerrar diálogo principal
    resetForm();
  };

  return (
    <>
      {/* Dialog principal de formulario */}
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>Crear Usuario</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} mt={1}>
            <Box>
              <Typography fontSize={14} fontWeight={600} mb={1}>
                Nombre completo
              </Typography>
              <TextField
                fullWidth
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Ingresa tu nombre completo"
                sx={{
                  "& .MuiInputBase-input::placeholder": { opacity: 1 },
                  "& .MuiInputBase-input:focus::placeholder": { opacity: 0 },
                }}
              />
            </Box>

            <Box>
              <Typography fontSize={14} fontWeight={600} mb={1}>
                Correo electrónico
              </Typography>
              <TextField
                fullWidth
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Ingresa tu correo electrónico"
                sx={{
                  "& .MuiInputBase-input::placeholder": { opacity: 1 },
                  "& .MuiInputBase-input:focus::placeholder": { opacity: 0 },
                }}
              />
            </Box>

            <Box>
              <Typography fontSize={14} fontWeight={600} mb={1}>
                Contraseña
              </Typography>
              <TextField
                fullWidth
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingresa tu contraseña"
                sx={{
                  "& .MuiInputBase-input::placeholder": { opacity: 1 },
                  "& .MuiInputBase-input:focus::placeholder": { opacity: 0 },
                }}
              />
            </Box>

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

          </Stack>
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" color="info" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={handlePreCreate}
            disabled={loading}
          >
            Crear
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de confirmación */}
      <FeedbackModal
        open={showConfirm}
        type="confirm"
        title="¿Quieres crear este usuario?"
        description={
          <>
            <strong>Nombre:</strong> {displayName}
            <br />
            <strong>Correo:</strong> {email}
            <br />
            <strong>Rol:</strong> {rol}
          </>
        }
        confirmLabel="Crear"
        cancelLabel="Cancelar"
        onConfirm={handleCreateConfirmed}
        onClose={() => setShowConfirm(false)}
        loadingConfirm={loading}
      />

      {/* Modal de éxito */}
      <FeedbackModal
        open={showSuccess}
        type="success"
        title="¡Usuario creado!"
        description={
          <>
            El usuario <strong>{displayName}</strong> fue creado correctamente.
          </>
        }
        confirmLabel="Aceptar"
        onClose={handleSuccessClose}
      />

      {/* Modal de error */}
      <FeedbackModal
        open={Boolean(showError)}
        type="error"
        title="No se pudo crear el usuario"
        description={showError || undefined}
        confirmLabel="Entendido"
        onClose={() => setShowError(null)}
      />
    </>
  );
}
