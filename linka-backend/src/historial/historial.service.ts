import { Injectable, Inject } from '@nestjs/common';
import { BigQuery } from '@google-cloud/bigquery';
import * as admin from 'firebase-admin';

@Injectable()
export class HistorialService {
  private firestore: FirebaseFirestore.Firestore;

  constructor(@Inject('BIGQUERY') private readonly bigquery: BigQuery) {
    this.firestore = admin.firestore();
  }

  /**
   * Obtener historial con filtros y paginación
   */
  async getHistorialGeneral(
    usuario?: string,
    tipo?: 'campaña' | 'audiencia' | 'mensaje',
    fechaInicio?: string,
    fechaFin?: string,
    page = 1,
    limit = 10,
    order: 'asc' | 'desc' = 'desc', // por defecto más reciente primero
  ) {
    const dataset = 'LINKA';
    const projectId = 'converso-346218';

    // Helper para normalizar fechas (string | Date | { value: string })
    const toMillis = (f: any): number => {
      if (!f) return 0;
      if (f instanceof Date) return f.getTime();
      if (typeof f === 'string' || typeof f === 'number') return new Date(f).getTime();
      if (typeof f === 'object') {
        const v = (f as any).value ?? (f as any).timestamp ?? null;
        return v ? new Date(v).getTime() : new Date(String(f)).getTime();
      }
      return new Date(String(f)).getTime();
    };

    // Queries
    const [campanas] = await this.bigquery.query({
      query: `
      SELECT idCampana, nombre, fecha_creacion, idUsuario
      FROM \`${projectId}.${dataset}.Campanas\`
    `,
    });

    const [audiencias] = await this.bigquery.query({
      query: `
      SELECT idAudiencia, nombre, fecha_creacion, idUsuario
      FROM \`${projectId}.${dataset}.Audiencias\`
    `,
    });

    const [mensajes] = await this.bigquery.query({
      query: `
      SELECT idMensaje, contenido, tipo, fecha_envio, idUsuario
      FROM \`${projectId}.${dataset}.Mensajes\`
    `,
    });

    // Unificar
    const allEvents = [
      ...campanas.map((c: any) => ({
        tipo: 'campana', // 👈 ojo: aquí no lleva tilde
        accion: `creó la campaña "${c.nombre}"`,
        fecha: c.fecha_creacion,
        idUsuario: c.idUsuario,
      })),
      ...audiencias.map((a: any) => ({
        tipo: 'audiencia',
        accion: `creó la audiencia "${a.nombre}"`,
        fecha: a.fecha_creacion,
        idUsuario: a.idUsuario,
      })),
      ...mensajes.map((m: any) => ({
        tipo: 'mensaje',
        accion: `envió un mensaje ${m.tipo} "${m.contenido}"`,
        fecha: m.fecha_envio,
        idUsuario: m.idUsuario,
      })),
    ];

    // Enriquecer con displayName
    const enriched = await Promise.all(
      allEvents.map(async (ev) => {
        const userDoc = await this.firestore.collection('usuarios').doc(ev.idUsuario).get();
        const userData = userDoc.exists ? userDoc.data() : null;
        return {
          usuario: userData ? userData.display_name : 'Usuario desconocido',
          accion: ev.accion,
          fecha: ev.fecha,              // mantenemos la forma original
          _fechaMs: toMillis(ev.fecha), // 👈 campo auxiliar para ordenar
          tipo: ev.tipo,
        };
      }),
    );

    // 🔍 Filtros
    let filtered = enriched;

    if (usuario) {
      const usuarioLower = usuario.toLowerCase();
      filtered = filtered.filter((e) => e.usuario.toLowerCase().includes(usuarioLower));
    }

    if (tipo) {
      // Nota: en el array usamos 'campana' sin tilde; asegúrate de enviar el mismo literal desde el front
      filtered = filtered.filter((e) => e.tipo === tipo);
    }

    if (fechaInicio) {
      const inicioMs = new Date(fechaInicio).getTime();
      filtered = filtered.filter((e) => e._fechaMs >= inicioMs);
    }

    if (fechaFin) {
      const finMs = new Date(fechaFin).getTime();
      filtered = filtered.filter((e) => e._fechaMs <= finMs);
    }

    // 📌 Orden (desc por defecto → más recientes primero)
    filtered.sort((a, b) =>
      order === 'asc' ? a._fechaMs - b._fechaMs : b._fechaMs - a._fechaMs,
    );

    // 📄 Paginación
    const totalCount = filtered.length;
    const totalPages = Math.ceil(totalCount / limit);
    const start = (page - 1) * limit;
    const paginated = filtered.slice(start, start + limit).map(({ _fechaMs, ...rest }) => rest); // ocultamos el auxiliar

    return {
      data: paginated,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage: page < totalPages,
      },
    };
  }


}
