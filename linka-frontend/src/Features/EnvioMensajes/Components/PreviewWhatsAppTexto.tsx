// src/Features/Mensajes/components/PreviewWhatsApp.tsx
import { Box, Typography, Paper, Link, Avatar } from "@mui/material";
import logo from "../../../assets/Linka/Logos/Icon/PNG/Icon Blanco.png"

type Props = {
  mensaje: string;
};

// 🔎 Función para detectar y transformar URLs en links
function parseMensaje(mensaje: string) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const partes = mensaje.split(urlRegex);

  return partes.map((parte, i) =>
    urlRegex.test(parte) ? (
      <Link
        key={i}
        href={parte}
        target="_blank"
        rel="noopener noreferrer"
        sx={{
          color: "#0645AD",
          textDecoration: "underline",
          wordBreak: "break-word",
        }}
      >
        {parte}
      </Link>
    ) : (
      <span key={i}>{parte}</span>
    )
  );
}

export default function PreviewWhatsApp({ mensaje }: Props) {
  const horaActual = new Date().toLocaleTimeString("es-CO", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  return (
    <Paper sx={{ p: 2, borderRadius: 3 }}>
      <Typography variant="h6" fontWeight={700} mb={2}>
        Vista previa
      </Typography>

      <Box
        sx={{
          borderRadius: 6,
          height: 540,
          bgcolor: "#f7f5f8",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            bgcolor: "#075E54", // verde WhatsApp
            py: 1,
            px: 2,
            display: "flex",
            alignItems: "center",
            gap: 1.5,
          }}
        >
          {/* Avatar circular */}
          <Avatar
            src={logo} // 👈 aquí pones tu logo o un ícono de contacto
            alt="Contacto"
            sx={{
              width: 36,
              height: 36,
            }}
          />

          {/* Número + estado */}
          <Box>
            <Typography fontSize={14} color="white" fontWeight={600}>
              Linka (Tú)
            </Typography>
            <Typography fontSize={12} color="white" sx={{ opacity: 0.8 }}>
              Previsualización de mensajes masivos
            </Typography>
          </Box>
        </Box>

        {/* Contenedor de mensajes */}
        <Box
          sx={{
            flex: 1,
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "flex-start",
            px: 2,
            py: 3,
          }}
        >
          <Box
            sx={{
              bgcolor: "#dcf8c6",
              color: "black",
              borderRadius: 2,
              px: 2,
              py: 1,
              maxWidth: "75%",
              fontSize: 14,
              boxShadow: 1,
              wordBreak: "break-word",
            }}
          >
            <Typography sx={{ whiteSpace: "pre-line" }}>
              {mensaje ? parseMensaje(mensaje) : "Tu mensaje aparecerá aquí..."}
            </Typography>
            <Typography
              fontSize={12}
              sx={{ textAlign: "right", mt: 0.5, opacity: 0.7 }}
            >
              {horaActual}
            </Typography>
          </Box>
        </Box>

        {/* Input gris inferior */}
        <Box
          sx={{
            bgcolor: "#c9c8caff",
            height: 40,
            borderRadius: "20px",
            mx: 2,
            mb: 2,
          }}
        />
      </Box>
    </Paper>
  );
}
