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
   * @param usuario nombre del usuario (display_name)
   * @param tipo tipo de acción: campaña | audiencia | mensaje
   * @param fechaInicio fecha mínima (YYYY-MM-DD)
   * @param fechaFin fecha máxima (YYYY-MM-DD)
   * @param page número de página
   * @param limit cantidad de resultados por página
   * @param order asc | desc
   */
  async getHistorialGeneral(
    usuario?: string,
    tipo?: 'campaña' | 'audiencia' | 'mensaje',
    fechaInicio?: string,
    fechaFin?: string,
    page = 1,
    limit = 10,
    order: 'asc' | 'desc' = 'desc',
  ) {
    const dataset = 'LINKA';
    const projectId = 'converso-346218';

    // Query Campañas
    const [campanas] = await this.bigquery.query({
      query: `
        SELECT idCampana, nombre, fecha_creacion, idUsuario
        FROM \`${projectId}.${dataset}.Campanas\`
      `,
    });

    // Query Audiencias
    const [audiencias] = await this.bigquery.query({
      query: `
        SELECT idAudiencia, nombre, fecha_creacion, idUsuario
        FROM \`${projectId}.${dataset}.Audiencias\`
      `,
    });

    // Query Mensajes
    const [mensajes] = await this.bigquery.query({
      query: `
        SELECT idMensaje, contenido, tipo, fecha_envio, idUsuario
        FROM \`${projectId}.${dataset}.Mensajes\`
      `,
    });

    // Unificar y enriquecer con usuarios
    const allEvents = [
      ...campanas.map((c: any) => ({
        tipo: 'campaña',
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
          fecha: ev.fecha,
          tipo: ev.tipo,
        };
      }),
    );

    // 🔍 Aplicar filtros
    let filtered = enriched;

    if (usuario) {
      const usuarioLower = usuario.toLowerCase();
      filtered = filtered.filter((e) =>
        e.usuario.toLowerCase().includes(usuarioLower),
      );
    }

    if (tipo) {
      filtered = filtered.filter((e) => e.tipo === tipo);
    }

    if (fechaInicio) {
      const inicio = new Date(fechaInicio);
      filtered = filtered.filter((e) => new Date(e.fecha) >= inicio);
    }

    if (fechaFin) {
      const fin = new Date(fechaFin);
      filtered = filtered.filter((e) => new Date(e.fecha) <= fin);
    }

    // 📌 Ordenar
    filtered.sort((a, b) =>
      order === 'asc'
        ? new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
        : new Date(b.fecha).getTime() - new Date(a.fecha).getTime(),
    );

    // 📄 Paginación
    const totalCount = filtered.length;
    const totalPages = Math.ceil(totalCount / limit);
    const start = (page - 1) * limit;
    const paginated = filtered.slice(start, start + limit);

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
