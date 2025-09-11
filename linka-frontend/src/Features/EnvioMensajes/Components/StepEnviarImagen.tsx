// src/Features/Mensajes/components/StepEnviarImagen.tsx
import { Box, Button, Typography, Stack } from "@mui/material";
import { useState } from "react";
import { enviarWhatsAppImagen, crearMensaje } from "../Services/mensajesService";
import { type ContactoIn } from "../../Audiencia/services/audienciasService";
import SendIcon from "@mui/icons-material/Send";
import FeedbackModal from "../../../components/FeedbackModal";
import { useUser } from "../../../Context/UserContext";

type Props = {
    campana: string;
    audiencia: string;
    total: number;
    caption: string;
    imageUrl: string;
    contactos: ContactoIn[];
};

export default function StepEnviarImagen({
    campana,
    audiencia,
    caption,
    imageUrl,
    contactos,
}: Props) {
    const [modal, setModal] = useState<{
        open: boolean;
        type: "success" | "error" | "info" | "confirm";
        title?: string;
        description?: string;
        loadingConfirm?: boolean;
    }>({ open: false, type: "info" });

    const { uid } = useUser();
    const handleEnviar = () => {
        setModal({
            open: true,
            type: "confirm",
            title: "¿Enviar campaña con imagen?",
            description: "¿Seguro que deseas enviar esta campaña de WhatsApp con imagen?",
        });
    };
    const confirmEnviar = async () => {
        try {
            if (!contactos.length || !imageUrl) {
                setModal({
                    open: true,
                    type: "error",
                    title: "Datos incompletos",
                    description: "Debes seleccionar contactos y adjuntar una imagen.",
                });
                return;
            }

            // Loader
            setModal({
                open: true,
                type: "info",
                loadingConfirm: true,
                title: "Enviando campaña...",
                description: "Estamos enviando las imágenes, por favor espera.",
            });

            const numeros = contactos.map((c) =>
                c.numero_contacto.startsWith("+")
                    ? c.numero_contacto.substring(1)
                    : c.numero_contacto
            );

            const resp = await enviarWhatsAppImagen(imageUrl, numeros, caption);
            const msg = resp.message as string;

            // 🔎 Regex flexible
            const match = msg.match(/(?:Mensajes|Imágenes|Videos) (?:enviados|enviadas):\s*(\d+),\s*con errores:\s*(\d+)/);

            if (match) {
                const enviados = parseInt(match[1], 10);
                const errores = parseInt(match[2], 10);

                // ❌ Ninguno enviado
                if (enviados === 0) {
                    setModal({
                        open: true,
                        type: "error",
                        title: "Error en el envío",
                        description: msg || "No se pudo enviar ninguna imagen. Intenta nuevamente.",
                    });
                    return;
                }

                // ⚠️ Algunos enviados pero con errores
                if (enviados > 0 && errores > 0) {
                    setModal({
                        open: true,
                        type: "info",
                        title: "Atención",
                        description: msg,
                    });
                    return; // no guardar aún
                }

                // ✅ Todos enviados correctamente
                if (enviados > 0 && errores === 0) {
                    await crearMensaje({
                        idCampana: campana,
                        idUsuario: uid,
                        idContacto: audiencia,
                        contenido: caption,
                        tipo: "imagen",
                        url_contenido: imageUrl,
                    });

                    setModal({
                        open: true,
                        type: "success",
                        title: "¡Enviado con éxito!",
                        description: msg || "La campaña fue enviada correctamente.",
                    });
                    return;
                }
            }

            // Fallback
            setModal({
                open: true,
                type: "error",
                title: "Respuesta inesperada",
                description: msg || "El servidor devolvió un formato no reconocido.",
            });
        } catch (error) {
            console.error("❌ Error enviando imagen:", error);
            setModal({
                open: true,
                type: "error",
                title: "Error al enviar",
                description: "Ocurrió un error al enviar la campaña. Intenta nuevamente.",
            });
        }
    };




    return (
        <Box p={3} bgcolor="white" borderRadius={2}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Box>
                    <Typography variant="h6" fontWeight={700}>
                        3. Enviar Campaña
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Cuando todo esté listo, ¡lanza tu campaña!
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    color="secondary"
                    onClick={handleEnviar}
                    disabled={!campana || !audiencia || !caption || !imageUrl || contactos.length === 0}
                    startIcon={<SendIcon />}
                    sx={{ px: 4, py: 1.5 }}
                >
                    Enviar
                </Button>
            </Stack>

            {/* Modal */}
            <FeedbackModal
                open={modal.open}
                type={modal.type}
                title={modal.title}
                description={modal.description}
                loadingConfirm={modal.loadingConfirm}
                onConfirm={
                    modal.type === "info" && modal.title === "Atención"
                        ? confirmEnviar // 👈 botón reintentar
                        : confirmEnviar
                }
                confirmLabel={
                    modal.type === "info" && modal.title === "Atención"
                        ? "Reintentar"
                        : undefined
                }
                onClose={() => setModal((prev) => ({ ...prev, open: false }))}
            />

        </Box>
    );
}
