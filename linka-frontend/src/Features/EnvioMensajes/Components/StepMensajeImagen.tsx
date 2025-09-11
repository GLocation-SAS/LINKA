// src/Features/Mensajes/components/StepMensajeImagen.tsx
import { Box, Typography, TextField, Button, Grid } from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { useState } from "react";
import { subirArchivo } from "../Services/mensajesService";

type Props = {
    caption: string;
    setCaption: (v: string) => void;
    imageUrl: string;
    setImageUrl: (v: string) => void;
};

export default function StepMensajeImagen({
    caption,
    setCaption,
    imageUrl,
    setImageUrl,
}: Props) {
    const [loadingUpload, setLoadingUpload] = useState(false);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setLoadingUpload(true);

            // 👇 limpiar nombre: quitar espacios y reemplazar por "_"
            const cleanName = file.name.replace(/\s+/g, "_");
            const renamedFile = new File([file], cleanName, { type: file.type });

            // 👈 subimos al backend
            const url = await subirArchivo(renamedFile);
            setImageUrl(url); // 👈 asignamos la URL pública
        } catch (err) {
            console.error("❌ Error subiendo archivo:", err);
        } finally {
            setLoadingUpload(false);
        }
    };


    return (
        <Box p={3} bgcolor="white" borderRadius={2}>
            <Typography variant="h6" fontWeight={700}>
                2. Mensaje
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>
                Redacta tu mensaje y adjunta una imagen
            </Typography>

            {/* Caption */}
            <Box mb={2}>
                <Typography fontWeight={600} mb={1}>
                    Pie de foto
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

            {/* Subida de archivo y URL */}
            <Box>
                <Box>
                    <Typography fontWeight={600} mb={1}>
                        Adjuntar Imagen
                    </Typography>
                    <Grid container spacing={2} alignItems="center">
                        {/* Botón de subir archivo */}
                        <Grid size={{ xs: 12, md: 4 }}>
                            <Button
                                component="label"
                                variant="contained"
                                color="secondary"
                                startIcon={<CloudUploadIcon />}
                                disabled={loadingUpload}
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
                                {loadingUpload ? "Subiendo..." : "Subir imagen"}
                                <input
                                    type="file"
                                    accept="image/*"
                                    hidden
                                    onChange={handleFileUpload}
                                />
                            </Button>
                        </Grid>

                        {/* Campo para pegar URL manual */}
                        <Grid size={{ xs: 12, md: 8 }}>
                            <TextField
                                fullWidth
                                placeholder="o pega una URL pública aquí..."
                                value={imageUrl}
                                onChange={(e) => setImageUrl(e.target.value)}
                            />
                        </Grid>
                    </Grid>
                </Box>
            </Box>
        </Box>
    );
}
