// src/Features/HistorialMensajes/components/FiltrosHistorialMensajes.tsx
import {
  Stack,
  TextField,
  MenuItem,
  InputAdornment,
  Button,
  Box,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import { forwardRef } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface Props {
  nombreCampana: string;
  setNombreCampana: (v: string) => void;

  tipo: string;
  setTipo: (v: string) => void;

  estado: string;
  setEstado: (v: string) => void;

  startDate: Date | null;
  endDate: Date | null;
  setDateRange: (range: [Date | null, Date | null]) => void;

  onClear: () => void;
  searching: boolean;
}

const CustomDateInput = forwardRef<HTMLInputElement, any>(
  ({ value, onClick }, ref) => (
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
  )
);
CustomDateInput.displayName = "CustomDateInput";

export default function FiltrosHistorialMensajes({
  nombreCampana,
  setNombreCampana,
  tipo,
  setTipo,
  startDate,
  endDate,
  setDateRange,
  onClear,
  searching,
}: Props) {
  // Normaliza fechas a 00:00 y 23:59
  const handleDateChange = (range: [Date | null, Date | null]) => {
    const [start, end] = range;
    setDateRange([start, end]);
  };

  return (
    <Box sx={{ p: 2, bgcolor: "#fff", borderRadius: 2, mb: 2 }}>
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={2}
        alignItems={{ xs: "stretch", md: "center" }}
      >
        {/* 🔎 Buscar campaña */}
        <TextField
          placeholder="Buscar campaña"
          size="small"
          value={nombreCampana}
          onChange={(e) => setNombreCampana(e.target.value)}
          sx={{
            width: 300,
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
          onChange={(e) => setTipo(e.target.value)}
          size="small"
          sx={{ minWidth: 160 }}
        >
          <MenuItem value="">Todos</MenuItem>
          <MenuItem value="texto">Texto</MenuItem>
          <MenuItem value="imagen">Imagen</MenuItem>
          <MenuItem value="video">Video</MenuItem>
        </TextField>

        {/* Fechas */}
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

        {/* Botón limpiar */}
        <Button
          color="info"
          variant="outlined"
          onClick={onClear}
          disabled={searching}
          sx={{ fontSize: "12px !important" }}
        >
          Limpiar
        </Button>
      </Stack>
    </Box>
  );
}
