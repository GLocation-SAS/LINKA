// src/Features/HistorialMensajes/components/TablaHistorialMensajes.tsx
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Chip,
  Typography,
  IconButton,
  Tooltip,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import type { Mensaje } from "../services/historialMensajesService";

function formatFecha(fechaObj: { value: string } | string | null | undefined) {
  if (!fechaObj) return "—";
  const fechaISO =
    typeof fechaObj === "string" ? fechaObj : (fechaObj as any).value;
  if (!fechaISO) return "—";
  return new Date(fechaISO).toLocaleString();
}

interface Props {
  rows: Mensaje[];
  onVerDetalle: (idMensaje: string) => void;
}

export default function TablaHistorialMensajes({ rows, onVerDetalle }: Props) {
  return (
    <Paper sx={{ p: 2 }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontSize: "1rem", fontWeight: 600 }}>Campaña</TableCell>
            <TableCell sx={{ fontSize: "1rem", fontWeight: 600 }}>Contenido</TableCell>
            <TableCell sx={{ fontSize: "1rem", fontWeight: 600 }}>Tipo</TableCell>
            <TableCell sx={{ fontSize: "1rem", fontWeight: 600 }}>Estado</TableCell>
            <TableCell sx={{ fontSize: "1rem", fontWeight: 600 }}>Fecha envío</TableCell>
            <TableCell sx={{ fontSize: "1rem", fontWeight: 600 }}>Total contactos</TableCell>
            <TableCell sx={{ fontSize: "1rem", fontWeight: 600 }}>Acciones</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.length > 0 ? (
            rows.map((m) => (
              <TableRow key={m.idMensaje}>
                <TableCell sx={{ fontSize: "0.95rem" }}>{m.nombre_campana}</TableCell>

                {/* Contenido truncado */}
                <TableCell
                  sx={{
                    fontSize: "0.95rem",
                    maxWidth: 200,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                  title={m.contenido}
                >
                  {m.contenido}
                </TableCell>

                {/* Tipo */}
                <TableCell>
                  <Chip
                    label={m.tipo}
                    color={
                      m.tipo === "texto"
                        ? "info"
                        : m.tipo === "imagen"
                        ? "secondary"
                        : "primary"
                    }
                    size="small"
                    sx={{ fontWeight: 600 }}
                  />
                </TableCell>

                {/* Estado */}
                <TableCell>
                  <Chip
                    label={m.estado}
                    color={
                      m.estado === "Enviado"
                        ? "success"
                        : m.estado === "Pendiente"
                        ? "info"
                        : "error"
                    }
                    size="small"
                    sx={{ fontWeight: 600 }}
                  />
                </TableCell>

                {/* Fecha */}
                <TableCell sx={{ fontSize: "0.95rem" }}>
                  {formatFecha(m.fecha_envio as any)}
                </TableCell>

                {/* Total contactos */}
                <TableCell sx={{ fontSize: "0.95rem" }}>
                  {m.total_contactos_campana}
                </TableCell>

                {/* Acciones */}
                <TableCell>
                  <Tooltip title="Ver detalle mensaje" arrow>
                    <IconButton
                      color="info"
                      onClick={() => onVerDetalle(m.idMensaje)}
                    >
                      <VisibilityIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={7}>
                <Typography align="center" color="text.secondary">
                  No se encontraron mensajes
                </Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Paper>
  );
}
