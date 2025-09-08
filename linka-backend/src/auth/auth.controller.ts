import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('generate-token')
    @ApiOperation({ summary: 'Generar ID Token para una URL' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                url: { type: 'string', example: 'https://example.com' },
            },
            required: ['url'],
        },
    })
    @ApiResponse({
        status: 200,
        description: '✅ Token generado exitosamente.',
        schema: {
            example: {
                status: 'success',
                message: 'Token generado exitosamente',
                token: 'ya29.c.Kp8B...',
                expiresIn: '1 hora',
            },
        },
    })
    async generateToken(@Body('url') url: string) {
        if (!url) {
            throw new HttpException(
                'Falta el parámetro requerido: url',
                HttpStatus.BAD_REQUEST,
            );
        }

        try {
            const token = await this.authService.generateIdToken(url);
            return {
                status: 'success',
                message: 'Token generado exitosamente',
                token,
                expiresIn: '1 hora',
            };
        } catch (error) {
            throw new HttpException(
                error.message,
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
}
