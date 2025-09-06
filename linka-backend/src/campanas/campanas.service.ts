import { Injectable, Inject } from '@nestjs/common';
import { BigQuery } from '@google-cloud/bigquery';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class CampanasService {
    constructor(@Inject('BIGQUERY') private readonly bigquery: BigQuery) { }

    private dataset = 'LINKA';
    private projectId = 'converso-346218';
    /**
       * Crear una campaña (idCampana generado automáticamente con UUID)
       */
    async crearCampana(nombre: string, idUsuario: string) {
        const idCampana = uuidv4(); // 🔑 Generamos un UUID único

        const query = `
      INSERT INTO \`${this.projectId}.${this.dataset}.Campanas\` (idCampana, nombre, fecha_creacion, idUsuario)
      VALUES (@idCampana, @nombre, CURRENT_TIMESTAMP(), @idUsuario)
    `;

        const options = {
            query,
            params: { idCampana, nombre, idUsuario },
        };

        await this.bigquery.query(options);
        return { message: '✅ Campaña creada correctamente', idCampana, nombre, idUsuario };
    }

    /**
     * Listar campañas con filtros y paginación
     * @param nombre texto parcial para buscar por nombre de campaña
     * @param fechaInicio fecha mínima en formato YYYY-MM-DD
     * @param fechaFin fecha máxima en formato YYYY-MM-DD
     * @param page número de página (default: 1)
     * @param limit cantidad de resultados por página (default: 10)
     */
    async listarCampanas(
        nombre?: string,
        fechaInicio?: string,
        fechaFin?: string,
        page = 1,
        limit = 10,
    ) {
        let conditions: string[] = [];
        let params: Record<string, any> = {};

        if (nombre) {
            conditions.push(`nombre LIKE @nombre`);
            params.nombre = `%${nombre}%`;
        }

        if (fechaInicio) {
            conditions.push(`fecha_creacion >= @fechaInicio`);
            params.fechaInicio = fechaInicio;
        }

        if (fechaFin) {
            conditions.push(`fecha_creacion <= @fechaFin`);
            params.fechaFin = fechaFin;
        }

        // Construcción dinámica del WHERE
        const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

        // Query principal
        const query = `
      SELECT idCampana, nombre, fecha_creacion, idUsuario
      FROM \`${this.projectId}.${this.dataset}.Campanas\`
      ${whereClause}
      ORDER BY fecha_creacion DESC
      LIMIT @limit OFFSET @offset
    `;

        // Query para contar total
        const countQuery = `
      SELECT COUNT(*) as total
      FROM \`${this.projectId}.${this.dataset}.Campanas\`
      ${whereClause}
    `;

        const offset = (page - 1) * limit;

        const [rows] = await this.bigquery.query({
            query,
            params: { ...params, limit, offset },
        });

        const [countRows] = await this.bigquery.query({
            query: countQuery,
            params,
        });

        const totalCount = Number(countRows[0].total);
        const totalPages = Math.ceil(totalCount / limit);

        return {
            data: rows,
            pagination: {
                page,
                limit,
                totalCount,
                totalPages,
                hasNextPage: page < totalPages,
            },
        };
    }

    /**
 * Listar todas las campañas (sin paginación)
 * @param nombre texto parcial para filtrar por nombre de campaña
 */
    async listarTodasCampanas(nombre?: string) {
        let conditions: string[] = [];
        let params: Record<string, any> = {};

        if (nombre) {
            conditions.push(`nombre LIKE @nombre`);
            params.nombre = `%${nombre}%`;
        }

        const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

        const query = `
      SELECT idCampana, nombre, fecha_creacion, idUsuario
      FROM \`${this.projectId}.${this.dataset}.Campanas\`
      ${whereClause}
      ORDER BY fecha_creacion DESC
    `;

        const [rows] = await this.bigquery.query({ query, params });
        return rows;
    }


    /**
     * Obtener campaña por ID
     */
    async obtenerCampana(idCampana: string) {
        const query = `
      SELECT idCampana, nombre, fecha_creacion, idUsuario
      FROM \`${this.projectId}.${this.dataset}.Campanas\`
      WHERE idCampana = @idCampana
    `;
        const [rows] = await this.bigquery.query({ query, params: { idCampana } });
        return rows[0] || null;
    }

    /**
 * Actualizar campaña
 * @param idCampana identificador único de la campaña
 * @param nombre nuevo nombre de la campaña
 */
    async actualizarCampana(idCampana: string, nombre: string) {
        const query = `
    UPDATE \`${this.projectId}.${this.dataset}.Campanas\`
    SET nombre = @nombre
    WHERE idCampana = @idCampana
  `;

        const options = {
            query,
            params: { idCampana, nombre },
        };

        await this.bigquery.query(options);

        return { message: '✏️ Campaña actualizada correctamente', idCampana, nombre };
    }


    /**
     * Eliminar campaña
     */
    async eliminarCampana(idCampana: string) {
        const query = `
      DELETE FROM \`${this.projectId}.${this.dataset}.Campanas\`
      WHERE idCampana = @idCampana
    `;
        await this.bigquery.query({ query, params: { idCampana } });
        return { message: '🗑️ Campaña eliminada', idCampana };
    }
}
