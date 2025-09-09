// src/Features/Campanas/components/FiltrosCampanas.tsx
import { Box, Stack, TextField, Button, InputAdornment } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import { forwardRef } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

type Props = {
  filter: string;
  setFilter: (v: string) => void;

  startDate: Date | null;
  endDate: Date | null;
  setDateRange: (range: [Date | null, Date | null]) => void;

  onSearch: () => void;     // ahora se dispara en cada cambio
  onClear: () => void;      // botón al lado del datepicker
  onOpenCreate: () => void;
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
    }}
    sx={{
      "& .MuiInputBase-input": {
        fontFamily: "Nunito, Arial, sans-serif",
        fontSize: "14px",
      },
    }}
  />
));
CustomDateInput.displayName = "CustomDateInput";

export default function FiltrosCampanas({
  filter,
  setFilter,
  startDate,
  endDate,
  setDateRange,
  onSearch,
  onClear,
  onOpenCreate,
  searching = false,
}: Props) {
  // handlers sin debounce
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilter(e.target.value);
    onSearch(); // dispara inmediatamente
  };

  const handleDateChange = (update: [Date | null, Date | null]) => {
    setDateRange(update);
    onSearch(); // dispara inmediatamente
  };

  return (
    <Stack
      direction={{ xs: "column", md: "row" }}
      spacing={2}
      alignItems={{ xs: "stretch", md: "center" }}
      justifyContent="space-between"
      sx={{ p: 2, bgcolor: "background.paper", borderRadius: 2, mb: 2 }}
    >
      {/* Filtros a la izquierda */}
      <Stack direction={{ xs: "column", md: "row" }} spacing={2} flex={1} alignItems="center">
        <TextField
          placeholder="Buscar por nombre de Campaña"
          size="small"
          value={filter}
          onChange={handleTextChange}
          sx={{
            width: 500,
            "& .MuiInputBase-input": {
              fontFamily: "Nunito, Arial, sans-serif",
              "&::placeholder": {
                fontSize: "0.95rem",
              },
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

        <Stack direction="row" spacing={1} alignItems="center">
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

          <Button
            variant="outlined"
            color="info"
            onClick={onClear}
            disabled={searching}
          >
            Limpiar
          </Button>
        </Stack>
      </Stack>

      {/* Acción principal a la derecha */}
      <Stack direction="row" spacing={1}>
        <Button
          variant="contained"
          color="secondary"
          startIcon={<AddIcon />}
          onClick={onOpenCreate}
        >
          Nueva Campaña
        </Button>
      </Stack>
    </Stack>
  );
}
