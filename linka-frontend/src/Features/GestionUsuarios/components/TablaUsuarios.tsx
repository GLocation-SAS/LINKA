// src/Features/Usuarios/components/TablaUsuarios.tsx
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    IconButton,
    Paper,
    Chip,
    Tooltip,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

interface Props {
    usuarios: any[];
    onEdit: (usuario: any) => void;
    onDelete: (uid: string) => void;
}

function formatFecha(fecha: any) {
    if (fecha?._seconds) {
        const ms = fecha._seconds * 1000 + Math.floor(fecha._nanoseconds / 1e6);
        return new Date(ms).toLocaleString();
    }
    return "—";
}

export default function TablaUsuarios({ usuarios, onEdit, onDelete }: Props) {
    return (
        <Paper sx={{ p: 2 }}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell sx={{ fontSize: "1rem", fontWeight: 600 }}>Nombre</TableCell>
                        <TableCell sx={{ fontSize: "1rem", fontWeight: 600 }}>Email</TableCell>
                        <TableCell sx={{ fontSize: "1rem", fontWeight: 600 }}>Rol</TableCell>
                        <TableCell sx={{ fontSize: "1rem", fontWeight: 600 }}>Estado</TableCell>
                        <TableCell sx={{ fontSize: "1rem", fontWeight: 600 }}>Fecha creación</TableCell>
                        <TableCell sx={{ fontSize: "1rem", fontWeight: 600 }}>Acciones</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {usuarios.map((u) => (
                        <TableRow key={u.uid}>
                            <TableCell sx={{ fontSize: "0.95rem" }}>{u.display_name}</TableCell>
                            <TableCell sx={{ fontSize: "0.95rem" }}>{u.email}</TableCell>

                            {/* Rol */}
                            <TableCell>
                                <Chip
                                    label={u.rol === "admin" ? "Admin" : "Gestor"}
                                    color={u.rol === "admin" ? "secondary" : "info"}
                                    size="small"
                                    sx={{ fontWeight: 600 }}
                                />
                            </TableCell>

                            {/* Estado */}
                            <TableCell>
                                <Chip
                                    label={u.estado === "activo" ? "Activo" : "Inactivo"}
                                    color={u.estado === "activo" ? "success" : "error"}
                                    size="small"
                                    sx={{ fontWeight: 600 }}
                                />
                            </TableCell>

                            {/* Fecha */}
                            <TableCell sx={{ fontSize: "0.95rem" }}>
                                {formatFecha(u.fecha_creacion)}
                            </TableCell>

                            {/* Acciones */}
                            <TableCell>
                                <Tooltip title="Editar usuario" arrow>
                                    <IconButton onClick={() => onEdit(u)}>
                                        <EditIcon color="primary" />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title="Eliminar usuario" arrow>
                                    <IconButton onClick={() => onDelete(u.uid)}>
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
