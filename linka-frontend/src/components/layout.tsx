import { AppBar, Toolbar, Button, Box } from "@mui/material";
import CampaignIcon from "@mui/icons-material/Campaign";
import GroupIcon from "@mui/icons-material/Group";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../Config/firebase";
import logo from "../assets/Linka/Logos/Logo Horizontal/PNG/Logo Horizontal Alternativo.png";
import LogoutIcon from "@mui/icons-material/Logout";
import { useAuth } from "../Context/AuthContext";

export default function Layout({ children }: { children: React.ReactNode }) {
    const navigate = useNavigate();
    const location = useLocation();
    const { rol } = useAuth();

    const handleLogout = async () => {
        await signOut(auth);
        navigate("/");
    };

    // 🔹 Función para estilos de tabs de navegación
    // 🔹 Función para estilos de tabs de navegación
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
            // 🔸 Subrayado si está activo
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
            // 🔸 Hover solo si NO está activo
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

                        {/* Solo Admin: Gestión de Usuarios */}
                        {rol === "admin" && (
                            <Button
                                component={Link}
                                to="/GestionUsuarios"
                                color="inherit"
                                endIcon={<GroupIcon />}
                                sx={navButtonStyle("/GestionUsuarios")}
                            >
                                Gestión de Usuarios
                            </Button>
                        )}

                        {/* Logout */}
                        <Button
                            variant="contained"
                            color="secondary"
                            size="small"
                            endIcon={<LogoutIcon />}
                            sx={navButtonStyle("")}
                            onClick={handleLogout}
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
        </Box>
    );
}
