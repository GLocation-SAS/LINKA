// src/Features/Mensajes/components/PreviewSMS.tsx
import { Box, Typography, Paper, Link, Avatar } from "@mui/material";
import logo from "../../../assets/Linka/Logos/Icon/PNG/Icon Alternativo.png"

type Props = {
  mensaje: string;
};

// 👇 función que parsea texto + URLs
const parseMessage = (mensaje: string) => {
  if (!mensaje) return ["Tu mensaje aparecerá aquí..."];

  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = mensaje.split(urlRegex);

  return parts.map((part, index) => {
    if (part.match(urlRegex)) {
      return (
        <Link
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          underline="hover"
          sx={{ color: "#BBDEFB", wordBreak: "break-word" }}
        >
          {part}
        </Link>
      );
    }
    return <span key={index}>{part}</span>;
  });
};

export default function PreviewSMS({ mensaje }: Props) {
  return (
    <Paper sx={{ p: 2, borderRadius: 3 }}>
      <Typography variant="h6" fontWeight={700} mb={2}>
        Vista previa
      </Typography>

      <Box
        sx={{ // borde simulando marco del celular
          borderRadius: 6,
          height: 540,
          bgcolor: "#f7f5f8", // fondo claro
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            bgcolor: "#306C92",
            py: 1,
            px: 2,
            display: "flex",
            alignItems: "center",
            gap: 1.5,
          }}
        >
          {/* Avatar circular con logo */}
          <Avatar
            src={logo}
            alt="Linka"
            sx={{
              width: 36,
              height: 36
            }}
          />

          {/* Título + subtítulo */}
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
            alignItems: "flex-start",
            justifyContent: "flex-end",
            px: 2,
            py: 3,
          }}
        >
          <Box
            sx={{
              bgcolor: "#E06705", // color burbuja
              color: "white",
              borderRadius: 2,
              px: 2,
              py: 1,
              maxWidth: "75%",
              fontSize: 14,
              boxShadow: 1,
              whiteSpace: "pre-line", // 👈 respeta saltos de línea
              wordBreak: "break-word", // 👈 evita desbordes
            }}
          >
            <Typography sx={{ whiteSpace: "pre-line" }}>
              {parseMessage(mensaje)}
            </Typography>
            <Typography
              fontSize={12}
              sx={{ textAlign: "right", mt: 0.5, opacity: 0.8 }}
            >
              {new Date().toLocaleTimeString("es-CO", {
                hour: "numeric",
                minute: "2-digit",
              })}
            </Typography>

          </Box>
        </Box>

        {/* Input gris inferior */}
        <Box
          sx={{
            bgcolor: "#306C92",
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
