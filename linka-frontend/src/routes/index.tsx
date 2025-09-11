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
import SeleccionMensajePage from "../Features/EnvioMensajes/Pages/SeleccionMensajePage";
import SmsPage from "../Features/EnvioMensajes/Pages/SmsPage";
import WhatsappTextoPage from "../Features/EnvioMensajes/Pages/WhatsappTextoPage";
import WhatsAppImagenPage from "../Features/EnvioMensajes/Pages/WhatsAppImagenPage";
import WhatsappVideoPage from "../Features/EnvioMensajes/Pages/WhatsappVideoPage";
import HistorialMensajesPage from "../Features/HistorialMensajes/pages/HistorialMensajesPage";

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
            <Route
              path="/EnvioMensajes"
              element={<ProtectedRoute>
                <SeleccionMensajePage />
              </ProtectedRoute>
              }
            />
            <Route
              path="/EnvioMensajes/SMS"
              element={<ProtectedRoute>
                <SmsPage />
              </ProtectedRoute>
              }
            />
            <Route
              path="/EnvioMensajes/WhatsAppTexto"
              element={<ProtectedRoute>
                <WhatsappTextoPage />
              </ProtectedRoute>
              }
            />
            <Route
              path="/EnvioMensajes/WhatsAppImagen"
              element={<ProtectedRoute>
                <WhatsAppImagenPage />
              </ProtectedRoute>
              }
            />
            <Route
              path="/EnvioMensajes/WhatsAppVideo"
              element={<ProtectedRoute>
                <WhatsappVideoPage />
              </ProtectedRoute>
              }
            />
            <Route
              path="/HistorialMensajes"
              element={<ProtectedRoute>
                <HistorialMensajesPage />
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
