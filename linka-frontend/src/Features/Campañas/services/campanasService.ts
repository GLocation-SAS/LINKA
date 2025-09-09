// src/Features/Dashboard/services/campanasService.ts
import api from "../../../Config/axiosconfig";
import type { CampanasResponse } from "../Types/types";

export const listarCampanas = async (params: {
  nombre?: string;
  fechaInicio?: string;
  fechaFin?: string;
  limit?: number;
  page?: number;
}): Promise<CampanasResponse> => {
  const res = await api.get("/campanas/listar", { params });
  return res.data as CampanasResponse;
};

export const crearCampana = async (data: { nombre: string; idUsuario: string }) => {
  const res = await api.post("/campanas/crear", data);
  return res.data;
};

export const actualizarCampana = async (idCampana: string, data: { nombre: string }) => {
  const res = await api.patch(`/campanas/actualizar/${idCampana}`, data);
  return res.data;
};

export const eliminarCampana = async (idCampana: string) => {
  const res = await api.delete(`/campanas/eliminar/${idCampana}`);
  return res.data;
};
