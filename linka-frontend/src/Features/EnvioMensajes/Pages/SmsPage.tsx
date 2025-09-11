// src/Features/Mensajes/pages/SmsPage.tsx
import { Box, Grid, Stack, Typography } from "@mui/material";
import Layout from "../../../components/layout";
import StepDestinatarios from "../Components/StepDestinatarios";
import StepMensaje from "../Components/StepMensaje";
import StepEnviar from "../Components/StepEnviar";
import PreviewSMS from "../Components/PreviewSMS";
import { useState } from "react";
import { type ContactoIn } from "../../Audiencia/services/audienciasService";

export default function SmsPage() {
  const [campana, setCampana] = useState("");
  const [audiencia, setAudiencia] = useState("");
  const [total, setTotal] = useState(0);
  const [mensaje, setMensaje] = useState("");
  const [contactos, setContactos] = useState<ContactoIn[]>([]); // ✅ ahora ContactoIn

  return (
    <Layout>
      <Box>
        <Typography variant="h4" fontWeight={700}>
          Crea tu campaña para <span style={{ color: "#F38933" }}>SMS</span>
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
                setContactos={setContactos} // ✅ ya está tipado como Dispatch<SetStateAction<ContactoIn[]>>
              />

              <StepMensaje mensaje={mensaje} setMensaje={setMensaje} />

              <StepEnviar
                campana={campana}
                audiencia={audiencia}
                total={total}
                mensaje={mensaje}
                contactos={contactos} // ✅ también ContactoIn[]
              />
            </Stack>
          </Grid>

          {/* Panel derecho: Vista previa */}
          <Grid size={{ xs: 12, md: 3.5 }}>
            <PreviewSMS mensaje={mensaje} />
          </Grid>
        </Grid>
      </Box>
    </Layout>
  );
}
