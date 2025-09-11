import { Stack, TextField, Button, MenuItem, InputAdornment, Box } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import { forwardRef } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import type { HistorialTipo } from "../services/historialService";

/** Helpers (puedes importarlos desde utils si ya los tienes) */
export function startOfDayISO(d: Date) {
  const dt = new Date(d);
  dt.setHours(0, 0, 0, 0);
  return dt.toISOString();
}

export function endOfDayISO(d: Date) {
  const dt = new Date(d);
  dt.setHours(23, 59, 59, 999);
  return dt.toISOString();
}

type Props = {
  usuario: string;
  setUsuario: (v: string) => void;

  tipo: HistorialTipo | "";
  setTipo: (v: HistorialTipo | "") => void;

  startDate: Date | null;
  endDate: Date | null;
  setDateRange: (range: [Date | null, Date | null]) => void;

  onSearch: () => void;
  onClear: () => void;
  searching: boolean;
};

const CustomDateInput = forwardRef<HTMLInputElement, any>(({ value, onClick }, ref) => (
  <TextField
    size="small"
    fullWidth
    value={value}
    onClick={onClick}
    inputRef={ref}
    placeholder="Rango de fechas"
    InputProps={{
      startAdornment: (
        <InputAdornment position="start">
          <CalendarTodayIcon color="action" />
        </InputAdornment>
      ),
      readOnly: true,
    }}
    sx={{
      minWidth: 260,
      "& .MuiInputBase-input": {
        fontFamily: "Nunito, Arial, sans-serif",
        fontSize: "14px",
      },
    }}
  />
));
CustomDateInput.displayName = "CustomDateInput";

export default function FiltrosHistorial({
  usuario, setUsuario,
  tipo, setTipo,
  startDate, endDate, setDateRange,
  onSearch, onClear, searching
}: Props) {

  // ⏭️ Garantiza que onSearch corra tras aplicar el setState
  const triggerSearchNextTick = () => {
    if (typeof queueMicrotask === "function") {
      queueMicrotask(onSearch);
    } else {
      setTimeout(onSearch, 0);
    }
  };

  // 🔧 Normaliza SIEMPRE: start -> 00:00:00.000, end -> 23:59:59.999
  const handleDateChange = (range: [Date | null, Date | null]) => {
    const [start, end] = range;

    // Si no hay fechas, solo setea y sal
    if (!start && !end) {
      setDateRange([null, null]);
      triggerSearchNextTick();
      return;
    }

    // Normalización a ISO y se vuelve a Date (para mantener el tipo que espera el DatePicker)
    const normalizedStart = start ? new Date(startOfDayISO(start)) : null;
    const normalizedEnd = end ? new Date(endOfDayISO(end)) : null;

    setDateRange([normalizedStart, normalizedEnd]);
    triggerSearchNextTick();
  };

  return (
    <Box sx={{ p: 2, bgcolor: "#fff", borderRadius: 2, mb: 2 }}>
      <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ xs: "stretch", md: "center" }}>
        {/* 🔎 Búsqueda por nombre/correo */}
        <TextField
          placeholder="Buscar por nombre o correo"
          size="small"
          value={usuario}
          onChange={(e) => {
            setUsuario(e.target.value);
            triggerSearchNextTick();
          }}
          sx={{
            width: 500,
            "& .MuiInputBase-input": {
              fontFamily: "Nunito, Arial, sans-serif",
              "&::placeholder": { fontSize: "0.95rem" },
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
        />

        {/* Tipo */}
        <TextField
          select
          label="Tipo"
          value={tipo}
          onChange={(e) => {
            setTipo((e.target.value || "") as HistorialTipo | "");
            triggerSearchNextTick();
          }}
          size="small"
          sx={{ minWidth: 180 }}
        >
          <MenuItem value="">Todos</MenuItem>
          <MenuItem value="campana">Campaña</MenuItem>
          <MenuItem value="audiencia">Audiencia</MenuItem>
          <MenuItem value="mensaje">Mensaje</MenuItem>
        </TextField>

        {/* Rango de fechas */}
        <Box>
          <DatePicker
            selectsRange
            startDate={startDate}
            endDate={endDate}
            onChange={handleDateChange}
            isClearable={false}
            dateFormat="dd/MM/yyyy"
            customInput={<CustomDateInput />}
          />
        </Box>

        {/* Solo botón limpiar */}
        <Button
          color="info"
          variant="outlined"
          onClick={onClear}
          disabled={searching}
          sx={{ fontSize:" 12px !important" }}
        >
          Limpiar
        </Button>
      </Stack>
    </Box>
  );
}
