// src/Features/Mensajes/components/StepMensajeVideo.tsx
import { Box, Typography, TextField, Button, Grid } from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { useState } from "react";
import { getSignedUrl } from "../Services/mensajesService"; // 👈 nuevo endpoint
import axios from "axios";
import FeedbackModal from "../../../components/FeedbackModal";

type Props = {
  caption: string;
  setCaption: (v: string) => void;
  videoUrl: string;
  setVideoUrl: (v: string) => void;
};

export default function StepMensajeVideo({
  caption,
  setCaption,
  videoUrl,
  setVideoUrl,
}: Props) {
  const [modal, setModal] = useState<{
    open: boolean;
    type: "success" | "error" | "info" | "confirm";
    title?: string;
    description?: string;
    loadingConfirm?: boolean;
  }>({ open: false, type: "info" });

  const MAX_SIZE = 150 * 1024 * 1024; // 150 MB

  // 📂 Subir archivo local con Signed URL
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_SIZE) {
      setModal({
        open: true,
        type: "error",
        title: "Archivo demasiado grande",
        description: "El video supera los 150 MB permitidos.",
      });
      return;
    }

    // Mostrar modal de carga
    setModal({
      open: true,
      type: "info",
      loadingConfirm: true,
      title: "Subiendo video...",
      description: "Estamos subiendo tu video, esto puede demorar unos minutos.",
    });

    try {
      // 👇 limpiar nombre: quitar espacios y reemplazar por "_"
      const cleanName = file.name.replace(/\s+/g, "_");

      // 1️⃣ Pedimos Signed URL a nuestro backend con el nombre limpio
      const { url } = await getSignedUrl(cleanName, file.type);


      // 2️⃣ Subimos el archivo directamente a GCS
      await axios.put(url, file, {
        headers: { "Content-Type": file.type },
      });

      // 3️⃣ Guardamos la URL pública sin query params
      const publicUrl = url.split("?")[0];
      setVideoUrl(publicUrl);

      setModal({
        open: true,
        type: "success",
        title: "¡Video subido!",
        description: "El video se ha subido correctamente.",
      });
    } catch (error) {
      console.error("❌ Error subiendo video:", error);
      setModal({
        open: true,
        type: "error",
        title: "Error al subir",
        description: "No se pudo subir el video. Intenta nuevamente.",
      });
    }
  };

  // 🔗 Validar URL manual
  const handleUrlChange = async (url: string) => {
    setVideoUrl(url);
    if (!url) return;

    try {
      const resp = await axios.head(url);
      const size = parseInt(resp.headers["content-length"] || "0", 10);
      if (size > MAX_SIZE) {
        setModal({
          open: true,
          type: "error",
          title: "URL inválida",
          description: "El video en la URL supera los 150 MB permitidos.",
        });
        setVideoUrl("");
      }
    } catch (err) {
      console.warn("⚠️ No se pudo verificar tamaño del video remoto:", err);
    }
  };

  return (
    <>
      <Box p={3} bgcolor="white" borderRadius={2}>
        <Typography variant="h6" fontWeight={700}>
          2. Mensaje
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={2}>
          Redacta el pie de video y adjunta el archivo o una URL pública
        </Typography>

        {/* Caption */}
        <Box mb={2}>
          <Typography fontWeight={600} mb={1}>
            Pie de video
          </Typography>
          <TextField
            placeholder="Escribe aquí..."
            multiline
            minRows={3}
            fullWidth
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
          />
        </Box>

        {/* Adjuntar Video */}
        <Box>
          <Typography fontWeight={600} mb={1}>
            Adjuntar Video
          </Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, md: 4 }}>
              <Button
                component="label"
                variant="contained"
                color="secondary"
                startIcon={<CloudUploadIcon />}
                sx={{
                  textTransform: "none",
                  fontWeight: 600,
                  bgcolor: "rgba(243,137,51,0.1)",
                  color: "#F38933",
                  border: "1px dashed #F38933",
                  width: "100%",
                  "&:hover": { bgcolor: "rgba(243,137,51,0.2)" },
                }}
              >
                Subir video
                <input
                  type="file"
                  accept="video/*"
                  hidden
                  onChange={handleFileUpload}
                />
              </Button>
            </Grid>

            {/* Campo URL manual */}
            <Grid size={{ xs: 12, md: 8 }}>
              <TextField
                fullWidth
                placeholder="o pega una URL pública aquí..."
                value={videoUrl}
                onChange={(e) => handleUrlChange(e.target.value)}
              />
            </Grid>
          </Grid>
        </Box>
      </Box>

      {/* Feedback Modal */}
      <FeedbackModal
        open={modal.open}
        type={modal.type}
        title={modal.title}
        description={modal.description}
        loadingConfirm={modal.loadingConfirm}
        onClose={() => setModal((prev) => ({ ...prev, open: false }))}
      />
    </>
  );
}
