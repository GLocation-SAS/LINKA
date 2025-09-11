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
   */
  async listarCampanas(
    nombre?: string,
    fechaInicio?: string,
    fechaFin?: string,
    page = 1,
    limit = 10,
    idUsuario?: string,   // 👈 nuevo filtro
  ) {
    const conditions: string[] = [];
    const params: Record<string, any> = {};

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
    if (idUsuario) {
      conditions.push(`idUsuario = @idUsuario`);
      params.idUsuario = idUsuario;
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const offset = (page - 1) * limit;

    const query = `
      WITH base AS (
        SELECT idCampana, nombre, fecha_creacion, idUsuario
        FROM \`${this.projectId}.${this.dataset}.Campanas\`
        ${whereClause}
      ),
      aud AS (
        SELECT idCampana, COUNT(*) AS audienciasCount
        FROM \`${this.projectId}.${this.dataset}.Audiencias\`
        GROUP BY idCampana
      ),
      cont AS (
        SELECT a.idCampana, COUNT(*) AS contactosCount
        FROM \`${this.projectId}.${this.dataset}.Audiencias\` a
        JOIN \`${this.projectId}.${this.dataset}.Contactos\` c
          ON c.idAudiencia = a.idAudiencia
        GROUP BY a.idCampana
      )
      SELECT
        b.idCampana,
        b.nombre,
        b.fecha_creacion,
        b.idUsuario,
        IFNULL(aud.audienciasCount, 0) AS audienciasCount,
        IFNULL(cont.contactosCount, 0) AS contactosCount
      FROM base b
      LEFT JOIN aud ON aud.idCampana = b.idCampana
      LEFT JOIN cont ON cont.idCampana = b.idCampana
      ORDER BY b.fecha_creacion DESC
      LIMIT @limit OFFSET @offset
    `;

    const countQuery = `
      SELECT COUNT(*) AS total
      FROM \`${this.projectId}.${this.dataset}.Campanas\`
      ${whereClause}
    `;

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
   */
  async listarTodasCampanas(nombre?: string, idUsuario?: string) {
    const conditions: string[] = [];
    const params: Record<string, any> = {};

    if (nombre) {
      conditions.push(`nombre LIKE @nombre`);
      params.nombre = `%${nombre}%`;
    }
    if (idUsuario) {
      conditions.push(`idUsuario = @idUsuario`);
      params.idUsuario = idUsuario;
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
   * Eliminar una campaña y, en cascada, sus audiencias y contactos
   */
  async eliminarCampana(idCampana: string) {
    const query = `
    BEGIN TRANSACTION;

      -- 1) Borra contactos de todas las audiencias de la campaña
      DELETE FROM \`${this.projectId}.${this.dataset}.Contactos\`
      WHERE idAudiencia IN (
        SELECT a.idAudiencia
        FROM \`${this.projectId}.${this.dataset}.Audiencias\` a
        WHERE a.idCampana = @idCampana
      );

      -- 2) Borra audiencias de la campaña
      DELETE FROM \`${this.projectId}.${this.dataset}.Audiencias\`
      WHERE idCampana = @idCampana;

      -- 3) Borra la campaña
      DELETE FROM \`${this.projectId}.${this.dataset}.Campanas\`
      WHERE idCampana = @idCampana;

    COMMIT TRANSACTION;
  `;

    await this.bigquery.query({
      query,
      params: { idCampana },
    });

    return { message: '🗑️ Campaña, audiencias y contactos eliminados', idCampana };
  }

}
