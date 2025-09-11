import { Injectable, Inject } from '@nestjs/common';
import { BigQuery } from '@google-cloud/bigquery';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AudienciasService {
    constructor(@Inject('BIGQUERY') private readonly bigquery: BigQuery) { }

    private dataset = 'LINKA';
    private projectId = 'converso-346218';

    /**
     * Crear una audiencia con contactos asociados
     */
    async crearAudiencia(
        nombre: string,
        idCampana: string,
        idUsuario: string,
        contactos: { nombre_contacto: string; numero_contacto: string }[] = [],
    ) {
        const idAudiencia = uuidv4();

        // 1️⃣ Insertar audiencia
        const queryAudiencia = `
      INSERT INTO \`${this.projectId}.${this.dataset}.Audiencias\`
      (idAudiencia, nombre, fecha_creacion, idCampana, idUsuario)
      VALUES (@idAudiencia, @nombre, CURRENT_TIMESTAMP(), @idCampana, @idUsuario)
    `;

        await this.bigquery.query({
            query: queryAudiencia,
            params: { idAudiencia, nombre, idCampana, idUsuario },
        });

        // 2️⃣ Insertar contactos vinculados
        for (const contacto of contactos) {
            const idContacto = uuidv4();
            const queryContacto = `
        INSERT INTO \`${this.projectId}.${this.dataset}.Contactos\`
        (idContacto, nombre_contacto, numero_contacto, idAudiencia)
        VALUES (@idContacto, @nombre_contacto, @numero_contacto, @idAudiencia)
      `;
            await this.bigquery.query({
                query: queryContacto,
                params: {
                    idContacto,
                    nombre_contacto: contacto.nombre_contacto,
                    numero_contacto: contacto.numero_contacto,
                    idAudiencia,
                },
            });
        }

        return {
            message: '✅ Audiencia creada correctamente',
            idAudiencia,
            nombre,
            idCampana,
            idUsuario,
            contactosAgregados: contactos.length,
        };
    }

    /**
     * Agregar un contacto a una audiencia
     */
    async agregarContacto(nombre_contacto: string, numero_contacto: string) {
        const idContacto = uuidv4();

        const query = `
      INSERT INTO \`${this.projectId}.${this.dataset}.Contactos\` (idContacto, nombre_contacto, numero_contacto)
      VALUES (@idContacto, @nombre_contacto, @numero_contacto)
    `;

        await this.bigquery.query({
            query,
            params: { idContacto, nombre_contacto, numero_contacto },
        });

        return { message: '📇 Contacto agregado', idContacto, nombre_contacto, numero_contacto };
    }

    /**
 * Listar audiencias con filtros, cantidad de contactos, nombre de campaña y paginación
 */
    async listarAudiencias(
        nombreAudiencia?: string,
        nombreCampana?: string,
        fechaInicio?: string,
        fechaFin?: string,
        page = 1,
        limit = 10,
        idUsuario?: string,   // 👈 nuevo filtro
    ) {
        let conditions: string[] = [];
        let params: Record<string, any> = {};

        if (nombreAudiencia) {
            conditions.push(`a.nombre LIKE @nombreAudiencia`);
            params.nombreAudiencia = `%${nombreAudiencia}%`;
        }

        if (nombreCampana) {
            conditions.push(`c.nombre LIKE @nombreCampana`);
            params.nombreCampana = `%${nombreCampana}%`;
        }

        if (fechaInicio) {
            conditions.push(`a.fecha_creacion >= @fechaInicio`);
            params.fechaInicio = fechaInicio;
        }

        if (fechaFin) {
            conditions.push(`a.fecha_creacion <= @fechaFin`);
            params.fechaFin = fechaFin;
        }

        if (idUsuario) {
            conditions.push(`a.idUsuario = @idUsuario`);
            params.idUsuario = idUsuario;
        }

        const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

        // Query principal con paginación
        const query = `
      SELECT 
        a.idAudiencia,
        a.nombre AS nombre_audiencia,
        a.fecha_creacion,
        a.idCampana,
        c.nombre AS nombre_campana,
        a.idUsuario,
        COUNT(ct.idContacto) AS total_contactos
      FROM \`${this.projectId}.${this.dataset}.Audiencias\` a
      LEFT JOIN \`${this.projectId}.${this.dataset}.Campanas\` c
        ON a.idCampana = c.idCampana
      LEFT JOIN \`${this.projectId}.${this.dataset}.Contactos\` ct
        ON a.idAudiencia = ct.idAudiencia
      ${whereClause}
      GROUP BY a.idAudiencia, a.nombre, a.fecha_creacion, a.idCampana, c.nombre, a.idUsuario
      ORDER BY a.fecha_creacion DESC
      LIMIT @limit OFFSET @offset
    `;

        // Query para contar total
        const countQuery = `
      SELECT COUNT(*) as total
      FROM (
        SELECT a.idAudiencia
        FROM \`${this.projectId}.${this.dataset}.Audiencias\` a
        LEFT JOIN \`${this.projectId}.${this.dataset}.Campanas\` c
          ON a.idCampana = c.idCampana
        ${whereClause}
        GROUP BY a.idAudiencia
      )
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


    async obtenerAudienciaConContactos(idAudiencia: string) {
        // 1️⃣ Obtener datos de la audiencia + campaña
        const queryAudiencia = `
    SELECT 
      a.idAudiencia,
      a.nombre AS nombre_audiencia,
      a.fecha_creacion,
      a.idCampana,
      c.nombre AS nombre_campana,
      a.idUsuario
    FROM \`${this.projectId}.${this.dataset}.Audiencias\` a
    LEFT JOIN \`${this.projectId}.${this.dataset}.Campanas\` c
      ON a.idCampana = c.idCampana
    WHERE a.idAudiencia = @idAudiencia
    LIMIT 1
  `;
        const [audienciaRows] = await this.bigquery.query({
            query: queryAudiencia,
            params: { idAudiencia },
        });

        if (!audienciaRows.length) {
            return null;
        }

        const audiencia = audienciaRows[0];

        // 2️⃣ Obtener contactos vinculados
        const queryContactos = `
    SELECT idContacto, nombre_contacto, numero_contacto
    FROM \`${this.projectId}.${this.dataset}.Contactos\`
    WHERE idAudiencia = @idAudiencia
    ORDER BY nombre_contacto ASC
  `;
        const [contactos] = await this.bigquery.query({
            query: queryContactos,
            params: { idAudiencia },
        });

        return {
            ...audiencia,
            contactos,
        };
    }

    /**
     * Listar contactos
     */
    async listarContactos() {
        const query = `
      SELECT idContacto, nombre_contacto, numero_contacto
      FROM \`${this.projectId}.${this.dataset}.Contactos\`
      ORDER BY nombre_contacto ASC
    `;
        const [rows] = await this.bigquery.query({ query });
        return rows;
    }


    /**
 * Actualizar audiencia (nombre, campaña y contactos)
 */
    async actualizarAudiencia(
        idAudiencia: string,
        nombre?: string,
        idCampana?: string,
        contactosAgregar?: { nombre_contacto: string; numero_contacto: string }[],
        contactosEliminar?: string[],
    ) {
        // 1️⃣ Actualizar nombre y/o campaña
        if (nombre || idCampana) {
            const updates: string[] = [];
            const params: Record<string, any> = { idAudiencia };

            if (nombre) {
                updates.push(`nombre = @nombre`);
                params.nombre = nombre;
            }
            if (idCampana) {
                updates.push(`idCampana = @idCampana`);
                params.idCampana = idCampana;
            }

            const query = `
      UPDATE \`${this.projectId}.${this.dataset}.Audiencias\`
      SET ${updates.join(', ')}
      WHERE idAudiencia = @idAudiencia
    `;

            await this.bigquery.query({ query, params });
        }

        // 2️⃣ Eliminar contactos
        if (contactosEliminar && contactosEliminar.length > 0) {
            const queryDelete = `
      DELETE FROM \`${this.projectId}.${this.dataset}.Contactos\`
      WHERE idAudiencia = @idAudiencia
      AND idContacto IN UNNEST(@contactosEliminar)
    `;
            await this.bigquery.query({
                query: queryDelete,
                params: { idAudiencia, contactosEliminar },
            });
        }

        // 3️⃣ Agregar nuevos contactos
        if (contactosAgregar && contactosAgregar.length > 0) {
            for (const contacto of contactosAgregar) {
                const idContacto = uuidv4();
                const queryInsert = `
        INSERT INTO \`${this.projectId}.${this.dataset}.Contactos\`
        (idContacto, nombre_contacto, numero_contacto, idAudiencia)
        VALUES (@idContacto, @nombre_contacto, @numero_contacto, @idAudiencia)
      `;
                await this.bigquery.query({
                    query: queryInsert,
                    params: {
                        idContacto,
                        nombre_contacto: contacto.nombre_contacto,
                        numero_contacto: contacto.numero_contacto,
                        idAudiencia,
                    },
                });
            }
        }

        return {
            message: '✏️ Audiencia actualizada correctamente',
            idAudiencia,
            cambios: {
                nombre: nombre ?? 'sin cambios',
                idCampana: idCampana ?? 'sin cambios',
                contactosAgregados: contactosAgregar?.length ?? 0,
                contactosEliminados: contactosEliminar?.length ?? 0,
            },
        };
    }


    /**
     * Eliminar una audiencia
     */
    async eliminarAudiencia(idAudiencia: string) {
        const query = `
    BEGIN TRANSACTION;

      -- 1) Borra contactos de la audiencia
      DELETE FROM \`${this.projectId}.${this.dataset}.Contactos\`
      WHERE idAudiencia = @idAudiencia;

      -- 2) Borra la audiencia
      DELETE FROM \`${this.projectId}.${this.dataset}.Audiencias\`
      WHERE idAudiencia = @idAudiencia;

    COMMIT TRANSACTION;
  `;

        await this.bigquery.query({
            query,
            params: { idAudiencia },
        });

        return { message: '🗑️ Audiencia y contactos eliminados', idAudiencia };
    }
}
