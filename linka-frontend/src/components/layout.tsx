import { AppBar, Toolbar, Button, Box } from "@mui/material";
import CampaignIcon from "@mui/icons-material/Campaign";
import GroupIcon from "@mui/icons-material/Group";
import HistoryIcon from "@mui/icons-material/History";   // ⬅️ Import icono
import { Link, useNavigate, useLocation } from "react-router-dom";
import logo from "../assets/Linka/Logos/Logo Horizontal/PNG/Logo Horizontal Alternativo.png";
import LogoutIcon from "@mui/icons-material/Logout";
import { useAuth } from "../Context/AuthContext";
import { useUser } from "../Context/UserContext";
import FeedbackModal from "./FeedbackModal";
import React from "react";
import GroupsIcon from "@mui/icons-material/Groups";

export default function Layout({ children }: { children: React.ReactNode }) {
    const navigate = useNavigate();
    const location = useLocation();
    const { rol } = useAuth();
    const { logout } = useUser();

    const [showConfirmLogout, setShowConfirmLogout] = React.useState(false);
    const [loadingLogout, setLoadingLogout] = React.useState(false);

    const openConfirmLogout = () => setShowConfirmLogout(true);
    const closeConfirmLogout = () => {
        if (!loadingLogout) setShowConfirmLogout(false);
    };

    const handleConfirmLogout = async () => {
        setLoadingLogout(true);
        try {
            await logout();
            setShowConfirmLogout(false);
            navigate("/");
        } finally {
            setLoadingLogout(false);
        }
    };

    const navButtonStyle = (path: string) => {
        const isActive = location.pathname === path;

        return {
            fontSize: "0.85rem",
            px: 1.5,
            color: isActive ? "secondary.main" : "inherit",
            backgroundColor: "transparent",
            position: "relative",
            "& .MuiSvgIcon-root": {
                color: isActive ? "secondary.main" : "inherit",
            },
            "&:after": isActive
                ? {
                    content: '""',
                    position: "absolute",
                    left: 0,
                    right: 0,
                    bottom: -4,
                    height: "2px",
                    backgroundColor: "secondary.main",
                }
                : {},
            "&:hover": !isActive
                ? {
                    backgroundColor: "secondary.main",
                    color: "white",
                    "& .MuiSvgIcon-root": {
                        color: "white",
                    },
                }
                : {},
        };
    };

    return (
        <Box sx={{ display: "flex", flexDirection: "column", height: "100vh" }}>
            {/* 🔹 Topbar */}
            <AppBar position="static" color="primary" sx={{ px: 2, height: 56 }}>
                <Toolbar
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        minHeight: "56px !important",
                    }}
                >
                    {/* Izquierda: Logo */}
                    <Box display="flex" alignItems="center">
                        <img src={logo} alt="Linka" style={{ height: 32 }} />
                    </Box>

                    {/* Derecha: Opciones + Logout */}
                    <Box display="flex" alignItems="center" gap={1}>
                        {/* Campañas */}
                        <Button
                            component={Link}
                            to="/Campanas"
                            color="inherit"
                            endIcon={<CampaignIcon />}
                            sx={navButtonStyle("/Campanas")}
                        >
                            Campañas
                        </Button>
                        <Button
                            component={Link}
                            to="/Audiencia"
                            color="inherit"
                            endIcon={<GroupsIcon />}
                            sx={navButtonStyle("/Audiencia")}
                        >
                            Audiencia
                        </Button>

                        {/* Solo Admin: Gestión de Usuarios */}
                        {rol === "admin" && (
                            <>
                                <Button
                                    component={Link}
                                    to="/GestionUsuarios"
                                    color="inherit"
                                    endIcon={<GroupIcon />}
                                    sx={navButtonStyle("/GestionUsuarios")}
                                >
                                    Gestión de Usuarios
                                </Button>

                                {/* 🔹 Nuevo: Historial Administrador */}
                                <Button
                                    component={Link}
                                    to="/HistorialAdmin"
                                    color="inherit"
                                    endIcon={<HistoryIcon />}
                                    sx={navButtonStyle("/HistorialAdmin")}
                                >
                                    Historial Admin
                                </Button>
                            </>
                        )}

                        {/* Logout */}
                        <Button
                            variant="contained"
                            color="secondary"
                            size="small"
                            endIcon={<LogoutIcon />}
                            sx={navButtonStyle("")}
                            onClick={openConfirmLogout}
                            disabled={loadingLogout}
                        >
                            Cerrar sesión
                        </Button>
                    </Box>
                </Toolbar>
            </AppBar>

            {/* 🔹 Contenido */}
            <Box sx={{ flex: 1, bgcolor: "background.default", p: 5 }}>
                {children}
            </Box>

            <FeedbackModal
                open={showConfirmLogout}
                type="confirm"
                title="¿Cerrar sesión?"
                description="Se cerrará tu sesión actual. Tendrás que iniciar sesión nuevamente para continuar."
                confirmLabel="Cerrar sesión"
                cancelLabel="Cancelar"
                onConfirm={handleConfirmLogout}
                onClose={closeConfirmLogout}
                loadingConfirm={loadingLogout}
            />
        </Box>
    );
}
