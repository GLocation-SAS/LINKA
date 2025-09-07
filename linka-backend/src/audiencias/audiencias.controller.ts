import { Controller, Post, Get, Delete, Param, Body, Patch ,Query} from '@nestjs/common';
import { AudienciasService } from './audiencias.service';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBody,
    ApiParam,
    ApiQuery
} from '@nestjs/swagger';

@ApiTags('Audiencias')
@Controller('audiencias')
export class AudienciasController {
    constructor(private readonly audienciasService: AudienciasService) { }
    @Post('crear')
    @ApiOperation({ summary: 'Crear audiencia con contactos' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                nombre: { type: 'string', example: 'Audiencia Jóvenes 18-25' },
                idCampana: { type: 'string', example: 'cmp_123abc' },
                idUsuario: { type: 'string', example: 'uid123' },
                contactos: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            nombre_contacto: { type: 'string', example: 'Juan Pérez' },
                            numero_contacto: { type: 'string', example: '+573001112233' },
                        },
                    },
                },
            },
            required: ['nombre', 'idCampana', 'idUsuario'],
        },
    })
    @ApiResponse({ status: 201, description: '✅ Audiencia creada con contactos' })
    async crearAudiencia(
        @Body()
        body: {
            nombre: string;
            idCampana: string;
            idUsuario: string;
            contactos?: { nombre_contacto: string; numero_contacto: string }[];
        },
    ) {
        return this.audienciasService.crearAudiencia(
            body.nombre,
            body.idCampana,
            body.idUsuario,
            body.contactos,
        );
    }

    @Post('agregar-contacto')
    @ApiOperation({ summary: 'Agregar contacto a una audiencia' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                nombre_contacto: { type: 'string', example: 'Juan Pérez' },
                numero_contacto: { type: 'string', example: '+573001112233' },
            },
            required: ['nombre_contacto', 'numero_contacto'],
        },
    })
    @ApiResponse({ status: 201, description: '📇 Contacto agregado correctamente' })
    async agregarContacto(@Body() body: { nombre_contacto: string; numero_contacto: string }) {
        return this.audienciasService.agregarContacto(body.nombre_contacto, body.numero_contacto);
    }

    @Get('listar')
    @ApiOperation({
        summary: 'Listar audiencias con filtros y paginación',
        description:
            'Puedes filtrar por nombre de audiencia, nombre de campaña y rango de fechas. También soporta paginación con `page` y `limit`.',
    })
    @ApiQuery({
        name: 'nombreAudiencia',
        required: false,
        description: 'Texto parcial para buscar en el nombre de la audiencia',
        example: 'Jovenes',
    })
    @ApiQuery({
        name: 'nombreCampana',
        required: false,
        description: 'Texto parcial para buscar en el nombre de la campaña',
        example: 'Septiembre',
    })
    @ApiQuery({
        name: 'fechaInicio',
        required: false,
        description: 'Fecha mínima en formato YYYY-MM-DD',
        example: '2025-09-01',
    })
    @ApiQuery({
        name: 'fechaFin',
        required: false,
        description: 'Fecha máxima en formato YYYY-MM-DD',
        example: '2025-09-07',
    })
    @ApiQuery({
        name: 'page',
        required: false,
        description: 'Número de página (default: 1)',
        example: 1,
    })
    @ApiQuery({
        name: 'limit',
        required: false,
        description: 'Cantidad de resultados por página (default: 10)',
        example: 10,
    })
    @ApiResponse({
        status: 200,
        description: '✅ Lista de audiencias obtenida correctamente.',
        schema: {
            example: {
                data: [
                    {
                        idAudiencia: 'aud_123abc',
                        nombre_audiencia: 'Audiencia Jóvenes 18-25',
                        fecha_creacion: '2025-09-06T14:00:00.000Z',
                        idCampana: 'cmp_123abc',
                        nombre_campana: 'Campaña Septiembre',
                        idUsuario: 'uid123',
                        total_contactos: 3,
                    },
                ],
                pagination: {
                    page: 1,
                    limit: 10,
                    totalCount: 12,
                    totalPages: 2,
                    hasNextPage: true,
                },
            },
        },
    })
    async listarAudiencias(
        @Query('nombreAudiencia') nombreAudiencia?: string,
        @Query('nombreCampana') nombreCampana?: string,
        @Query('fechaInicio') fechaInicio?: string,
        @Query('fechaFin') fechaFin?: string,
        @Query('page') page = 1,
        @Query('limit') limit = 10,
    ) {
        return this.audienciasService.listarAudiencias(
            nombreAudiencia,
            nombreCampana,
            fechaInicio,
            fechaFin,
            Number(page),
            Number(limit),
        );
    }

    @Get('obtener/:idAudiencia')
    @ApiOperation({ summary: 'Obtener audiencia por ID con campaña y contactos' })
    @ApiParam({ name: 'idAudiencia', type: String, example: 'aud_123abc' })
    @ApiResponse({
        status: 200,
        description: '✅ Audiencia encontrada con campaña y contactos asociados',
        schema: {
            example: {
                idAudiencia: 'aud_123abc',
                nombre_audiencia: 'Audiencia Jóvenes 18-25',
                fecha_creacion: '2025-09-06T14:00:00.000Z',
                idCampana: 'cmp_123abc',
                nombre_campana: 'Campaña Septiembre',
                idUsuario: 'uid123',
                contactos: [
                    { idContacto: 'cont_1', nombre_contacto: 'Juan Pérez', numero_contacto: '+573001112233' },
                    { idContacto: 'cont_2', nombre_contacto: 'María Gómez', numero_contacto: '+573004445566' }
                ]
            },
        },
    })
    @ApiResponse({ status: 404, description: '❌ Audiencia no encontrada' })
    async obtenerAudiencia(@Param('idAudiencia') idAudiencia: string) {
        const result = await this.audienciasService.obtenerAudienciaConContactos(idAudiencia);
        if (!result) {
            return { message: '❌ Audiencia no encontrada' };
        }
        return result;
    }

    @Get('listar-contactos')
    @ApiOperation({ summary: 'Listar contactos' })
    @ApiResponse({ status: 200, description: '✅ Lista de contactos' })
    async listarContactos() {
        return this.audienciasService.listarContactos();
    }

    @Patch('actualizar/:idAudiencia')
    @ApiOperation({ summary: 'Actualizar audiencia (nombre, campaña y contactos)' })
    @ApiParam({ name: 'idAudiencia', type: String, example: 'aud_123abc' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                nombre: { type: 'string', example: 'Audiencia Actualizada' },
                idCampana: { type: 'string', example: 'cmp_456xyz' },
                contactosAgregar: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            nombre_contacto: { type: 'string', example: 'Pedro Gómez' },
                            numero_contacto: { type: 'string', example: '+573006667778' },
                        },
                    },
                },
                contactosEliminar: {
                    type: 'array',
                    items: { type: 'string', example: 'cont_123' },
                },
            },
        },
    })
    @ApiResponse({
        status: 200,
        description: '✏️ Audiencia actualizada correctamente',
        schema: {
            example: {
                message: '✏️ Audiencia actualizada correctamente',
                idAudiencia: 'aud_123abc',
                cambios: {
                    nombre: 'Audiencia Actualizada',
                    idCampana: 'cmp_456xyz',
                    contactosAgregados: 2,
                    contactosEliminados: 1,
                },
            },
        },
    })
    async actualizarAudiencia(
        @Param('idAudiencia') idAudiencia: string,
        @Body()
        body: {
            nombre?: string;
            idCampana?: string;
            contactosAgregar?: { nombre_contacto: string; numero_contacto: string }[];
            contactosEliminar?: string[];
        },
    ) {
        return this.audienciasService.actualizarAudiencia(
            idAudiencia,
            body.nombre,
            body.idCampana,
            body.contactosAgregar,
            body.contactosEliminar,
        );
    }

    @Delete('eliminar/:idAudiencia')
    @ApiOperation({ summary: 'Eliminar audiencia por ID' })
    @ApiParam({ name: 'idAudiencia', type: String, example: 'aud_123abc' })
    @ApiResponse({ status: 200, description: '🗑️ Audiencia eliminada correctamente' })
    async eliminarAudiencia(@Param('idAudiencia') idAudiencia: string) {
        return this.audienciasService.eliminarAudiencia(idAudiencia);
    }
}
