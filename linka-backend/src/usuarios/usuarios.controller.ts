import { Controller, Get, Post, Delete, Param, Body, Query,Patch  } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';

@ApiTags('Usuarios')
@Controller('usuarios')
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
      },
      required: ['uid', 'email', 'displayName', 'rol'],
    },
  })
  @ApiResponse({ status: 201, description: '✅ Usuario creado correctamente.' })
  async crearUsuario(
    @Body()
    body: { uid: string; email: string; displayName: string; rol: string },
  ) {
    return this.usuariosService.crearUsuario(
      body.uid,
      body.email,
      body.displayName,
      body.rol,
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
    summary: 'Listar usuarios con filtros y paginación',
    description:
      'Puedes filtrar por email o nombre parcial en un único campo (`filter`). La búsqueda ignora mayúsculas y minúsculas. Controla la paginación con `page` y `limit`.',
  })
  @ApiQuery({
    name: 'filter',
    required: false,
    description: 'Texto parcial para buscar en email o display_name (case-insensitive)',
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
  @ApiResponse({
    status: 200,
    description: '✅ Lista de usuarios obtenida correctamente.',
    schema: {
      example: {
        usuarios: [
          {
            uid: 'abc123',
            email: 'usuario@ejemplo.com',
            display_name: 'Juan Pérez',
            rol: 'gestor',
            fecha_creacion: '2025-09-05T16:00:00.000Z',
          },
          {
            uid: 'xyz456',
            email: 'otro@ejemplo.com',
            display_name: 'María Gómez',
            rol: 'admin',
            fecha_creacion: '2025-09-05T17:00:00.000Z',
          },
        ],
        pagination: {
          page: 1,
          limit: 10,
          totalCount: 37,
          totalPages: 4,
          hasNextPage: true,
        },
      },
    },
  })
  async listarUsuarios(
    @Query('filter') filter?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.usuariosService.listarUsuarios(filter, Number(page), Number(limit));
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
      },
      description:
        'Puedes enviar uno o varios campos para actualizar (email, displayName o rol).',
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
        fecha_creacion: '2025-09-05T16:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 404, description: '❌ Usuario no encontrado.' })
  async actualizarUsuario(
    @Param('uid') uid: string,
    @Body() body: Partial<{ email: string; displayName: string; rol: string }>,
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
