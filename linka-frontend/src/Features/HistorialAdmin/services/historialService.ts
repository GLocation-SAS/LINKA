import api from "../../../Config/axiosconfig";

export type HistorialTipo = "Campaña" | "Audiencia" | "Mensaje";

export interface HistorialItem {
  usuario: string;
  accion: string;
  fecha: string; // <- normalizada a string
  tipo: "campana" | "audiencia" | "mensaje";
}

export interface HistorialResponse {
  data: HistorialItem[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
  };
}

export const listarHistorial = async (params: {
  usuario?: string;
  tipo?: HistorialTipo;
  fechaInicio?: string;
  fechaFin?: string;
  limit?: number;
  page?: number;
}) => {
  const res = await api.get("/historial/general", { params });

  // 🔧 Normalización
  const normalized: HistorialResponse = {
    data: (res.data?.data || []).map((i: any) => ({
      usuario: i.usuario,
      accion: i.accion,
      // si viene { value: "..." } lo convertimos a string
      fecha: typeof i.fecha === "object" && i.fecha?.value ? i.fecha.value : i.fecha,
      // mantener como viene (minúsculas) o normalizar si lo necesitas
      tipo: i.tipo,
    })),
    pagination: res.data?.pagination || {
      page: 1, limit: 10, totalCount: 0, totalPages: 1, hasNextPage: false,
    },
  };

  return normalized;
};
