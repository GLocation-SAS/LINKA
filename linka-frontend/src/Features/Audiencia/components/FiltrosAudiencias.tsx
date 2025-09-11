import { Stack, TextField, InputAdornment, Box, Button } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import { forwardRef } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import AddIcon from "@mui/icons-material/Add";

type Props = {
    nombreAudiencia: string;
    setNombreAudiencia: (v: string) => void;

    nombreCampana: string;
    setNombreCampana: (v: string) => void;

    startDate: Date | null;
    endDate: Date | null;
    setDateRange: (range: [Date | null, Date | null]) => void;

    onSearch: () => void; // en el padre solo setPage(1)
    onClear: () => void;
    searching: boolean;

    // ⬇️ NUEVO
    onOpenCreate: () => void;
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
            minWidth: 240,
            "& .MuiInputBase-input": { fontFamily: "Nunito, Arial, sans-serif", fontSize: "14px" },
        }}
    />
));
CustomDateInput.displayName = "CustomDateInput";

export default function FiltrosAudiencias({
    nombreAudiencia, setNombreAudiencia,
    nombreCampana, setNombreCampana,
    startDate, endDate, setDateRange,
    onSearch, onClear, searching,
    onOpenCreate, // <- NUEVO
}: Props) {
    const triggerNextTick = () =>
        (typeof queueMicrotask === "function" ? queueMicrotask(onSearch) : setTimeout(onSearch, 0));

    const handleDateChange = (range: [Date | null, Date | null]) => {
        setDateRange(range);
        triggerNextTick();
    };

    return (
        <Box sx={{ p: 2, bgcolor: "#fff", borderRadius: 2, mb: 2 }}>
            <Stack
                direction={{ xs: "column", md: "row" }}
                spacing={2}
                alignItems={{ xs: "stretch", md: "center" }}
            >
                <TextField
                    placeholder="Bucar por nombre de audiencia"
                    size="small"
                    value={nombreAudiencia}
                    onChange={(e) => { setNombreAudiencia(e.target.value); triggerNextTick(); }}
                    sx={{
                        width: 380,
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

                <TextField
                    placeholder="Buscar por nombre de campaña"
                    size="small"
                    value={nombreCampana}
                    onChange={(e) => { setNombreCampana(e.target.value); triggerNextTick(); }}
                    sx={{
                        width: 320,
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

                <DatePicker
                    selectsRange
                    startDate={startDate}
                    endDate={endDate}
                    onChange={handleDateChange}
                    isClearable={false}
                    dateFormat="dd/MM/yyyy"
                    customInput={<CustomDateInput />}
                />

                <Button color="info" variant="outlined" sx={{ fontSize: " 12px !important" }} onClick={onClear} disabled={searching}>
                    Limpiar
                </Button>

                {/* ⬇️ Botón mover aquí */}
                <Box sx={{ flexGrow: 1 }} />
                <Button
                    variant="contained"
                    color="secondary"
                    onClick={onOpenCreate}
                    disabled={searching}
                    startIcon={<AddIcon />}   // 👈 aquí el ícono
                    sx={{ alignSelf: { xs: "stretch", md: "auto" } }}
                >
                    Crear audiencia
                </Button>
            </Stack>
        </Box>
    );
}
