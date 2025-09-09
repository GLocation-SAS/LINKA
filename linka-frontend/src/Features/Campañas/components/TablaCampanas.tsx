// src/Features/Dashboard/components/TablaCampanas.tsx
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  IconButton,
  Paper,
  Tooltip,
  Typography,
  Box,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import Loading from "../../../components/Loading";
import type { Campana } from "../Types/types";
import { formatDate } from "../../../utils/date";

type Props = {
  rows: Campana[];
  loading: boolean;
  onEdit: (row: Campana) => void;
  onDelete: (row: Campana) => void;
};

// Normaliza fecha_creacion: acepta string o { value: string }
function getFechaValue(f: unknown): string | null {
  if (typeof f === "string") return f;
  if (f && typeof f === "object" && "value" in (f as Record<string, unknown>)) {
    const v = (f as Record<string, unknown>).value;
    return typeof v === "string" ? v : null;
  }
  return null;
}

export default function TablaCampanas({ rows, loading, onEdit, onDelete }: Props) {
  if (loading) return <Loading height={240} />;

  if (!rows.length) {
    return (
      <Paper sx={{ p: 2 }}>
        <Box sx={{ py: 6 }}>
          <Typography textAlign="center" color="text.secondary">
            No hay campañas para mostrar.
          </Typography>
        </Box>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 2 }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontSize: "1rem", fontWeight: 600 }}>
              Nombre campaña
            </TableCell>
            <TableCell
              align="center"
              sx={{ fontSize: "1rem", fontWeight: 600}}
            >
              Audiencias
            </TableCell>
            <TableCell
              align="center"
              sx={{ fontSize: "1rem", fontWeight: 600 }}
            >
              Contactos totales
            </TableCell>
            <TableCell sx={{ fontSize: "1rem", fontWeight: 600}}>
              Fecha creación
            </TableCell>
            <TableCell
              align="center"
              sx={{ fontSize: "1rem", fontWeight: 600 }}
            >
              Acciones
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {rows.map((r) => (
            <TableRow key={r.idCampana}>
              <TableCell sx={{ fontSize: "0.95rem" }}>{r.nombre}</TableCell>

              <TableCell
                align="center"
                sx={{ fontSize: "0.95rem", fontVariantNumeric: "tabular-nums" }}
              >
                {r.audienciasCount}
              </TableCell>

              <TableCell
                align="center"
                sx={{ fontSize: "0.95rem", fontVariantNumeric: "tabular-nums" }}
              >
                {r.contactosCount}
              </TableCell>

              <TableCell sx={{ fontSize: "0.95rem" }}>
                {formatDate(getFechaValue(r.fecha_creacion))}
              </TableCell>

              <TableCell align="center">
                <Tooltip title="Editar campaña" arrow>
                  <IconButton onClick={() => onEdit(r)}>
                    <EditIcon color="primary" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Eliminar campaña" arrow>
                  <IconButton onClick={() => onDelete(r)}>
                    <DeleteIcon color="error" />
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );
}
