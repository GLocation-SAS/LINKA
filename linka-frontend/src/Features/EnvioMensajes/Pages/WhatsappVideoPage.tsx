// src/Features/Mensajes/pages/WhatsappVideoPage.tsx
import { Box, Grid, Stack, Typography } from "@mui/material";
import Layout from "../../../components/layout";
import StepDestinatarios from "../Components/StepDestinatarios";
import StepMensajeVideo from "../Components/StepMensajeVideo";
import StepEnviarVideo from "../Components/StepEnviarVideo";
import PreviewVideo from "../Components/PreviewVideo";
import { useState } from "react";
import { type ContactoIn } from "../../Audiencia/services/audienciasService";

export default function WhatsappVideoPage() {
    const [campana, setCampana] = useState("");
    const [audiencia, setAudiencia] = useState("");
    const [total, setTotal] = useState(0);
    const [caption, setCaption] = useState("");
    const [videoUrl, setVideoUrl] = useState("");
    const [contactos, setContactos] = useState<ContactoIn[]>([]);

    return (
        <Layout>
            <Box>
                <Typography variant="h4" fontWeight={700}>
                    Crea tu campaña para{" "}
                    <span style={{ color: "#F38933" }}>WhatsApp Video</span>
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

                            <StepMensajeVideo
                                caption={caption}
                                setCaption={setCaption}
                                videoUrl={videoUrl}
                                setVideoUrl={setVideoUrl}
                            />

                            <StepEnviarVideo
                                campana={campana}
                                audiencia={audiencia}
                                total={total}
                                caption={caption}
                                videoUrl={videoUrl}
                                contactos={contactos}
                            />
                        </Stack>
                    </Grid>

                    {/* Panel derecho: Vista previa */}
                    <Grid size={{ xs: 12, md: 3.5 }}>
                        <PreviewVideo videoUrl={videoUrl} caption={caption} />
                    </Grid>
                </Grid>
            </Box>
        </Layout>
    );
}
