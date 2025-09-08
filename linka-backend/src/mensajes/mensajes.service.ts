import { Injectable, Inject } from '@nestjs/common';
import { BigQuery } from '@google-cloud/bigquery';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class MensajesService {
    constructor(@Inject('BIGQUERY') private readonly bigquery: BigQuery) { }

    private dataset = 'LINKA';
    private projectId = 'converso-346218';

    /**
     * Crear un mensaje
     */
    async crearMensaje(
        idCampana: string,
        idUsuario: string,
        idContacto: string,
        contenido: string,
        tipo: 'texto' | 'imagen' | 'video',
        url_contenido?: string, // 🔹 Nuevo campo opcional
    ) {
        const idMensaje = uuidv4();

        const query = `
    INSERT INTO \`${this.projectId}.${this.dataset}.Mensajes\`
    (idMensaje, idCampana, idUsuario, idContacto, contenido, tipo, fecha_envio, estado, url_contenido)
    VALUES (@idMensaje, @idCampana, @idUsuario, @idContacto, @contenido, @tipo, CURRENT_TIMESTAMP(), 'pendiente', @url_contenido)
  `;

        await this.bigquery.query({
            query,
            params: {
                idMensaje,
                idCampana,
                idUsuario,
                idContacto,
                contenido,
                tipo,
                url_contenido: url_contenido ?? null, // 👈 Si no se pasa, queda null
            },
        });

        return {
            message: '✅ Mensaje creado correctamente',
            idMensaje,
            tipo,
            estado: 'pendiente',
            url_contenido: url_contenido ?? null,
        };
    }


    /**
     * Listar mensajes con filtros y paginación
     * Incluye filtro por nombre de campaña y total de contactos asociados a la campaña
     */
    async listarMensajes(
        idCampana?: string,
        idUsuario?: string,
        tipo?: string,
        estado?: string,
        fechaInicio?: string,
        fechaFin?: string,
        nombreCampana?: string,
        page = 1,
        limit = 10,
    ) {
        let conditions: string[] = [];
        let params: Record<string, any> = {};

        if (idCampana) {
            conditions.push(`m.idCampana = @idCampana`);
            params.idCampana = idCampana;
        }
        if (idUsuario) {
            conditions.push(`m.idUsuario = @idUsuario`);
            params.idUsuario = idUsuario;
        }
        if (tipo) {
            conditions.push(`m.tipo = @tipo`);
            params.tipo = tipo;
        }
        if (estado) {
            conditions.push(`m.estado = @estado`);
            params.estado = estado;
        }
        if (fechaInicio) {
            conditions.push(`m.fecha_envio >= @fechaInicio`);
            params.fechaInicio = fechaInicio;
        }
        if (fechaFin) {
            conditions.push(`m.fecha_envio <= @fechaFin`);
            params.fechaFin = fechaFin;
        }
        if (nombreCampana) {
            conditions.push(`c.nombre LIKE @nombreCampana`);
            params.nombreCampana = `%${nombreCampana}%`;
        }

        const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

        // Query principal con JOIN a Campañas y total de contactos por campaña
        const query = `
    SELECT 
      m.idMensaje,
      m.idCampana,
      c.nombre AS nombre_campana,
      m.idUsuario,
      m.idContacto,
      m.contenido,
      m.tipo,
      m.fecha_envio,
      m.estado,
      (
        SELECT COUNT(DISTINCT ct.idContacto)
        FROM \`${this.projectId}.${this.dataset}.Audiencias\` a
        JOIN \`${this.projectId}.${this.dataset}.Contactos\` ct
          ON a.idAudiencia = ct.idAudiencia
        WHERE a.idCampana = m.idCampana
      ) AS total_contactos_campana
    FROM \`${this.projectId}.${this.dataset}.Mensajes\` m
    LEFT JOIN \`${this.projectId}.${this.dataset}.Campanas\` c
      ON m.idCampana = c.idCampana
    ${whereClause}
    ORDER BY m.fecha_envio DESC
    LIMIT @limit OFFSET @offset
  `;

        // Query para contar total
        const countQuery = `
    SELECT COUNT(*) as total
    FROM \`${this.projectId}.${this.dataset}.Mensajes\` m
    LEFT JOIN \`${this.projectId}.${this.dataset}.Campanas\` c
      ON m.idCampana = c.idCampana
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
     * Obtener un mensaje por ID con datos de la campaña y total de contactos asociados
     */
    async obtenerMensaje(idMensaje: string) {
        const query = `
    SELECT 
      m.idMensaje,
      m.idCampana,
      c.nombre AS nombre_campana,
      m.idUsuario,
      m.idContacto,
      m.contenido,
      m.tipo,
      m.url_contenido,
      m.fecha_envio,
      m.estado,
      (
        SELECT COUNT(DISTINCT ct.idContacto)
        FROM \`${this.projectId}.${this.dataset}.Audiencias\` a
        JOIN \`${this.projectId}.${this.dataset}.Contactos\` ct
          ON a.idAudiencia = ct.idAudiencia
        WHERE a.idCampana = m.idCampana
      ) AS total_contactos_campana
    FROM \`${this.projectId}.${this.dataset}.Mensajes\` m
    LEFT JOIN \`${this.projectId}.${this.dataset}.Campanas\` c
      ON m.idCampana = c.idCampana
    WHERE m.idMensaje = @idMensaje
    LIMIT 1
  `;

        const [rows] = await this.bigquery.query({
            query,
            params: { idMensaje },
        });

        return rows[0] || null;
    }


    /**
     * Eliminar mensaje
     */
    async eliminarMensaje(idMensaje: string) {
        const query = `
      DELETE FROM \`${this.projectId}.${this.dataset}.Mensajes\`
      WHERE idMensaje = @idMensaje
    `;
        await this.bigquery.query({ query, params: { idMensaje } });
        return { message: '🗑️ Mensaje eliminado', idMensaje };
    }
}
