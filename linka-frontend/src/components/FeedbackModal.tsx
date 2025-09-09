import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Box,
  useTheme,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import InfoIcon from "@mui/icons-material/Info";
import HelpIcon from "@mui/icons-material/Help"; // 👈 en vez de HelpOutlineIcon
import type { ReactNode } from "react";

type ModalType = "success" | "error" | "info" | "confirm";

export interface FeedbackModalProps {
  open: boolean;
  type: ModalType;
  title?: string;
  description?: ReactNode;
  confirmLabel?: string;   // Texto botón confirmar
  cancelLabel?: string;    // Texto botón cancelar (solo confirm)
  onConfirm?: () => void;
  onClose: () => void;
  loadingConfirm?: boolean; // Deshabilita/ muestra loading en confirmar
}

export default function FeedbackModal({
  open,
  type,
  title,
  description,
  confirmLabel,
  cancelLabel = "Cancelar",
  onConfirm,
  onClose,
  loadingConfirm = false,
}: FeedbackModalProps) {
  const theme = useTheme();

  // Ícono + color por tipo
  const map = {
    success: {
      icon: <CheckCircleIcon sx={{ fontSize: 100, color: theme.palette.success.main }} />,
      color: theme.palette.success.main,
      defaultTitle: "¡Operación exitosa!",
      defaultConfirm: "Aceptar",
      showCancel: false,
    },
    error: {
      icon: <HighlightOffIcon sx={{ fontSize: 100, color: theme.palette.error.main }} />,
      color: theme.palette.error.main,
      defaultTitle: "Ocurrió un error",
      defaultConfirm: "Aceptar",
      showCancel: false,
    },
    info: {
      icon: <InfoIcon sx={{ fontSize: 100, color: theme.palette.info.main }} />,
      color: theme.palette.info.main,
      defaultTitle: "Información",
      defaultConfirm: "Entendido",
      showCancel: false,
    },
    confirm: {
      icon: <HelpIcon sx={{ fontSize: 100, color: theme.palette.secondary.main }} />,
      color: theme.palette.secondary.main,
      defaultTitle: "¿Estás seguro?",
      defaultConfirm: "Aceptar",
      showCancel: true,
    },
  }[type];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
          p: { xs: 2, md: 3 },
          textAlign: "center",
          width:500
        },
      }}
    >
      <Box display="flex" justifyContent="center" mt={1} mb={1}>
        {map.icon}
      </Box>

      <DialogTitle sx={{ textAlign: "center", fontWeight: 700, fontSize: 35, width: '100%' }}>
        {title || map.defaultTitle}
      </DialogTitle>

      {description && (
        <DialogContent>
          <Typography variant="subtitle1" color="text.secondary">
            {description}
          </Typography>
        </DialogContent>
      )}

      <DialogActions sx={{ justifyContent: "center", gap: 2, pb: 3 }}>
        {map.showCancel && (
          <Button
            onClick={onClose}
            variant="contained"
            color="neutral" 
            sx={{ minWidth: 140 }}
          >
            {cancelLabel}
          </Button>
        )}

        <Button
          onClick={type === "confirm" ? onConfirm : onClose}
          variant="contained"
          color={type === "error" ? "error" : type === "success" ? "success" : "secondary"}
          sx={{ minWidth: 140 }}
          disabled={loadingConfirm}
        >
          {confirmLabel || map.defaultConfirm}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
