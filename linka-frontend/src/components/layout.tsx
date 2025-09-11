// src/components/layout.tsx
import {
    AppBar,
    Toolbar,
    Button,
    Box,
    Menu,
    MenuItem,
    Avatar,
    Typography,
    Divider,
    ListItemIcon,
    Chip,
} from "@mui/material";
import Logout from "@mui/icons-material/Logout";
import CampaignIcon from "@mui/icons-material/Campaign";
import GroupIcon from "@mui/icons-material/Group";
import HistoryIcon from "@mui/icons-material/History";
import { Link, useNavigate, useLocation } from "react-router-dom";
import logo from "../assets/Linka/Logos/Logo Horizontal/PNG/Logo Horizontal Alternativo.png";
import { useUser } from "../Context/UserContext";
import FeedbackModal from "./FeedbackModal";
import React from "react";
import GroupsIcon from "@mui/icons-material/Groups";
import SmsIcon from "@mui/icons-material/Sms";
import MarkChatReadIcon from "@mui/icons-material/MarkChatRead";

export default function Layout({ children }: { children: React.ReactNode }) {
    const navigate = useNavigate();
    const location = useLocation();
    const { rol, displayName, email, logout } = useUser();

    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const [showConfirmLogout, setShowConfirmLogout] = React.useState(false);
    const [loadingLogout, setLoadingLogout] = React.useState(false);

    const open = Boolean(anchorEl);

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const openConfirmLogout = () => {
        setShowConfirmLogout(true);
        handleMenuClose();
    };
    const closeConfirmLogout = () => {
        if (!loadingLogout) setShowConfirmLogout(false);
    };

    const handleConfirmLogout = async () => {
        setLoadingLogout(true);
        try {
            await logout();
            navigate("/");
        } finally {
            setLoadingLogout(false);
            setShowConfirmLogout(false);
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
                    "& .MuiSvgIcon-root": { color: "white" },
                }
                : {},
        };
    };

    return (
        <Box sx={{ display: "flex", flexDirection: "column", height: "100vh" }}>
            {/* 🔹 Topbar */}
            <AppBar position="static" color="primary" sx={{ px: 2, height: 70 }}>
                <Toolbar
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        minHeight: "70px !important",
                    }}
                >
                    {/* Izquierda: Logo */}
                    <Box display="flex" alignItems="center">
                        <img src={logo} alt="Linka" style={{ height: 32 }} />
                    </Box>

                    {/* Derecha: Opciones + Perfil */}
                    <Box display="flex" alignItems="center" gap={2}>
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
                        <Button
                            component={Link}
                            to="/EnvioMensajes"
                            color="inherit"
                            endIcon={<SmsIcon />}
                            sx={navButtonStyle("/EnvioMensajes")}
                        >
                            Envió Masivos
                        </Button>
                        <Button
                            component={Link}
                            to="/HistorialMensajes"
                            color="inherit"
                            endIcon={<MarkChatReadIcon />}
                            sx={navButtonStyle("/HistorialMensajes")}
                        >
                            Historial Mensajes
                        </Button>

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

                        {/* 🔹 Perfil con menú desplegable */}
                        <Avatar
                            onClick={handleMenuOpen}
                            sx={{
                                bgcolor: "secondary.main",
                                cursor: "pointer",
                                width: 36,
                                height: 36,
                                fontSize: 16,
                                fontWeight: 600,
                            }}
                        >
                            {displayName?.[0] ?? "U"}
                        </Avatar>

                        <Menu
                            anchorEl={anchorEl}
                            open={open}
                            onClose={handleMenuClose}
                            PaperProps={{
                                sx: {
                                    mt: 1,
                                    borderRadius: 2,
                                    boxShadow: 4,
                                    p: 1,
                                    minWidth: 250,
                                },
                            }}
                            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                            transformOrigin={{ vertical: "top", horizontal: "right" }}
                        >
                            <Box sx={{ px: 2, py: 1 }}>
                                <Typography variant="subtitle1" fontWeight={700}>{displayName}</Typography>
                                <Typography variant="body1" color="text.secondary">
                                    {email}
                                </Typography>
                                {rol && (
                                    <Chip
                                        label={rol === "admin" ? "Administrador" : "Gestor"}
                                        color={rol === "admin" ? "secondary" : "info"}
                                        size="small"
                                        sx={{ mt: 1, fontWeight: 600, width:"100%" }}
                                    />
                                )}
                            </Box>
                            <Divider />

                            <MenuItem onClick={openConfirmLogout}>
                                <ListItemIcon>
                                    <Logout fontSize="small" />
                                </ListItemIcon>
                                Cerrar sesión
                            </MenuItem>
                        </Menu>
                    </Box>
                </Toolbar>
            </AppBar>

            {/* 🔹 Contenido */}
            <Box sx={{ flex: 1, bgcolor: "background.default", p: 5 }}>
                {children}
            </Box>

            {/* 🔹 Modal confirmación */}
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
