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
import InfoIcon from "@mui/icons-material/Info";
import HelpIcon from "@mui/icons-material/Help";
import CancelIcon from "@mui/icons-material/Cancel";
import type { ReactNode } from "react";
import loadingGif from "../assets/Linka/GIF/GifLinka.gif"; // 👈 usa el GIF

type ModalType = "success" | "error" | "info" | "confirm";

export interface FeedbackModalProps {
  open: boolean;
  type: ModalType;
  title?: string;
  description?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;
  onClose: () => void;
  loadingConfirm?: boolean;
  loadingTitle?: string;
  loadingDescription?: ReactNode;
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
  loadingTitle,
  loadingDescription,
}: FeedbackModalProps) {
  const theme = useTheme();

  const map = {
    success: {
      icon: <CheckCircleIcon sx={{ fontSize: 100, color: theme.palette.success.main }} />,
      color: theme.palette.success.main,
      defaultTitle: "¡Operación exitosa!",
      defaultConfirm: "Aceptar",
      showCancel: false,
    },
    error: {
      icon: <CancelIcon sx={{ fontSize: 100, color: theme.palette.error.main }} />,
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

  const effectiveTitle = loadingConfirm
    ? (loadingTitle ?? "Cargando...")
    : (title ?? map.defaultTitle);

  const effectiveDescription = loadingConfirm
    ? (loadingDescription ?? "Danos un momento estamos procesando tus datos.")
    : description;

  // 👇 Loader usando GIF (sin SVG/CSS)
  const LoaderRing = (
    <Box
      role="progressbar"
      aria-label="Cargando"
      sx={{
        width: 140,
        height: 140,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Box
        component="img"
        src={loadingGif}
        alt="Cargando"
        sx={{ width: 120, height: 120, objectFit: "contain" }}
      />
    </Box>
  );

  return (
    <Dialog
      open={open}
      disableEscapeKeyDown={loadingConfirm}
      onClose={(_event, reason) => {
        if (loadingConfirm && (reason === "backdropClick" || reason === "escapeKeyDown")) return;
        onClose();
      }}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
          p: { xs: 2, md: 3 },
          textAlign: "center",
          width: 500,
          bgcolor: "#ffffffff",
        },
      }}
    >
      <Box display="flex" justifyContent="center" mt={1} mb={1}>
        {loadingConfirm ? LoaderRing : map.icon}
      </Box>

      <DialogTitle sx={{ textAlign: "center", fontWeight: 800, fontSize: 32, width: "100%" }}>
        {effectiveTitle}
      </DialogTitle>

      {effectiveDescription && (
        <DialogContent>
          <Typography variant="subtitle1" color="text.secondary">
            {effectiveDescription}
          </Typography>
        </DialogContent>
      )}

      {!loadingConfirm && (
        <DialogActions sx={{ justifyContent: "center", gap: 2, pb: 3 }}>
          {map.showCancel && (
            <Button onClick={onClose} variant="contained" color="neutral" sx={{ minWidth: 140 }}>
              {cancelLabel}
            </Button>
          )}

          <Button
            onClick={type === "confirm" ? onConfirm : onClose}
            variant="contained"
            color={
              type === "error"
                ? "error"
                : type === "success"
                  ? "success"
                  : type === "info"
                    ? "info"
                    : "secondary"
            }
            sx={{ minWidth: 140 }}
          >
            {confirmLabel || map.defaultConfirm}
          </Button>

        </DialogActions>
      )}
    </Dialog>
  );
}
