import api from "../../../Config/axiosconfig";

/** Tipos base */
export interface ContactoIn {
  nombre_contacto: string;
  numero_contacto: string;
}
export interface ContactoOut extends ContactoIn {
  idContacto: string;
}

export interface AudienciaRow {
  idAudiencia: string;
  nombre_audiencia: string;
  fecha_creacion: string; // ISO
  idCampana: string;
  nombre_campana: string;
  idUsuario: string;
  total_contactos: number;
}

export interface AudienciaDetalle {
  idAudiencia: string;
  nombre_audiencia: string;
  fecha_creacion: string; // ISO
  idCampana: string;
  nombre_campana: string;
  idUsuario: string;
  contactos: ContactoOut[];
}

export interface ListResponse {
  data: AudienciaRow[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
  };
}

export interface CampanaItem {
  idCampana: string;
  nombre: string;
  fecha_creacion: string;
  idUsuario: string;
}

/** Endpoints */

// POST /audiencias/crear
export const crearAudiencia = async (payload: {
  nombre: string;
  idCampana: string;
  idUsuario: string | null; // o string si lo tienes
  contactos: ContactoIn[];
}) => {
  const { data } = await api.post("/audiencias/crear", payload);
  return data;
};

// GET /audiencias/listar
export const listarAudiencias = async (params: {
  nombreAudiencia?: string;
  nombreCampana?: string;
  fechaInicio?: string; // ISO
  fechaFin?: string;    // ISO
  limit?: number;
  page?: number;
  idUsuario?: string; // Filtrar por usuario
}) => {
  const { data } = await api.get<ListResponse>("/audiencias/listar", { params });
  return data;
};

// GET /audiencias/obtener/?idAudiencia=...
export const obtenerAudiencia = async (idAudiencia: string) => {
  const { data } = await api.get<AudienciaDetalle>(`/audiencias/obtener/${idAudiencia}`);
  return data;
};


// PATCH /audiencias/actualizar/?idAudiencia=...
export const actualizarAudiencia = async (
  idAudiencia: string,
  payload: {
    nombre?: string;
    idCampana?: string;
    contactosAgregar?: ContactoIn[];
    contactosEliminar?: string[];
  }
) => {
  const { data } = await api.patch(`/audiencias/actualizar/${idAudiencia}`, payload);
  return data;
};

// DELETE /audiencias/eliminar/:idAudiencia
export const eliminarAudiencia = async (idAudiencia: string) => {
  const { data } = await api.delete(`/audiencias/eliminar/${idAudiencia}`);
  return data;
};



// GET /campanas/listar-todas
// GET /campanas/listar-todas
export const listarCampanasTodas = async (
  params?: { idUsuario?: string }
): Promise<CampanaItem[]> => {
  const { data } = await api.get<CampanaItem[]>("/campanas/listar-todas", {
    params,
  });
  return data;
};

