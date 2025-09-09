// src/Features/Login/pages/ForgotPasswordPage.tsx
import { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Stack,

} from "@mui/material";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../../Config/firebase";
import { useNavigate } from "react-router-dom";
import FeedbackModal from "../../../components/FeedbackModal";
import backgroundImage from "../../../assets/images/ImagenLogin.png";
import ArrowBackIcon from "@mui/icons-material/ArrowBack"; // 👈 nuevo import

function mapResetError(err: any): string {
  const raw =
    err?.code ||
    err?.message ||
    err?.error?.message ||
    "";
  const t = String(raw).toLowerCase();

  if (t.includes("auth/user-not-found")) {
    return "❌ No existe una cuenta con ese correo.";
  }
  if (t.includes("auth/invalid-email")) {
    return "❌ El correo no es válido. Verifícalo por favor.";
  }
  if (t.includes("too-many-requests")) {
    return "❌ Demasiados intentos. Inténtalo de nuevo en unos minutos.";
  }
  return "❌ No se pudo enviar el correo de recuperación. Intenta de nuevo.";
}

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [inlineMessage, setInlineMessage] = useState(""); // mensajes pequeños bajo el formulario

  // Modales
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState<null | string>(null);
  const [loadingConfirm, setLoadingConfirm] = useState(false);

  const navigate = useNavigate();

  const isValidEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleOpenConfirm = () => {
    setInlineMessage("");
    setShowError(null);

    if (!isValidEmail(email)) {
      setInlineMessage("❌ Ingresa un correo electrónico válido.");
      return;
    }
    setShowConfirm(true);
  };

  const handleConfirmReset = async () => {
    setLoadingConfirm(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setShowConfirm(false);
      setShowSuccess(true);
    } catch (error: any) {
      console.error("Reset password error:", error);
      setShowConfirm(false);
      setShowError(mapResetError(error));
    } finally {
      setLoadingConfirm(false);
    }
  };

  // Cerrar éxito → regresar a login
  const handleSuccessClose = () => {
    setShowSuccess(false);
    navigate("/");
  };

  return (
    <Box
      sx={{
        display: "flex",
        height: "100vh",
        alignItems: "center",
        justifyContent: "center",
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        p: 4,
      }}
    >
      <Box
        sx={{
          maxWidth: 400,
          width: "100%",
          bgcolor: "#fff",
          p: 5,
          borderRadius: 4,
          boxShadow: 3,
        }}
      >
        <Typography variant="h5" textAlign="center" fontWeight={700} mb={1}>
          Recuperar Contraseña
        </Typography>

        <Stack spacing={3}>
          <Typography fontSize={14} fontWeight={600} sx={{ marginTop: "5% !important" }}>
            Correo Electrónico
          </Typography>
          <TextField
            fullWidth
            label="Correo Electrónico"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            variant="outlined"
            InputLabelProps={{
              shrink: false, // evita el floating label
              sx: {
                "&.Mui-focused": {
                  display: "none", // 👈 oculta cuando está en focus
                },
              },
            }}
          />


          <Button
            variant="contained"
            color="secondary"
            onClick={handleOpenConfirm}
          >
            Enviar correo de recuperación
          </Button>

          <Button
            variant="outlined"
            color="info"  
            fullWidth
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate("/")}
            sx={{ marginTop: "5% !important" }}
          >
            Volver al inicio de sesión
          </Button>

          {inlineMessage && (
            <Typography textAlign="center" fontSize={14} mt={2} color="error">
              {inlineMessage}
            </Typography>
          )}
        </Stack>
      </Box>

      {/* Modal de confirmación */}
      <FeedbackModal
        open={showConfirm}
        type="confirm"
        title="¿Enviar correo de recuperación?"
        description={
          <>
            Se enviará un enlace para restablecer la contraseña a:
            <br />
            <strong>{email}</strong>
          </>
        }
        confirmLabel="Enviar"
        cancelLabel="Cancelar"
        onConfirm={handleConfirmReset}
        onClose={() => setShowConfirm(false)}
        loadingConfirm={loadingConfirm}
      />

      {/* Modal de éxito */}
      <FeedbackModal
        open={showSuccess}
        type="success"
        title="Correo enviado"
        description="Te hemos enviado un correo para restablecer tu contraseña. Revisa también Spam o Correos no deseados."
        confirmLabel="Ir al inicio de sesión"
        onClose={handleSuccessClose}
      />

      {/* Modal de error */}
      <FeedbackModal
        open={Boolean(showError)}
        type="error"
        title="No se pudo enviar el correo"
        description={showError || undefined}
        confirmLabel="Entendido"
        onClose={() => setShowError(null)}
      />
    </Box>
  );
}
