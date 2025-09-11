// src/Features/Register/RegisterPage.tsx
import { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Stack,
  Link,
} from "@mui/material";
import { registerWithEmail } from "../../Login/services/authService";
import { useNavigate } from "react-router-dom";
import FeedbackModal from "../../../components/FeedbackModal";
import backgroundImage from "../../../assets/images/ImagenLogin.png";
import logo from "../../../assets/Linka/Logos/Logo Horizontal/PNG/Logo Horizontal.png";

function mapRegisterError(err: any): string {
  const raw =
    err?.code ||
    err?.message ||
    err?.error?.message || // cuando viene del REST
    "";

  const text = String(raw).toLowerCase();

  if (text.includes("email_exists") || text.includes("auth/email-already-in-use")) {
    return "❌ Este correo ya está registrado. Intenta iniciar sesión o usa otro correo.";
  }
  if (text.includes("weak-password") || text.includes("auth/weak-password")) {
    return "❌ La contraseña es muy débil. Usa al menos 6 caracteres.";
  }
  if (text.includes("invalid-email") || text.includes("auth/invalid-email")) {
    return "❌ El correo no es válido. Verifícalo por favor.";
  }
  if (text.includes("operation-not-allowed")) {
    return "❌ El registro con correo/contraseña está deshabilitado. Contacta con TI.";
  }
  if (text.includes("too-many-requests")) {
    return "❌ Demasiados intentos. Inténtalo de nuevo en unos minutos.";
  }

  return "❌ Error al registrar: valida tu correo o contraseña por favor.";
}

export default function RegisterPage() {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  // Modales y loading
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState<null | string>(null);
  const [loadingConfirm, setLoadingConfirm] = useState(false);

  const navigate = useNavigate();

  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // 1) Valida y abre confirmación
  const handleRegister = () => {
    setMessage("");
    setShowError(null);

    if (!displayName.trim() || !email.trim() || !password.trim()) {
      setMessage("❌ Todos los campos son obligatorios");
      return;
    }
    if (!isValidEmail(email)) {
      setMessage("❌ Ingresa un correo electrónico válido.");
      return;
    }
    setShowConfirm(true);
  };

  // 2) Confirmado → intenta registrar
  const handleConfirmRegister = async () => {
    setLoadingConfirm(true);
    try {
      const rol = "gestor"; // rol por defecto
      await registerWithEmail(email, password, displayName, rol);

      setShowConfirm(false);
      setShowSuccess(true);
    } catch (error: any) {
      console.error("Error en el registro:", error);
      setShowConfirm(false);
      setShowError(mapRegisterError(error)); // 👈 mapeo del error
    } finally {
      setLoadingConfirm(false);
    }
  };

  // 3) Cerrar éxito → redirigir a login
  const handleSuccessClose = () => {
    setShowSuccess(false);
    navigate("/");
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        width: "100%",
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        px: 6,
      }}
    >
      <Box
        sx={{
          maxWidth: 500,
          width: "100%",
          bgcolor: "#fff",
          p: 6,
          borderRadius: 6,
          boxShadow: 4,
        }}
      >
        <Box display="flex" justifyContent="center" mb={3}>
          <img src={logo} alt="Linka" width={140} />
        </Box>

        <Typography variant="h4" textAlign="center" gutterBottom fontWeight={700} mb={5}>
          Crear Cuenta
        </Typography>

        <Stack spacing={3}>
          <Box>
            <Typography fontSize={14} fontWeight={600} mb={1}>
              Nombre completo
            </Typography>
            <TextField
              fullWidth
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </Box>

          <Box>
            <Typography fontSize={14} fontWeight={600} mb={1}>
              Correo Electrónico
            </Typography>
            <TextField
              fullWidth
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
            />
          </Box>

          {message && (
            <Typography textAlign="center" fontSize={14} color="error">
              {message}
            </Typography>
          )}

          <Button
            fullWidth
            variant="contained"
            color="secondary"
            size="large"
            onClick={handleRegister}
          >
            Registrarse
          </Button>

          <Typography textAlign="center" fontSize={14}>
            ¿Ya tienes una cuenta?{" "}
            <Link href="/" underline="hover" fontWeight={600}>
              Inicia sesión aquí
            </Link>
          </Typography>
        </Stack>
      </Box>

      {/* ===== Modal Confirmación Registro ===== */}
      <FeedbackModal
        open={showConfirm}
        type="confirm"
        title="¿Crear esta cuenta?"
        description={
          <>
            <strong>Nombre:</strong> {displayName}
            <br />
            <strong>Correo:</strong> {email}
          </>
        }
        confirmLabel="Registrarme"
        cancelLabel="Cancelar"
        onConfirm={handleConfirmRegister}
        onClose={() => setShowConfirm(false)}
        loadingConfirm={loadingConfirm}
      />

      {/* ===== Modal Éxito ===== */}
      <FeedbackModal
        open={showSuccess}
        type="success"
        title="Registro exitoso"
        description="Tu cuenta fue creada correctamente. Ahora puedes continuar a iniciar sesión con tu usuario."
        confirmLabel="Aceptar"
        onClose={handleSuccessClose}
      />

      {/* ===== Modal Error ===== */}
      <FeedbackModal
        open={Boolean(showError)}
        type="error"
        title="No se pudo completar el registro"
        description={showError || undefined}
        confirmLabel="Entendido"
        onClose={() => setShowError(null)}
      />
    </Box>
  );
}
