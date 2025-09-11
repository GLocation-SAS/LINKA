// src/Features/HistorialMensajes/components/VerDetalleMensajeDialog.tsx
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Typography,
    Button,
    Stack,
    Chip,
    Box,
    Grid,
    Divider,
    Link,
} from "@mui/material";
import type { Mensaje } from "../services/historialMensajesService";
import Loading from "../../../components/Loading";

interface Props {
    open: boolean;
    onClose: () => void;
    mensaje: Mensaje | null;
    loading: boolean;
}

// 🔗 Helper: detecta URLs y las convierte en <Link>
function parseContenido(text: string) {
    if (!text) return null;

    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);

    return parts.map((part, i) =>
        urlRegex.test(part) ? (
            <Link
                key={i}
                href={part}
                target="_blank"
                rel="noopener noreferrer"
                color="secondary"
                underline="hover"
                sx={{ wordBreak: "break-word" }}
            >
                {part}
            </Link>
        ) : (
            <span key={i}>{part}</span>
        )
    );
}

export default function VerDetalleMensajeDialog({
    open,
    onClose,
    mensaje,
    loading,
}: Props) {
    const renderContenido = () => {
        if (!mensaje) return null;

        // 📸 Si hay multimedia
        if (mensaje.url_contenido) {
            return (
                <Box
                    sx={{
                        border: "1px solid",
                        borderColor: "grey.300",
                        borderRadius: 2,
                        p: 2,
                        bgcolor: "background.paper",
                    }}
                >
                    {/* Contenedor fijo para imagen/video */}
                    <Box
                        sx={{
                            width: "100%",
                            maxHeight: 400,
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            overflow: "hidden",
                            borderRadius: 2,
                            mb: mensaje.contenido ? 2 : 0
                        }}
                    >
                        {mensaje.tipo === "imagen" && (
                            <Box
                                component="img"
                                src={mensaje.url_contenido}
                                alt="contenido"
                                sx={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover", // 👈 ajusta al box
                                }}
                            />
                        )}

                        {mensaje.tipo === "video" && (
                            <Box
                                component="video"
                                src={mensaje.url_contenido}
                                controls
                                sx={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover", // 👈 ajusta al box
                                }}
                            />
                        )}
                    </Box>

                    {/* Texto del contenido */}
                    {mensaje.contenido && (
                        <Typography
                            variant="body1"
                            sx={{ whiteSpace: "pre-line", fontSize: "0.95rem" }}
                        >
                            {parseContenido(mensaje.contenido)}
                        </Typography>
                    )}
                </Box>
            );
        }

        // 📝 Solo texto
        return (
            <Box
                sx={{
                    border: "1px solid",
                    borderColor: "grey.300",
                    borderRadius: 2,
                    p: 2,
                    bgcolor: "background.paper",
                }}
            >
                <Typography
                    variant="body1"
                    sx={{ whiteSpace: "pre-line", fontSize: "0.95rem" }}
                >
                    {parseContenido(mensaje.contenido)}
                </Typography>
            </Box>
        );
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ fontWeight: 700, fontSize: "1.25rem", pb: 1 }}>
                Detalle del Mensaje
            </DialogTitle>
            <Divider />

            <DialogContent dividers>
                {loading ? (
                    <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                        <Loading height="100px" />
                    </Box>
                ) : (
                    mensaje && (
                        <Stack spacing={3}>
                            {/* Info principal */}
                            <Grid container spacing={2}>
                                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                    <Typography variant="subtitle2" fontWeight={600}>
                                        Campaña
                                    </Typography>
                                    <Typography color="text.secondary">
                                        {mensaje.nombre_campana}
                                    </Typography>
                                </Grid>

                                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                    <Typography variant="subtitle2" fontWeight={600}>
                                        Tipo de envío
                                    </Typography>
                                    <Typography color="text.secondary">
                                        {mensaje.tipo.charAt(0).toUpperCase() + mensaje.tipo.slice(1)}
                                    </Typography>
                                </Grid>

                                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                    <Typography variant="subtitle2" fontWeight={600}>
                                        Estado
                                    </Typography>
                                    <Chip
                                        label={mensaje.estado}
                                        color={
                                            mensaje.estado.toLowerCase() === "enviado"
                                                ? "success"
                                                : mensaje.estado.toLowerCase() === "pendiente"
                                                    ? "info"
                                                    : "error"
                                        }
                                        size="small"
                                        sx={{ fontWeight: 600, mt: 0.5 }}
                                    />
                                </Grid>

                                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                    <Typography variant="subtitle2" fontWeight={600}>
                                        Fecha Envío
                                    </Typography>
                                    <Typography color="text.secondary">
                                        {new Date(
                                            (mensaje.fecha_envio as any)?.value || mensaje.fecha_envio
                                        ).toLocaleString()}
                                    </Typography>
                                </Grid>

                                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                    <Typography variant="subtitle2" fontWeight={600}>
                                        Total contactos campaña
                                    </Typography>
                                    <Typography color="text.secondary">
                                        {mensaje.total_contactos_campana}
                                    </Typography>
                                </Grid>
                            </Grid>

                            {/* Contenido */}
                            <Box>
                                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                                    Contenido
                                </Typography>
                                {renderContenido()}
                            </Box>
                        </Stack>
                    )
                )}
            </DialogContent>

            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button
                    onClick={onClose}
                    color="secondary"
                    variant="contained"
                    sx={{ borderRadius: 2, fontWeight: 600, px: 4 }}
                >
                    Cerrar
                </Button>
            </DialogActions>
        </Dialog>
    );
}
