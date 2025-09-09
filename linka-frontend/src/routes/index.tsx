import { BrowserRouter, Routes, Route } from "react-router-dom";
import NotFoundPage from "../Features/NotFoundPage/pages";
import LoginPage from "../Features/Login/pages/LoginPage";
import RegisterPage from "../Features/Register/Pages/RegisterPage";
import ForgotPasswordPage from "../Features/Login/pages/ForgotPasswordPage";
import ProtectedRoute from "./ProtectedRoute";
import { AuthProvider } from "../Context/AuthContext";
import CampañasPage from "../Features/Campañas/pages/CampañaPage";
import UsuariosPage from "../Features/GestionUsuarios/pages/UsuariosPage";
import HistorialAdminPage from "../Features/HistorialAdmin/Pages/HistorialAdminPage";
import AudienciaPage from "../Features/Audiencia/pages/AudienciaPage";
import { UserProvider } from "../Context/UserContext";

export default function AppRoutes() {
  return (
    <AuthProvider>
      <UserProvider>
        <BrowserRouter>
          <Routes>
            {/* Rutas públicas */}
            <Route path="/" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgotpassword" element={<ForgotPasswordPage />} />

            {/* Rutas protegidas */}
            <Route
              path="/Campanas"
              element={
                <ProtectedRoute>
                  <CampañasPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/GestionUsuarios"
              element={<ProtectedRoute>
                <UsuariosPage />
              </ProtectedRoute>
              }
            />
            <Route
              path="/HistorialAdmin"
              element={<ProtectedRoute>
                <HistorialAdminPage />
              </ProtectedRoute>
              }
            />
            <Route
              path="/Audiencia"
              element={<ProtectedRoute>
                <AudienciaPage />
              </ProtectedRoute>
              }
            />

            {/* 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
      </UserProvider>
    </AuthProvider>
  );
}
