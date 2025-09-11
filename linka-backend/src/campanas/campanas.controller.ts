import { Controller, Get, Post, Delete, Param, Body, Query, Patch } from '@nestjs/common';
import { CampanasService } from './campanas.service';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBody,
    ApiParam,
    ApiQuery,
    ApiBearerAuth,
} from '@nestjs/swagger';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/Guards/auth.guard';

@ApiTags('Campañas')
@ApiBearerAuth()
@Controller('campanas')
@UseGuards(AuthGuard)
export class CampanasController {
    constructor(private readonly campanasService: CampanasService) { }

    @Post('crear')
    @ApiOperation({ summary: 'Crear campaña' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                nombre: { type: 'string', example: 'Campaña Septiembre' },
                idUsuario: { type: 'string', example: 'uid123' },
            },
            required: ['nombre', 'idUsuario'],
        },
    })
    @ApiResponse({
        status: 201,
        description: '✅ Campaña creada correctamente',
        schema: {
            example: {
                message: '✅ Campaña creada correctamente',
                idCampana: 'cmp_20250906_ab12cd',
                nombre: 'Campaña Septiembre',
                idUsuario: 'uid123',
            },
        },
    })
    async crearCampana(
        @Body() body: { nombre: string; idUsuario: string },
    ) {
        return this.campanasService.crearCampana(body.nombre, body.idUsuario);
    }


    @Get('listar')
    @ApiOperation({
        summary: 'Listar campañas con filtros y paginación',
        description:
            'Puedes filtrar campañas por nombre (parcial), rango de fechas (fechaInicio, fechaFin), idUsuario y aplicar paginación con page + limit.',
    })
    @ApiQuery({
        name: 'nombre',
        required: false,
        description: 'Texto parcial para filtrar campañas por nombre',
        example: 'Septiembre',
    })
    @ApiQuery({
        name: 'fechaInicio',
        required: false,
        description: 'Fecha mínima (YYYY-MM-DD)',
        example: '2025-09-01',
    })
    @ApiQuery({
        name: 'fechaFin',
        required: false,
        description: 'Fecha máxima (YYYY-MM-DD)',
        example: '2025-09-06',
    })
    @ApiQuery({
        name: 'idUsuario',
        required: false,
        description: 'Filtrar campañas por ID de usuario',
        example: 'uid123',
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
        example: 5,
    })
    async listarCampanas(
        @Query('nombre') nombre?: string,
        @Query('fechaInicio') fechaInicio?: string,
        @Query('fechaFin') fechaFin?: string,
        @Query('idUsuario') idUsuario?: string,
        @Query('page') page = 1,
        @Query('limit') limit = 10,
    ) {
        return this.campanasService.listarCampanas(
            nombre,
            fechaInicio,
            fechaFin,
            Number(page),
            Number(limit),
            idUsuario,
        );
    }

    @Get('listar-todas')
    @ApiOperation({
        summary: 'Listar todas las campañas',
        description:
            'Devuelve todas las campañas sin paginación. Se puede aplicar un filtro opcional por nombre (texto parcial) o idUsuario.',
    })
    @ApiQuery({
        name: 'nombre',
        required: false,
        description: 'Texto parcial para filtrar campañas por nombre',
        example: 'Septiembre',
    })
    @ApiQuery({
        name: 'idUsuario',
        required: false,
        description: 'Filtrar campañas por ID de usuario',
        example: 'uid123',
    })
    async listarTodasCampanas(
        @Query('nombre') nombre?: string,
        @Query('idUsuario') idUsuario?: string,
    ) {
        return this.campanasService.listarTodasCampanas(nombre, idUsuario);
    }

    @Get('obtener/:idCampana')
    @ApiOperation({ summary: 'Obtener campaña por ID' })
    @ApiParam({ name: 'idCampana', type: String, example: 'cmp123' })
    @ApiResponse({
        status: 200,
        description: '✅ Campaña encontrada',
        schema: {
            example: {
                idCampana: 'cmp123',
                nombre: 'Campaña Septiembre',
                fecha_creacion: '2025-09-05T14:00:00.000Z',
                idUsuario: 'uid123',
            },
        },
    })
    @ApiResponse({ status: 404, description: '❌ Campaña no encontrada' })
    async obtenerCampana(@Param('idCampana') idCampana: string) {
        return this.campanasService.obtenerCampana(idCampana);
    }

    @Patch('actualizar/:idCampana')
    @ApiOperation({ summary: 'Actualizar campaña' })
    @ApiParam({ name: 'idCampana', type: String, example: 'cmp_123abc' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                nombre: { type: 'string', example: 'Campaña Actualizada' },
            },
            required: ['nombre'],
        },
    })
    @ApiResponse({
        status: 200,
        description: '✏️ Campaña actualizada correctamente',
        schema: {
            example: {
                message: '✏️ Campaña actualizada correctamente',
                idCampana: 'cmp_123abc',
                nombre: 'Campaña Actualizada',
            },
        },
    })
    async actualizarCampana(
        @Param('idCampana') idCampana: string,
        @Body() body: { nombre: string },
    ) {
        return this.campanasService.actualizarCampana(idCampana, body.nombre);
    }

    @Delete('eliminar/:idCampana')
    @ApiOperation({ summary: 'Eliminar campaña' })
    @ApiParam({ name: 'idCampana', type: String, example: 'cmp123' })
    @ApiResponse({
        status: 200,
        description: '🗑️ Campaña eliminada correctamente',
        schema: { example: { message: '🗑️ Campaña eliminada', idCampana: 'cmp123' } },
    })
    async eliminarCampana(@Param('idCampana') idCampana: string) {
        return this.campanasService.eliminarCampana(idCampana);
    }
}
