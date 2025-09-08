import { Controller, Get, Query } from '@nestjs/common';
import { HistorialService } from './historial.service';
import {
  ApiTags,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiBearerAuth
} from '@nestjs/swagger';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/Guards/auth.guard';

@ApiTags('Historial')
@ApiBearerAuth()
@Controller('historial')
@UseGuards(AuthGuard)
export class HistorialController {
  constructor(private readonly historialService: HistorialService) {}

  @Get('general')
  @ApiOperation({
    summary: 'Obtener historial general',
    description:
      'Devuelve un log cronológico con las acciones realizadas por los usuarios (crear campaña, crear audiencia, enviar mensaje). ' +
      'Permite filtrar por usuario, tipo de acción, rango de fechas y soporta paginación.',
  })
  @ApiQuery({
    name: 'usuario',
    required: false,
    description: 'Filtrar por nombre del usuario (displayName)',
    example: 'Juan Pérez',
  })
  @ApiQuery({
    name: 'tipo',
    required: false,
    description: 'Filtrar por tipo de acción',
    enum: ['campaña', 'audiencia', 'mensaje'],
    example: 'mensaje',
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
    example: '2025-09-06',
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
  @ApiQuery({
    name: 'order',
    required: false,
    description: 'Orden de resultados',
    enum: ['asc', 'desc'],
    example: 'desc',
  })
  @ApiResponse({
    status: 200,
    description: '✅ Historial obtenido correctamente.',
    schema: {
      example: {
        data: [
          {
            usuario: 'Juan Pérez',
            accion: 'creó la campaña "Campaña Septiembre"',
            fecha: '2025-09-02T12:00:00.000Z',
            tipo: 'campaña',
          },
          {
            usuario: 'Juan Pérez',
            accion: 'envió un mensaje sms "Hola Mundo"',
            fecha: '2025-09-03T14:30:00.000Z',
            tipo: 'mensaje',
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
  async getHistorialGeneral(
    @Query('usuario') usuario?: string,
    @Query('tipo') tipo?: 'campaña' | 'audiencia' | 'mensaje',
    @Query('fechaInicio') fechaInicio?: string,
    @Query('fechaFin') fechaFin?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('order') order: 'asc' | 'desc' = 'desc',
  ) {
    return this.historialService.getHistorialGeneral(
      usuario,
      tipo,
      fechaInicio,
      fechaFin,
      Number(page),
      Number(limit),
      order,
    );
  }
}
