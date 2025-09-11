// src/Features/Mensajes/services/mensajesService.ts
import axios from "axios";
import api from "../../../Config/axiosconfig"; // 👈 tu instancia configurada con baseURL

const CLOUD_BASE = "https://us-central1-converso-346218.cloudfunctions.net";
const LICENSE_ID = "2f8cba78-5525-4b41-ab9b-d0816ea66686";

/**
 * ======================
 *   NUESTRO BACKEND
 * ======================
 */

// Crear mensaje (usa baseURL de axiosconfig)
export const crearMensaje = async (payload: {
  idCampana: string;
  idUsuario: string | null;
  idContacto: string;
  contenido: string;
  tipo: "texto" | "imagen" | "video";
  url_contenido?: string;
}) => {
  const { data } = await api.post("/mensajes/crear", payload);
  return data;
};

// Subir archivo a GCS (usa baseURL de axiosconfig)
export const subirArchivo = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  const { data } = await api.post<{ url: string }>("/uploads", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return data.url; // 👈 devuelve directamente la URL del archivo en GCS
};


// Generar Signed URL desde el backend
export const getSignedUrl = async (
  fileName: string,
  contentType: string,
  expiresInMinutes = 60
): Promise<{ url: string }> => {
  const { data } = await api.get<{ url: string }>("/uploads/signed-url", {
    params: { fileName, contentType, expiresInMinutes },
  });
  return data; // 👈 devuelve { url: "https://storage.googleapis.com/..." }
};

/**
 * ======================
 *   CLOUD FUNCTIONS
 * ======================
 */

// Obtener token (usado para autenticar cualquier endpoint)
export const obtenerToken = async (url: string) => {
  const { data } = await axios.get(`${CLOUD_BASE}/token`, {
    params: { url },
  });
  return data.token; // 👈 asumimos que devuelve { token: "..." }
};

// Enviar SMS
export const enviarSmsMasivo = async (mensaje: string, numeros: string[]) => {
  const endpoint = `${CLOUD_BASE}/sendSms`;
  const token = await obtenerToken(endpoint);

  const body = {
    message: mensaje.replace(/\n/g, "\n"),
    to: numeros,
    licenseId: LICENSE_ID,
  };

  const { data } = await axios.post(endpoint, body, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

// WhatsApp Texto
export const enviarWhatsAppTexto = async (mensaje: string, numeros: string[]) => {
  const endpoint = `${CLOUD_BASE}/sendMessageEvolutionWhatsApp`;
  const token = await obtenerToken(endpoint);

  const body = {
    text: mensaje.replace(/\n/g, "\n"), // 👈 salto de línea
    numbers: numeros,
    licenseId: LICENSE_ID,
  };

  const { data } = await axios.post(endpoint, body, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

// WhatsApp Imagen
// WhatsApp Imagen
export const enviarWhatsAppImagen = async (
  url: string,
  numeros: string[],
  caption?: string
) => {
  const endpoint = `${CLOUD_BASE}/sendImageEvolutionWhatsApp`;
  const token = await obtenerToken(endpoint);

  const body: any = {
    url,
    numbers: numeros,
    licenseId: LICENSE_ID,
  };

  // 👇 Normaliza saltos de línea
  if (caption) body.caption = caption.replace(/\n/g, "\n");

  const { data } = await axios.post(endpoint, body, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

// WhatsApp Video
export const enviarWhatsAppVideo = async (
  url: string,
  numeros: string[],
  caption?: string
) => {
  const endpoint = `${CLOUD_BASE}/sendVideoEvolutionWhatsApp`;
  const token = await obtenerToken(endpoint);

  const body: any = {
    url,
    numbers: numeros,
    licenseId: LICENSE_ID,
  };

  // 👇 Normaliza saltos de línea
  if (caption) body.caption = caption.replace(/\n/g, "\n");

  const { data } = await axios.post(endpoint, body, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

