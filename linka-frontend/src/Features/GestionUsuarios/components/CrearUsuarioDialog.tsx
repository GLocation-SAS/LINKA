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
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField
              label="Nombre completo"
              fullWidth
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
            />
            <TextField
              label="Correo electrónico"
              type="email"
              fullWidth
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <TextField
              label="Contraseña"
              type="password"
              fullWidth
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <TextField
              select
              label="Rol"
              value={rol}
              onChange={(e) => setRol(e.target.value)}
              fullWidth
              required
            >
              <MenuItem value="gestor">Gestor</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={onClose}>
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
