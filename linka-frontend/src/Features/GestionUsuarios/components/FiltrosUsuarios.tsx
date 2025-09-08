// src/Features/Usuarios/components/FiltrosUsuarios.tsx
import { useState, useEffect, forwardRef } from "react";
import {
    Box,
    TextField,
    Stack,
    InputAdornment,
    Button,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface Props {
    onFilter: (filters: {
        filter?: string;
        startDate?: string;
        endDate?: string;
    }) => void;
}

export default function FiltrosUsuarios({ onFilter }: Props) {
    const [filter, setFilter] = useState("");
    const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([
        null,
        null,
    ]);
    const [startDate, endDate] = dateRange;

    // ✅ dispara onFilter cada vez que cambia un filtro
    useEffect(() => {
        const timeout = setTimeout(() => {
            onFilter({
                filter,
                startDate: startDate
                    ? startDate.toISOString().split("T")[0]
                    : undefined,
                endDate: endDate
                    ? new Date(new Date(endDate).setHours(23, 59, 59, 999)).toISOString()
                    : undefined,
            });
        }, 400);

        return () => clearTimeout(timeout);
    }, [filter, startDate, endDate]);

    const handleClearFilters = () => {
        setFilter("");
        setDateRange([null, null]);
        onFilter({});
    };

    // 🔹 Custom Input con MUI TextField
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
                }}
                sx={{
                    "& .MuiInputBase-input": {
                        fontFamily: "Nunito, Arial, sans-serif",
                        fontSize: "14px",
                    },
                }}
            />
        )
    );

    return (
        <Box sx={{ p: 2, bgcolor: "#fff", borderRadius: 2, mb: 2 }}>
            <Stack direction="row" spacing={2} alignItems="center">
                {/* 🔍 Filtro por nombre/correo */}
                <TextField
                    placeholder="Buscar por nombre o correo"
                    size="small"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    sx={{
                        width: 500,
                        "& .MuiInputBase-input": {
                            fontFamily: "Nunito, Arial, sans-serif",
                            "&::placeholder": {
                                fontSize: "0.95rem", // 👈 tamaño del placeholder
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


                {/* 📅 Selector de rango con input estilizado */}
                <Box sx={{ width: "auto" }}>
                    <DatePicker
                        selectsRange
                        startDate={startDate}
                        endDate={endDate}
                        onChange={(update: [Date | null, Date | null]) =>
                            setDateRange(update)
                        }
                        isClearable={false}
                        dateFormat="dd/MM/yyyy"
                        customInput={<CustomDateInput />}
                    />
                </Box>

                {/* 🔘 Botón limpiar */}
                <Button
                    variant="outlined"
                    color="info"
                    size="small"
                    onClick={handleClearFilters}
                >
                    Limpiar
                </Button>
            </Stack>
        </Box>
    );
}
