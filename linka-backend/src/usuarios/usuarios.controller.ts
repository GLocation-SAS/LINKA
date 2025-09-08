import { Controller, Get, Post, Delete, Param, Body, Query, Patch } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
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

@ApiTags('Usuarios')
@ApiBearerAuth()
@Controller('usuarios')
@UseGuards(AuthGuard)
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) { }

  @Post('crear')
  @ApiOperation({ summary: 'Crear un usuario en Firestore' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        uid: { type: 'string', example: 'abc123' },
        email: { type: 'string', example: 'usuario@ejemplo.com' },
        displayName: { type: 'string', example: 'Juan Pérez' },
        rol: { type: 'string', enum: ['admin', 'gestor'], example: 'gestor' },
        estado: { type: 'string', enum: ['activo', 'inactivo'], example: 'activo' }, // 👈 nuevo campo
      },
      required: ['uid', 'email', 'displayName', 'rol', 'estado'],
    },
  })
  @ApiResponse({ status: 201, description: '✅ Usuario creado correctamente.' })
  async crearUsuario(
    @Body()
    body: { uid: string; email: string; displayName: string; rol: string; estado: string },
  ) {
    return this.usuariosService.crearUsuario(
      body.uid,
      body.email,
      body.displayName,
      body.rol,
      body.estado,
    );
  }

  @Get('obtener/:uid')
  @ApiOperation({ summary: 'Obtener un usuario por UID' })
  @ApiParam({ name: 'uid', type: String, example: 'abc123' })
  @ApiResponse({
    status: 200,
    description: '✅ Usuario encontrado.',
    schema: {
      example: {
        uid: 'abc123',
        email: 'usuario@ejemplo.com',
        display_name: 'Juan Pérez',
        rol: 'gestor',
        fecha_creacion: '2025-09-05T16:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 404, description: '❌ Usuario no encontrado.' })
  async obtenerUsuario(@Param('uid') uid: string) {
    return this.usuariosService.obtenerUsuario(uid);
  }

  @Get('listar')
  @ApiOperation({
    summary: 'Listar usuarios con filtros, paginación y rango de fechas',
    description:
      'Puedes filtrar por email/nombre parcial (`filter`) y/o por rango de fechas de creación (`startDate`, `endDate`). La búsqueda ignora mayúsculas/minúsculas.',
  })
  @ApiQuery({
    name: 'filter',
    required: false,
    description: 'Texto parcial para buscar en email o display_name',
    example: 'juan',
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
    description: 'Cantidad máxima de usuarios por página (default: 10)',
    example: 10,
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    description: 'Fecha inicial (ISO string)',
    example: '2025-09-01T00:00:00.000Z',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    description: 'Fecha final (ISO string)',
    example: '2025-09-07T23:59:59.999Z',
  })
  @ApiResponse({
    status: 200,
    description: '✅ Lista de usuarios obtenida correctamente.',
  })
  async listarUsuarios(
    @Query('filter') filter?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.usuariosService.listarUsuarios(
      filter,
      Number(page),
      Number(limit),
      startDate,
      endDate,
    );
  }


  @Patch('actualizar/:uid')
  @ApiOperation({ summary: 'Actualizar un usuario en Firestore' })
  @ApiParam({ name: 'uid', type: String, example: 'abc123' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', example: 'nuevo@ejemplo.com' },
        displayName: { type: 'string', example: 'Nuevo Nombre' },
        rol: { type: 'string', enum: ['admin', 'gestor'], example: 'admin' },
        estado: { type: 'string', enum: ['activo', 'inactivo'], example: 'inactivo' }, // 👈 nuevo campo
      },
      description:
        'Puedes enviar uno o varios campos para actualizar (email, displayName, rol o estado).',
    },
  })
  @ApiResponse({
    status: 200,
    description: '✅ Usuario actualizado correctamente.',
    schema: {
      example: {
        uid: 'abc123',
        email: 'nuevo@ejemplo.com',
        display_name: 'Nuevo Nombre',
        rol: 'admin',
        estado: 'inactivo',
        fecha_creacion: '2025-09-05T16:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 404, description: '❌ Usuario no encontrado.' })
  async actualizarUsuario(
    @Param('uid') uid: string,
    @Body() body: Partial<{ email: string; displayName: string; rol: string; estado: 'activo' | 'inactivo' }>,
  ) {
    return this.usuariosService.actualizarUsuario(uid, body);
  }


  @Delete('eliminar/:uid')
  @ApiOperation({ summary: 'Eliminar un usuario por UID' })
  @ApiParam({ name: 'uid', type: String, example: 'abc123' })
  @ApiResponse({
    status: 200,
    description: '✅ Usuario eliminado correctamente.',
    schema: { example: { deleted: true, uid: 'abc123' } },
  })
  async eliminarUsuario(@Param('uid') uid: string) {
    return this.usuariosService.eliminarUsuario(uid);
  }
}
