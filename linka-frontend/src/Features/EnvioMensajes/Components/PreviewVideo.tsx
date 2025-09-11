// src/Features/Mensajes/components/PreviewVideo.tsx
import { Box, Typography, Paper, Avatar } from "@mui/material";
import logo from "../../../assets/Linka/Logos/Icon/PNG/Icon Blanco.png"
type Props = {
  caption: string;
  videoUrl: string;
};

export default function PreviewVideo({ caption, videoUrl }: Props) {
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
        sx={{ // igual que PreviewWhatsAppImagen
          borderRadius: 6,
          height: 632,
          bgcolor: "#f7f5f8",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Header */}
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


        {/* Mensaje con video */}
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
            {videoUrl ? (
              <Box
                component="video"
                src={videoUrl}
                controls
                sx={{
                  width: "100%",
                  borderRadius: 2,
                  mb: 1,
                }}
              />
            ) : (
              <Box
                sx={{
                  width: "100%",
                  height: 200,
                  bgcolor: "#eee",
                  borderRadius: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#888",
                  mb: 1,
                }}
              >
                Vista previa del video
              </Box>
            )}

            <Typography sx={{ whiteSpace: "pre-line" }}>
              {caption || "Aquí aparecerá el pie del video..."}
            </Typography>

            <Typography
              fontSize={12}
              sx={{ textAlign: "right", mt: 0.5, opacity: 0.7 }}
            >
              {horaActual}
            </Typography>
          </Box>
        </Box>

        {/* Input inferior */}
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
