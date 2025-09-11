// src/Features/Mensajes/components/StepEnviar.tsx
import { Box, Button, Typography, Stack } from "@mui/material";
import { useState } from "react";
import { enviarSmsMasivo, crearMensaje } from "../Services/mensajesService";
import { type ContactoIn } from "../../Audiencia/services/audienciasService";
import SendIcon from "@mui/icons-material/Send";
import FeedbackModal from "../../../components/FeedbackModal";
import { useUser } from "../../../Context/UserContext"; // 👈 para obtener uid del usuario

type Props = {
  campana: string;
  audiencia: string;
  total: number;
  mensaje: string;
  contactos: ContactoIn[];
};

export default function StepEnviar({
  campana,
  audiencia,
  mensaje,
  contactos,
}: Props) {
  const { uid } = useUser(); // 👈 obtenemos usuario logueado

  const [modal, setModal] = useState<{
    open: boolean;
    type: "success" | "error" | "info" | "confirm";
    title?: string;
    description?: string;
    loadingConfirm?: boolean;
  }>({ open: false, type: "info" });

  const handleEnviar = () => {
    setModal({
      open: true,
      type: "confirm",
      title: "¿Enviar campaña?",
      description:
        "¿Estás seguro de que deseas enviar esta campaña a los contactos seleccionados?",
    });
  };

  const confirmEnviar = async () => {
    try {
      if (!contactos.length) {
        setModal({
          open: true,
          type: "error",
          title: "Sin contactos",
          description: "No hay contactos disponibles para enviar SMS.",
        });
        return;
      }

      // Mostrar loader
      setModal({
        open: true,
        type: "info",
        loadingConfirm: true,
        title: "Enviando campaña...",
        description: "Estamos enviando los mensajes, por favor espera.",
      });

      // ✅ limpiar "+" antes de enviar
      const numeros = contactos.map((c) =>
        c.numero_contacto.startsWith("+")
          ? c.numero_contacto.substring(1)
          : c.numero_contacto
      );

      // Enviar SMS
      const resp = await enviarSmsMasivo(mensaje, numeros);
      const msg = resp.message as string;

      // Extraer valores de enviados y errores
      const match = msg.match(/Mensajes enviados:\s*(\d+),\s*con errores:\s*(\d+)/);

      if (match) {
        const enviados = parseInt(match[1], 10);
        const errores = parseInt(match[2], 10);

        // ❌ Ninguno enviado
        if (enviados === 0) {
          setModal({
            open: true,
            type: "error",
            title: "Error en el envío",
            description: msg || "No se pudo enviar ningún mensaje. Intenta nuevamente.",
          });
          return; // no guardar
        }

        // ⚠️ Algunos enviados, pero con errores
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
            contenido: mensaje,
            tipo: "texto",
          });

          setModal({
            open: true,
            type: "success",
            title: "¡Enviado con éxito!",
            description: msg || "La campaña fue enviada a todos los contactos.",
          });
          return;
        }
      }

      // Fallback: si no matchea el formato esperado
      setModal({
        open: true,
        type: "error",
        title: "Respuesta inesperada",
        description: msg || "El servidor devolvió un formato no reconocido.",
      });

    } catch (error) {
      console.error("❌ Error enviando SMS:", error);
      setModal({
        open: true,
        type: "error",
        title: "Error al enviar",
        description:
          "Ocurrió un error al enviar los SMS o al registrar el mensaje. Intenta nuevamente.",
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
          disabled={!campana || !audiencia || !mensaje || contactos.length === 0}
          startIcon={<SendIcon />}
          sx={{
            px: 4,
            py: 1.5,
          }}
        >
          Enviar
        </Button>
      </Stack>

      {/* Modal de feedback */}
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
