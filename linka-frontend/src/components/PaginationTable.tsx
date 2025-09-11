// src/Features/Usuarios/components/PaginationTable.tsx
import { Pagination, Select, MenuItem, Stack, Typography } from "@mui/material";

interface Props {
  page: number;
  limit: number;
  totalPages: number;
  onChangePage: (page: number) => void;
  onChangeLimit: (limit: number) => void;
}

export default function PaginationTable({
  page,
  limit,
  totalPages,
  onChangePage,
  onChangeLimit,
}: Props) {
  return (
    <Stack
      direction="row"
      spacing={2}
      alignItems="center"
      justifyContent="space-between"
      sx={{ p: 2, bgcolor: "#EEF2F6", borderRadius: 2, mt: 2 }}
    >
      {/* Selector de elementos por página */}
      <Stack direction="row" spacing={1} alignItems="center">
        <Typography fontSize={14}>Elementos por página</Typography>
        <Select
          value={limit}
          onChange={(e) => onChangeLimit(Number(e.target.value))}
          size="small"
          // 👇 Forzar despliegue hacia arriba
          MenuProps={{
            anchorOrigin: { vertical: "top", horizontal: "left" },
            transformOrigin: { vertical: "bottom", horizontal: "left" },
            PaperProps: {
              sx: {
                maxHeight: 260, // opcional: limita la altura
              },
            },
          }}
        >
          {[10, 20, 30, 40, 50, 100].map((num) => (
            <MenuItem key={num} value={num}>
              {num}
            </MenuItem>
          ))}
        </Select>
      </Stack>

      {/* Paginación */}
      <Pagination
        count={totalPages}
        page={page}
        onChange={(_, value) => onChangePage(value)}
        showFirstButton
        showLastButton
        shape="rounded"
      />
    </Stack>
  );
}
