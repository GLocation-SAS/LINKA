import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Stack, Typography, Chip, Table, TableHead, TableBody, TableRow, TableCell } from "@mui/material";
import type { AudienciaDetalle } from "../services/audienciasService";

export default function VerAudienciaDialog({
  open, onClose, detalle
}: { open: boolean; onClose: () => void; detalle?: AudienciaDetalle | null; }) {

  const formatFecha = (iso?: string) => {
    if (!iso) return "—";
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short", hour12: false });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Detalle de audiencia</DialogTitle>
      <DialogContent dividers>
        {detalle ? (
          <Stack spacing={2}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Typography variant="h6" fontWeight={700}>{detalle.nombre_audiencia}</Typography>
              <Chip label={detalle.nombre_campana} color="primary" size="small" />
            </Stack>
            <Typography color="text.secondary">Creada: {formatFecha(detalle.fecha_creacion)}</Typography>

            <Typography variant="subtitle1" fontWeight={700}>Contactos</Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Nombre</TableCell>
                  <TableCell>Número</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {detalle.contactos?.length ? detalle.contactos.map((c) => (
                  <TableRow key={c.idContacto}>
                    <TableCell>{c.nombre_contacto}</TableCell>
                    <TableCell>{c.numero_contacto}</TableCell>
                  </TableRow>
                )) : (
                  <TableRow><TableCell colSpan={2}>Sin contactos</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </Stack>
        ) : (
          <Typography>Cargando...</Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit" variant="outlined">Cerrar</Button>
      </DialogActions>
    </Dialog>
  );
}
