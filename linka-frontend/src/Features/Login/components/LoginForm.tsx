// src/Features/Login/components/LoginForm.tsx
import { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Stack,
  Link,
  InputAdornment,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { AccountCircle, Key, Google } from "@mui/icons-material";
import { loginWithEmail, loginWithGoogle, mapAuthErrorToMessage } from "../services/authService";
import logo from "../../../assets/Linka/Logos/Logo Horizontal/PNG/Logo Horizontal.png";
import FeedbackModal from "../../../components/FeedbackModal";
import { useUser } from "../../../Context/UserContext";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const navegate = useNavigate();
  const { setUid } = useUser();   // ⬅️ NUEVO

  const [showConfirmEmail, setShowConfirmEmail] = useState(false);
  const [showConfirmGoogle, setShowConfirmGoogle] = useState(false);
  const [showSuccess, setShowSuccess] = useState<null | string>(null); // texto opcional
  const [showError, setShowError] = useState<null | string>(null);
  const [loadingConfirm, setLoadingConfirm] = useState(false);

  // ✅ Validación de email
  const isValidEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleLogin = () => {
    setMessage("");
    setShowError(null);

    if (!email.trim() || !password.trim()) {
      setMessage("❌ Por favor completa todos los campos.");
      return;
    }
    if (!isValidEmail(email)) {
      setMessage("❌ Ingresa un correo electrónico válido.");
      return;
    }

    setShowConfirmEmail(true); // abre modal de confirmación
  };

  const handleConfirmEmailLogin = async () => {
    setLoadingConfirm(true);
    try {
      const user = await loginWithEmail(email, password);
      setUid(user.uid);
      setShowConfirmEmail(false);
      setShowSuccess("¡Inicio de sesión exitoso!");
      setMessage("Has ingresado con tu correo electrónico.");
    } catch (error: any) {
      console.error("Error al iniciar sesión:", error);
      setShowConfirmEmail(false);
      setShowError(mapAuthErrorToMessage(error)); // 👈 usa el mapeo
    } finally {
      setLoadingConfirm(false);
    }
  };

  // ---------- Login con Google: confirmación simple ----------
  const handleGoogleLogin = () => {
    setMessage("");
    setShowError(null);
    setShowConfirmGoogle(true);
  };

  const handleConfirmGoogleLogin = async () => {
    setLoadingConfirm(true);
    try {
      const user = await loginWithGoogle();
      setUid(user.uid);
      setShowConfirmGoogle(false);
      setShowSuccess("¡Inicio de sesión con Google exitoso!");
      setMessage("Has ingresado con tu cuenta de Google.");
    } catch (error: any) {
      console.error("Error con Google Login:", error);
      setShowConfirmGoogle(false);
      setShowError(mapAuthErrorToMessage(error)); // 👈 usa el mapeo
    } finally {
      setLoadingConfirm(false);
    }
  };

  // Cerrar éxito → navegar
  const handleSuccessClose = () => {
    setShowSuccess(null);
    setMessage("");
    navegate("/Campanas");
  };

  return (
    <Box
      sx={{
        flex: 1,
        maxWidth: 500,
        bgcolor: "#fff",
        p: 6,
        borderRadius: 6,
        boxShadow: 4,
        height: 700,
      }}
    >
      <Box display="flex" justifyContent="center" mb={3}>
        <img src={logo} alt="Linka" width={140} />
      </Box>

      <Typography variant="h4" textAlign="center" gutterBottom fontWeight={700} mb={5}>
        Iniciar Sesión
      </Typography>

      <Stack spacing={3}>
        {/* Correo */}
        <Box>
          <Typography fontSize={14} fontWeight={600} mb={1}>
            Correo Electrónico
          </Typography>
          <TextField
            fullWidth
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Ingresa tu Correo Electrónico"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <AccountCircle color="secondary" />
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiInputBase-input::placeholder": {
                opacity: 1, // visible por defecto
              },
              "& .MuiInputBase-input:focus::placeholder": {
                opacity: 0, // desaparece al focus
              },
            }}
          />
        </Box>

        {/* Contraseña */}
        <Box>
          <Typography fontSize={14} fontWeight={600} mb={1}>
            Contraseña
          </Typography>
          <TextField
            fullWidth
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Ingresa tu Contraseña"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Key color="secondary" />
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiInputBase-input::placeholder": {
                opacity: 1,
              },
              "& .MuiInputBase-input:focus::placeholder": {
                opacity: 0,
              },
            }}
          />
        </Box>


        {/* Mensaje de error */}
        {message && (
          <Typography textAlign="center" fontSize={14} color="error">
            {message}
          </Typography>
        )}

        <Link href="/forgotpassword" underline="hover" fontSize={14} alignSelf="flex-end">
          ¿Olvidaste tu contraseña?
        </Link>

        {/* Botón normal */}
        <Button
          fullWidth
          variant="contained"
          color="secondary"
          size="large"
          onClick={handleLogin}
        >
          Iniciar sesión
        </Button>

        {/* Botón Google */}
        <Button
          fullWidth
          variant="outlined"
          color="info"  
          startIcon={<Google />}
          onClick={handleGoogleLogin}
        >
          Iniciar sesión con Google
        </Button>

        <Typography textAlign="center" fontSize={14} mt={7}>
          ¿No tienes una cuenta?{" "}
          <Link href="/register" underline="hover" fontWeight={600}>
            Créala aquí
          </Link>
        </Typography>
      </Stack>

      {/* ===== Modal Confirmación Email ===== */}
      <FeedbackModal
        open={showConfirmEmail}
        type="confirm"
        title="¿Deseas iniciar sesión?"
        description={
          <>
            Se usará el siguiente correo para iniciar sesión: <br />
            <strong>{email}</strong>
          </>
        }
        confirmLabel="Iniciar sesión"
        cancelLabel="Cancelar"
        onConfirm={handleConfirmEmailLogin}
        onClose={() => setShowConfirmEmail(false)}
        loadingConfirm={loadingConfirm}
      />


      {/* ===== Modal Confirmación Google ===== */}
      <FeedbackModal
        open={showConfirmGoogle}
        type="confirm"
        title="¿Deseas iniciar sesión con Google?"
        description="Se abrirá una ventana de Google para continuar."
        confirmLabel="Continuar con Google"
        cancelLabel="Cancelar"
        onConfirm={handleConfirmGoogleLogin}
        onClose={() => setShowConfirmGoogle(false)}
        loadingConfirm={loadingConfirm}
      />

      {/* ===== Modal Éxito (redirige al cerrar) ===== */}
      <FeedbackModal
        open={Boolean(showSuccess)}
        type="success"
        title={showSuccess || "Éxito"}
        description={message || undefined}   // 👈 descripción dinámica
        confirmLabel="Continuar"
        onClose={handleSuccessClose}
      />

      {/* ===== Modal Error ===== */}
      <FeedbackModal
        open={Boolean(showError)}
        type="error"
        title="No se pudo iniciar sesión"
        description={showError || undefined}
        confirmLabel="Entendido"
        onClose={() => setShowError(null)}
      />
    </Box>
  );
}
