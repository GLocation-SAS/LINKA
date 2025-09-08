// src/config/axios.ts
import axios from "axios";

const API_BASE = "https://linka-backend-460321220051.us-central1.run.app";

let token: string | null = null;
let tokenExpiry: number | null = null; // timestamp en ms

// 🔑 Función para obtener token (y renovarlo si caducó)
async function getToken() {
  const now = Date.now();

  if (token && tokenExpiry && now < tokenExpiry) {
    return token; // ✅ Token válido
  }

  try {
    const response = await axios.post(`${API_BASE}/auth/generate-token`, {
      url: API_BASE,
    });

    token = response.data.token;

    // ⏱️ Guardar tiempo de expiración (1 hora)
    tokenExpiry = now + 60 * 60 * 1000;

    return token;
  } catch (error: any) {
    console.error("Error al generar token:", error.response || error.message);
    throw error;
  }
}

// 🔧 Crear instancia de Axios
const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

// 🔁 Interceptor de requests → agrega el token automáticamente
api.interceptors.request.use(async (config: any) => {
  const authToken = await getToken();
  config.headers.Authorization = `Bearer ${authToken}`;
  return config;
});

// ❌ Manejo de errores
api.interceptors.response.use(
  (response: any) => response,
  (error: any) => {
    console.error("API Error:", error.response || error.message);
    return Promise.reject(error);
  }
);

export default api;
