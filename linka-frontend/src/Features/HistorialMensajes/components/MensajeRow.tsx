// src/Features/HistorialMensajes/components/MensajeRow.tsx
import { TableRow, TableCell, Chip } from "@mui/material";
import type { Mensaje } from "../services/historialMensajesService";

export default function MensajeRow({ mensaje }: { mensaje: Mensaje }) {
  const colorByEstado = (estado: string) => {
    switch (estado) {
      case "enviado":
        return "success";
      case "pendiente":
        return "info";
      case "fallido":
        return "error";
      default:
        return "default";
    }
  };

  return (
    <TableRow hover>
      <TableCell>{mensaje.nombre_campana}</TableCell>
      <TableCell>{mensaje.contenido}</TableCell>
      <TableCell>{mensaje.tipo}</TableCell>
      <TableCell>
        <Chip label={mensaje.estado} color={colorByEstado(mensaje.estado) as any} size="small" />
      </TableCell>
      <TableCell>{new Date(mensaje.fecha_envio).toLocaleString()}</TableCell>
      <TableCell>{mensaje.total_contactos_campana}</TableCell>
    </TableRow>
  );
}
