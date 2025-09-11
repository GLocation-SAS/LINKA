// src/Features/HistorialMensajes/services/historialMensajesService.ts
import api from "../../../Config/axiosconfig";

export interface Mensaje {
  idMensaje: string;
  idCampana: string;
  nombre_campana: string;
  idUsuario: string;
  idContacto: string;
  contenido: string;
  tipo: "texto" | "imagen" | "video";
  fecha_envio: any;
  estado: string;
  total_contactos_campana: number;
  url_contenido?: string;
}

export const listarMensajes = async (params: any) => {
  const { data } = await api.get("/mensajes/listar", { params });
  return data;
};

// ✅ Nuevo: obtener detalle
export const obtenerMensaje = async (idMensaje: string): Promise<Mensaje> => {
  const { data } = await api.get(`/mensajes/obtener/${idMensaje}`);
  return data;
};
