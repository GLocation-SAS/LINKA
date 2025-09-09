import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Typography,
} from "@mui/material";
import type { HistorialItem } from "../services/historialService";

interface Props {
  rows: HistorialItem[];
}

function getFechaISO(f: any): string | undefined {
  if (!f) return undefined;
  if (typeof f === "string") return f;
  if (typeof f === "object" && f?.value) return f.value;
  return undefined;
}

function formatFecha(f: any) {
  const iso = getFechaISO(f);
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleString("es-CO", {
    dateStyle: "medium",
    timeStyle: "short",
    hour12: false,
  });
}

function tipoChip(t: HistorialItem["tipo"]) {
  switch (t) {
    case "campana":
      return { label: "Campaña", color: "primary" as const };
    case "audiencia":
      return { label: "Audiencia", color: "secondary" as const };
    case "mensaje":
      return { label: "Mensaje", color: "success" as const };
    default:
      return { label: String(t ?? "—"), color: "default" as const };
  }
}

export default function TablaHistorial({ rows }: Props) {
  return (
    <Paper sx={{ p: 2 }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontSize: "1rem", fontWeight: 600 }}>Usuario</TableCell>
            <TableCell sx={{ fontSize: "1rem", fontWeight: 600 }}>Acción</TableCell>
            <TableCell sx={{ fontSize: "1rem", fontWeight: 600 }}>Tipo</TableCell>
            <TableCell sx={{ fontSize: "1rem", fontWeight: 600 }}>Fecha</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4}>
                <Typography align="center" sx={{ py: 3 }}>
                  Sin resultados
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            rows.map((r, idx) => {
              const chip = tipoChip(r.tipo);
              return (
                <TableRow key={idx} hover>
                  <TableCell sx={{ fontSize: "0.95rem" }}>{r.usuario}</TableCell>
                  <TableCell sx={{ fontSize: "0.95rem" }}>{r.accion}</TableCell>
                  <TableCell>
                    <Chip
                      label={chip.label}
                      color={chip.color}
                      size="small"
                      sx={{ fontWeight: 600 }}
                    />
                  </TableCell>
                  <TableCell sx={{ fontSize: "0.95rem" }}>
                    {formatFecha(r.fecha)}
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </Paper>
  );
}
