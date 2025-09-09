export interface Campana {
  idCampana: string;
  nombre: string;
  fecha_creacion: { value: string }; // ⬅️ ahora es un objeto
  idUsuario: string;
  audienciasCount: number;
  contactosCount: number;
}


export interface Pagination {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
}

export interface CampanasResponse {
  data: Campana[];
  pagination: Pagination;
}
