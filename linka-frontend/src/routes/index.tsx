import { BrowserRouter, Routes, Route } from "react-router-dom";
import NotFoundPage from "../Features/NotFoundPage/pages";
import LoginPage from "../Features/Login/pages/LoginPage";
import RegisterPage from "../Features/Register/Pages/RegisterPage";
import ForgotPasswordPage from "../Features/Login/pages/ForgotPasswordPage";
import ProtectedRoute from "./ProtectedRoute";
import { AuthProvider } from "../Context/AuthContext";
import CampañasPage from "../Features/Campañas/pages/CampañaPage";
import UsuariosPage from "../Features/GestionUsuarios/pages/UsuariosPage";

export default function AppRoutes() {
  return (
    <AuthProvider>
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

          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
