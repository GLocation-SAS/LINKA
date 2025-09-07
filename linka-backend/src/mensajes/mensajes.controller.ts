import { Controller, Get, Post, Delete, Param, Body, Query } from '@nestjs/common';
import { MensajesService } from './mensajes.service';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBody,
    ApiParam,
    ApiQuery,
} from '@nestjs/swagger';

@ApiTags('Mensajes')
@Controller('mensajes')
export class MensajesController {
    constructor(private readonly mensajesService: MensajesService) { }

    @Post('crear')
    @ApiOperation({ summary: 'Crear un mensaje' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                idCampana: { type: 'string', example: 'cmp_123' },
                idUsuario: { type: 'string', example: 'uid_123' },
                idContacto: { type: 'string', example: 'cont_123' },
                contenido: {
                    type: 'string',
                    example: 'Hola, este es un mensaje de prueba',
                },
                tipo: {
                    type: 'string',
                    enum: ['texto', 'imagen', 'video'],
                    example: 'texto',
                },
                url_contenido: {
                    type: 'string',
                    example: 'https://mi-bucket.s3.amazonaws.com/imagen.jpg',
                    description:
                        'URL del contenido. Obligatorio si el tipo es imagen o video, opcional en texto.',
                },
            },
            required: ['idCampana', 'idUsuario', 'idContacto', 'contenido', 'tipo'],
        },
    })
    @ApiResponse({
        status: 201,
        description: '✅ Mensaje creado correctamente.',
    })
    async crearMensaje(
        @Body()
        body: {
            idCampana: string;
            idUsuario: string;
            idContacto: string;
            contenido: string;
            tipo: 'texto' | 'imagen' | 'video';
            url_contenido?: string;
        },
    ) {
        return this.mensajesService.crearMensaje(
            body.idCampana,
            body.idUsuario,
            body.idContacto,
            body.contenido,
            body.tipo,
            body.url_contenido,
        );
    }

    @Get('listar')
    @ApiOperation({
        summary: 'Listar mensajes con filtros y paginación',
        description:
            'Puedes filtrar por campaña, usuario, tipo, estado, rango de fechas y nombre de campaña. Además, cada mensaje incluye el total de contactos asociados a la campaña.',
    })
    @ApiQuery({ name: 'idCampana', required: false, description: 'Filtrar por ID de campaña' })
    @ApiQuery({ name: 'idUsuario', required: false, description: 'Filtrar por ID de usuario' })
    @ApiQuery({ name: 'tipo', required: false, enum: ['texto', 'imagen', 'video'], description: 'Filtrar por tipo de mensaje' })
    @ApiQuery({ name: 'estado', required: false, enum: ['pendiente', 'enviado', 'fallido'], description: 'Filtrar por estado del mensaje' })
    @ApiQuery({ name: 'fechaInicio', required: false, example: '2025-09-01', description: 'Fecha mínima (YYYY-MM-DD)' })
    @ApiQuery({ name: 'fechaFin', required: false, example: '2025-09-07', description: 'Fecha máxima (YYYY-MM-DD)' })
    @ApiQuery({ name: 'nombreCampana', required: false, example: 'Campaña Septiembre', description: 'Texto parcial del nombre de la campaña' })
    @ApiQuery({ name: 'page', required: false, example: 1, description: 'Número de página (default: 1)' })
    @ApiQuery({ name: 'limit', required: false, example: 10, description: 'Resultados por página (default: 10)' })
    @ApiResponse({
        status: 200,
        description: '✅ Lista de mensajes obtenida correctamente.',
        schema: {
            example: {
                data: [
                    {
                        idMensaje: 'msg_123',
                        idCampana: 'cmp_456',
                        nombre_campana: 'Campaña Septiembre',
                        idUsuario: 'uid_123',
                        idContacto: 'cont_789',
                        contenido: 'Hola mundo',
                        tipo: 'texto',
                        fecha_envio: '2025-09-07T15:30:00.000Z',
                        estado: 'enviado',
                        total_contactos_campana: 42,
                    },
                ],
                pagination: {
                    page: 1,
                    limit: 10,
                    totalCount: 1,
                    totalPages: 1,
                    hasNextPage: false,
                },
            },
        },
    })
    async listarMensajes(
        @Query('idCampana') idCampana?: string,
        @Query('idUsuario') idUsuario?: string,
        @Query('tipo') tipo?: string,
        @Query('estado') estado?: string,
        @Query('fechaInicio') fechaInicio?: string,
        @Query('fechaFin') fechaFin?: string,
        @Query('nombreCampana') nombreCampana?: string,
        @Query('page') page = 1,
        @Query('limit') limit = 10,
    ) {
        return this.mensajesService.listarMensajes(
            idCampana,
            idUsuario,
            tipo,
            estado,
            fechaInicio,
            fechaFin,
            nombreCampana,
            Number(page),
            Number(limit),
        );
    }

    @Get('obtener/:idMensaje')
    @ApiOperation({
        summary: 'Obtener un mensaje por ID',
        description:
            'Devuelve la información completa de un mensaje, incluyendo la campaña asociada y el total de contactos de la campaña.',
    })
    @ApiParam({ name: 'idMensaje', type: String, example: 'msg_123' })
    @ApiResponse({
        status: 200,
        description: '✅ Mensaje encontrado.',
        schema: {
            example: {
                idMensaje: 'msg_123',
                idCampana: 'cmp_456',
                nombre_campana: 'Campaña Septiembre',
                idUsuario: 'uid_123',
                idContacto: 'cont_789',
                contenido: 'Promoción exclusiva',
                tipo: 'imagen',
                url_contenido: 'https://mi-bucket.s3.amazonaws.com/promo.jpg',
                fecha_envio: '2025-09-07T15:30:00.000Z',
                estado: 'pendiente',
                total_contactos_campana: 42,
            },
        },
    })
    @ApiResponse({ status: 404, description: '❌ Mensaje no encontrado.' })
    async obtenerMensaje(@Param('idMensaje') idMensaje: string) {
        return this.mensajesService.obtenerMensaje(idMensaje);
    }


    @Delete('eliminar/:idMensaje')
    @ApiOperation({ summary: 'Eliminar mensaje por ID' })
    @ApiParam({ name: 'idMensaje', type: String, example: 'msg_123' })
    @ApiResponse({
        status: 200,
        description: '🗑️ Mensaje eliminado correctamente.',
    })
    async eliminarMensaje(@Param('idMensaje') idMensaje: string) {
        return this.mensajesService.eliminarMensaje(idMensaje);
    }
}
