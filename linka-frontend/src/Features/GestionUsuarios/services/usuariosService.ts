// src/Features/Usuarios/services/usuariosService.ts
import api from "../../../Config/axiosconfig";

export const listarUsuarios = async (params: {
  filter?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  page?: number;
}) => {
  const res = await api.get("/usuarios/listar", { params });
  return res.data;
};

export const actualizarUsuario = async (uid: string, data: any) => {
  const res = await api.patch(`/usuarios/actualizar/${uid}`, data);
  return res.data;
};

export const eliminarUsuario = async (uid: string) => {
  const res = await api.delete(`/usuarios/eliminar/${uid}`);
  return res.data;
};
