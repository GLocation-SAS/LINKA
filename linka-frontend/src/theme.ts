// src/theme.ts
import { createTheme } from "@mui/material/styles";

const theme = createTheme({
    palette: {
        common: {
            black: "#000000",
            white: "#FFFFFF",
        },
        primary: {
            main: "#205577", // Azul
            light: "#306C92", // Hover
            dark: "#114363", // Pressed
            contrastText: "#FFFFFF",
        },
        secondary: {
            main: "#F38933", // Naranja (Principal)
            light: "#F99F56", // Hover
            dark: "#E06705", // Pressed
            contrastText: "#FFFFFF",
        },
        error: {
            main: "#FF5E61", // Rojo
            light: "#FF8385", // Hover
            dark: "#ED4C4F", // Pressed
            contrastText: "#FFFFFF",
        },
        success: {
            main: "#38E996", // Verde
            light: "#6EF5B6", // Hover
            dark: "#2DD587", // Pressed
            contrastText: "#FFFFFF",
        },
        info: {
            main: "#205577", // Azul (Outline)
            light: "#306C92",
            dark: "#114363",
            contrastText: "#FFFFFF",
        },
        grey: {
            100: "#EEF2F6", // Azul Fondo
            200: "#B1B1B1", // Gris
            300: "#D0D0D0", // Gris Hover
            400: "#727272", // Gris Pressed
        },
        neutral: {
            main: "#B1B1B1",    // grey[200]
            light: "#D0D0D0",   // grey[300]
            dark: "#727272",    // grey[400]
            contrastText: "#fff",
        },
        background: {
            default: "#EEF2F6", // Azul Fondo
            paper: "#FFFFFF",
        },
    },
    typography: {
        fontFamily: "Nunito, Arial, sans-serif", // Por defecto Nunito

        h1: { fontFamily: "Montserrat, sans-serif", fontWeight: 700, fontSize: "40px" },
        h2: { fontFamily: "Montserrat, sans-serif", fontWeight: 700, fontSize: "20px" },
        subtitle1: { fontFamily: "Nunito, sans-serif", fontWeight: 700, fontSize: "14px" },
        body1: { fontFamily: "Nunito, sans-serif", fontWeight: 400, fontSize: "12px" },
        body2: { fontFamily: "Nunito, sans-serif", fontWeight: 400, fontSize: "10px" },
        button: { fontFamily: "Montserrat, sans-serif", fontWeight: 600, fontSize: "14px" },
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 10,
                    textTransform: "none",
                    fontWeight: 600,
                    padding: "8px 16px",
                    boxShadow: "none", // 👈 elimina sombra global
                    "&:hover": {
                        boxShadow: "none", // 👈 evita sombra en hover
                    },
                    "&:active": {
                        boxShadow: "none", // 👈 evita sombra en active
                    },
                },
            },
            variants: [
                // 🔵 Outline (Azul)
                {
                    props: { variant: "outlined", color: "info" },
                    style: {
                        '&&': { // ⬅️ Aumenta especificidad para TODAS las reglas
                            backgroundColor: "rgba(32,85,119,0.10)",
                            borderColor: "#205577",
                            color: "#205577",

                            '&:hover': {
                                backgroundColor: "rgba(32,85,119,0.12)",
                                borderColor: "#306C92",
                                color: "#306C92",
                            },

                            '&:active': {
                                backgroundColor: "rgba(32,85,119,0.14)",
                                borderColor: "#114363",
                                color: "#114363",
                            },

                            '&.Mui-disabled': {
                                backgroundColor: "rgba(32,85,119,0.06)",
                                borderColor: "rgba(32,85,119,0.10)",
                                color: "rgba(32,85,119,0.40)",
                            },
                        },
                    },
                },
                // ⚪ Secundario (Gris)
                {
                    props: { variant: "contained", color: "grey" as any },
                    style: {
                        backgroundColor: "#B1B1B1",
                        color: "#fff",
                        boxShadow: "none",
                        "&:hover": { backgroundColor: "#D0D0D0", boxShadow: "none" },
                        "&:active": { backgroundColor: "#727272", boxShadow: "none" },
                        "&.Mui-disabled": {
                            backgroundColor: "rgba(177,177,177,0.1)",
                            color: "rgba(177,177,177,0.4)",
                        },
                    },
                },
                // 🔶 Principal (Naranja)
                {
                    props: { variant: "contained", color: "secondary" },
                    style: {
                        backgroundColor: "#F38933",
                        color: "#fff",
                        boxShadow: "none",
                        "&:hover": { backgroundColor: "#F99F56", boxShadow: "none" },
                        "&:active": { backgroundColor: "#E06705", boxShadow: "none" },
                        "&.Mui-disabled": {
                            backgroundColor: "rgba(243,137,51,0.1)",
                            color: "rgba(243,137,51,0.4)",
                        },
                    },
                },
            ],
        },

        MuiOutlinedInput: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    backgroundColor: "#F5F5F5", // Fondo gris claro (activo por defecto)
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#F38933", // Hover → naranja
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#F38933", // Focus → naranja
                        borderWidth: 2,
                    },
                    "&.Mui-disabled": {
                        backgroundColor: "#E0E0E0", // Texto final → gris más oscuro
                        color: "#727272",
                    },
                },
                notchedOutline: {
                    borderColor: "#D0D0D0", // Borde inicial gris suave
                },
            },
        },
        MuiInputLabel: {
            styleOverrides: {
                root: {
                    fontFamily: "Nunito, sans-serif",
                    fontSize: "14px",
                    fontWeight: 500,
                },
            },
        },
        MuiSelect: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    backgroundColor: "#F5F5F5", // Activo (gris claro)
                    "&:hover": {
                        border: "2px solid #F38933", // Hover → naranja
                        backgroundColor: "#FFFFFF",
                    },
                    "&.Mui-focused": {
                        border: "2px solid #F38933", // Pressed
                        backgroundColor: "#FFFFFF",
                    },
                    "&.Mui-disabled": {
                        backgroundColor: "#E0E0E0", // Deshabilitado
                        color: "#727272",
                    },
                },
                icon: {
                    color: "#000000", // Color de la flecha
                },
            },
        },
        MuiMenuItem: {
            styleOverrides: {
                root: {
                    fontFamily: "Nunito, sans-serif",
                    fontSize: "14px",
                    "&.Mui-selected": {
                        backgroundColor: "#F5F5F5 !important", // Seleccionado
                    },
                    "&:hover": {
                        backgroundColor: "#F99F56 !important", // Hover → naranja claro
                        color: "#FFFFFF",
                    },
                    "&:active": {
                        backgroundColor: "#E06705 !important", // Pressed → naranja fuerte
                        color: "#FFFFFF",
                    },
                },
            },
        },
        MuiPaginationItem: {
            styleOverrides: {
                root: {
                    fontFamily: "Nunito, sans-serif",
                    fontSize: "14px",
                    borderRadius: 8,
                    "&.Mui-selected": {
                        backgroundColor: "#F5F5F5",
                        color: "#000",
                    },
                    "&:hover": {
                        backgroundColor: "#F99F56",
                        color: "#fff",
                    },
                    "&:active": {
                        backgroundColor: "#E06705",
                        color: "#fff",
                    },
                },
            },
        },
    },
});

export default theme;
