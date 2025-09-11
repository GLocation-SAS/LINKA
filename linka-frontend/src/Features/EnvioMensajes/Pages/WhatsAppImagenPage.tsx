// src/Features/Mensajes/pages/WhatsAppImagenPage.tsx
import { Box, Grid, Stack, Typography } from "@mui/material";
import Layout from "../../../components/layout";
import StepDestinatarios from "../Components/StepDestinatarios";
import StepMensajeImagen from "../Components/StepMensajeImagen";
import StepEnviarImagen from "../Components/StepEnviarImagen";
import PreviewWhatsAppImagen from "../Components/PreviewWhatsAppImagen";
import { useState } from "react";
import { type ContactoIn } from "../../Audiencia/services/audienciasService";

export default function WhatsAppImagenPage() {
  const [campana, setCampana] = useState("");
  const [audiencia, setAudiencia] = useState("");
  const [total, setTotal] = useState(0);
  const [caption, setCaption] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [contactos, setContactos] = useState<ContactoIn[]>([]);

  return (
    <Layout>
      <Box>
        <Typography variant="h4" fontWeight={700}>
          Crea tu campaña para{" "}
          <span style={{ color: "#F38933" }}>WhatsApp Imagen</span>
        </Typography>
        <Typography fontSize={16} color="text.secondary" mb={3}>
          Sigue los pasos para crear y enviar tu campaña
        </Typography>

        <Grid container spacing={3}>
          {/* Panel izquierdo */}
          <Grid size={{ xs: 12, md: 8.5 }}>
            <Stack spacing={3}>
              <StepDestinatarios
                campana={campana}
                setCampana={setCampana}
                audiencia={audiencia}
                setAudiencia={setAudiencia}
                total={total}
                setTotal={setTotal}
                contactos={contactos}
                setContactos={setContactos}
              />

              <StepMensajeImagen
                caption={caption}
                setCaption={setCaption}
                imageUrl={imageUrl}
                setImageUrl={setImageUrl}
              />

              <StepEnviarImagen
                campana={campana}
                audiencia={audiencia}
                total={total}
                caption={caption}
                imageUrl={imageUrl}
                contactos={contactos}
              />
            </Stack>
          </Grid>

          {/* Panel derecho: Vista previa */}
          <Grid size={{ xs: 12, md: 3.5 }}>
            <PreviewWhatsAppImagen caption={caption} imageUrl={imageUrl} />
          </Grid>
        </Grid>
      </Box>
    </Layout>
  );
}
