// src/Features/Mensajes/pages/WhatsappTextoPage.tsx
import { Box, Grid, Stack, Typography } from "@mui/material";
import Layout from "../../../components/layout";
import StepDestinatarios from "../Components/StepDestinatarios";
import StepMensaje from "../Components/StepMensaje";
import StepEnviarWhatsapp from "../Components/StepEnviarWhatsapp";
import { useState } from "react";
import { type ContactoIn } from "../../Audiencia/services/audienciasService";
import PreviewWhatsApp from "../Components/PreviewWhatsAppTexto";

export default function WhatsappTextoPage() {
  const [campana, setCampana] = useState("");
  const [audiencia, setAudiencia] = useState("");
  const [total, setTotal] = useState(0);
  const [mensaje, setMensaje] = useState("");
  const [contactos, setContactos] = useState<ContactoIn[]>([]);

  return (
    <Layout>
      <Box>
        <Typography variant="h4" fontWeight={700}>
          Crea tu campaña para{" "}
          <span style={{ color: "#F38933" }}>WhatsApp Texto</span>
        </Typography>
        <Typography fontSize={16} color="text.secondary" mb={3}>
          Sigue los pasos para crear y enviar tu campaña de WhatsApp Texto
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

              <StepMensaje mensaje={mensaje} setMensaje={setMensaje} />

              <StepEnviarWhatsapp
                campana={campana}
                audiencia={audiencia}
                total={total}
                mensaje={mensaje}
                contactos={contactos}
              />
            </Stack>
          </Grid>

          {/* Panel derecho: Vista previa */}
          <Grid size={{ xs: 12, md: 3.5 }}>
            <PreviewWhatsApp mensaje={mensaje} />
          </Grid>
        </Grid>
      </Box>
    </Layout>
  );
}
