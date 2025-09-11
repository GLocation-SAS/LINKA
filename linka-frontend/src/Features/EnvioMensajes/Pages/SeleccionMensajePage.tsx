// src/Features/Mensajes/pages/SeleccionMensajePage.tsx
import { Box, Grid, Typography, Card, CardContent, Stack } from "@mui/material";
import SmsIcon from "@mui/icons-material/Sms";
import ChatIcon from "@mui/icons-material/Chat";
import ImageIcon from "@mui/icons-material/Image";
import VideocamIcon from "@mui/icons-material/Videocam";
import Layout from "../../../components/layout";
import { useNavigate } from "react-router-dom";

export default function SeleccionMensajePage() {
    const navigate = useNavigate();

    const opciones = [
        {
            icon: <SmsIcon fontSize="inherit" />,
            titulo: "SMS",
            descripcion: "Envía mensajes de texto",
            ruta: "/EnvioMensajes/SMS",
        },
        {
            icon: <ChatIcon fontSize="inherit" />,
            titulo: "WhatsApp Texto",
            descripcion: "Comunícate por WhatsApp por solo texto",
            ruta: "/EnvioMensajes/WhatsAppTexto",
        },
        {
            icon: <ImageIcon fontSize="inherit" />,
            titulo: "WhatsApp Imagen",
            descripcion: "Envía imágenes y mensajes de texto",
            ruta: "/EnvioMensajes/WhatsAppImagen",
        },
        {
            icon: <VideocamIcon fontSize="inherit" />,
            titulo: "WhatsApp Video",
            descripcion: "Comparte videos",
            ruta: "/EnvioMensajes/WhatsAppVideo",
        },
    ];

    return (
        <Layout>
            <Box p={4} mt={7} >
                {/* Título */}
                <Stack spacing={1} textAlign="center" mb={6}>
                    <Typography variant="h4" fontWeight={700}>
                        Crear un Nuevo Envío
                    </Typography>
                    <Typography fontSize={16} color="text.secondary">
                        Selecciona el tipo de envío masivo que deseas realizar.
                        Cada opción está diseñada para un impacto máximo.
                    </Typography>
                </Stack>

                {/* Grid de opciones */}
                <Box width={"89%"} mx={"auto"} mt={5}>
                    <Grid container spacing={4} justifyContent="center">
                        {opciones.map((op, i) => (
                            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={i}>
                                <Card
                                    onClick={() => navigate(op.ruta)}
                                    sx={{
                                        borderRadius: 4,
                                        minHeight: 400, // 👈 mismo tamaño mínimo
                                        cursor: "pointer",
                                        transition: "all 0.25s ease",
                                        border: "2px solid",
                                        borderColor: "grey.300",
                                        textAlign: "center",
                                        display: "flex", // 👈 flex para igualar alturas
                                        flexDirection: "column",
                                        justifyContent: "center",

                                        "& .icono": { color: "grey.500" },
                                        "& .descripcion": { color: "grey.600", fontSize: 15 },

                                        "&:hover": {
                                            borderColor: "secondary.main",
                                            "& .icono": { color: "secondary.main" },
                                            "& .titulo": { color: "secondary.main" },
                                        },

                                        "&:active": {
                                            bgcolor: "secondary.main",
                                            borderColor: "secondary.main",
                                            "& .icono": { color: "white" },
                                            "& .titulo": { color: "white" },
                                            "& .descripcion": { color: "white" },
                                        },
                                    }}
                                >
                                    <CardContent sx={{ flexGrow: 1, p: 5 }}>
                                        <Stack spacing={3} alignItems="center" justifyContent="center" height="100%">
                                            <Box className="icono" sx={{ fontSize: 90, marginTop: "20% !important" }}>
                                                {op.icon}
                                            </Box>
                                            <Typography variant="h6" fontWeight={700} color="info" className="titulo" sx={{marginTop: "0% !important"}}>
                                                {op.titulo}
                                            </Typography>
                                            <Typography className="descripcion" sx={{marginTop: "0% !important"}}>
                                                {op.descripcion}
                                            </Typography>
                                        </Stack>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            </Box>
        </Layout>
    );
}
