import {
    Table, TableBody, TableCell, TableHead, TableRow,
    IconButton, Paper, Chip, Tooltip, Typography
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import type { AudienciaRow } from "../services/audienciasService";

interface Props {
    rows: AudienciaRow[];
    onView: (idAudiencia: string) => void;
    onEdit: (row: AudienciaRow) => void;
    onDelete: (idAudiencia: string) => void;
}

const formatFecha = (fecha?: string | { value?: string }) => {
  if (!fecha) return "—";

  // Si viene como objeto { value: string }
  const iso = typeof fecha === "string" ? fecha : fecha.value;
  if (!iso) return "—";

  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";

  return d.toLocaleDateString("es-CO", {
    dateStyle: "medium", // 👈 solo la fecha
  });
};



export default function TablaAudiencias({ rows, onEdit, onDelete }: Props) {
    return (
        <Paper sx={{ p: 2 }}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell sx={{ fontSize: "1rem", fontWeight: 600 }}>Audiencia</TableCell>
                        <TableCell sx={{ fontSize: "1rem", fontWeight: 600 }}>Campaña</TableCell>
                        <TableCell sx={{ fontSize: "1rem", fontWeight: 600 }}>Contactos</TableCell>
                        <TableCell sx={{ fontSize: "1rem", fontWeight: 600 }}>Fecha creación</TableCell>
                        <TableCell sx={{ fontSize: "1rem", fontWeight: 600 }}>Acciones</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {rows.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={5}>
                                <Typography align="center" sx={{ py: 3 }}>Sin resultados</Typography>
                            </TableCell>
                        </TableRow>
                    ) : rows.map((r) => (
                        <TableRow key={r.idAudiencia} hover>
                            <TableCell sx={{ fontSize: "0.95rem" }}>{r.nombre_audiencia}</TableCell>
                            <TableCell sx={{ fontSize: "0.95rem" }}>
                                <Chip label={r.nombre_campana} color="primary" size="small" sx={{ fontWeight: 600 }} />
                            </TableCell>
                            <TableCell sx={{ fontSize: "0.95rem" }}>{r.total_contactos}</TableCell>
                            <TableCell sx={{ fontSize: "0.95rem" }}>{formatFecha(r.fecha_creacion)}</TableCell>
                            <TableCell>
                                <Tooltip title="Editar audiencia" arrow>
                                    <IconButton onClick={() => onEdit(r)}>
                                        <EditIcon color="primary" />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title="Eliminar audiencia" arrow>
                                    <IconButton onClick={() => onDelete(r.idAudiencia)}>
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
