import {
    Controller,
    Get,
    Post,
    Query,
    UploadedFile,
    UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadsService } from './uploads.service';
import {
    ApiConsumes,
    ApiBody,
    ApiOperation,
    ApiResponse,
    ApiTags,
    ApiBearerAuth,
    ApiQuery
} from '@nestjs/swagger';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/Guards/auth.guard';

@ApiTags('Uploads')
@ApiBearerAuth()
@Controller('uploads')
@UseGuards(AuthGuard)
export class UploadsController {
    constructor(private readonly uploadsService: UploadsService) { }

    @Post()
    @UseInterceptors(FileInterceptor('file', {
        limits: { fileSize: 1024 * 1024 * 1024 }, // 1 GB
    }))

    @ApiOperation({ summary: 'Subir un archivo al bucket de GCP' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                    description: 'Archivo a subir (imagen, documento o video)',
                },
            },
        },
    })
    @ApiResponse({
        status: 201,
        description: 'Archivo subido exitosamente',
        schema: {
            example: {
                url: 'https://storage.googleapis.com/videos_example_converso/1694448448000_archivo.png',
            },
        },
    })
    async uploadFile(@UploadedFile() file: Express.Multer.File) {
        const url = await this.uploadsService.uploadFile(file);
        return { url };
    }

    @Get('signed-url')
    @ApiOperation({ summary: 'Generar Signed URL para subir archivo a GCP' })
    @ApiQuery({ name: 'fileName', required: true, description: 'Nombre del archivo (ej: video.mp4)' })
    @ApiQuery({ name: 'contentType', required: true, description: 'MIME type (ej: video/mp4, image/png)' })
    @ApiQuery({ name: 'expiresInMinutes', required: false, description: 'Tiempo de expiración en minutos (default: 15)' })
    @ApiResponse({
        status: 200,
        description: 'Signed URL generada correctamente',
        schema: { example: { url: 'https://storage.googleapis.com/...' } },
    })
    async getSignedUrl(
        @Query('fileName') fileName: string,
        @Query('contentType') contentType: string,
        @Query('expiresInMinutes') expiresInMinutes?: number,
    ) {
        const url = await this.uploadsService.generateSignedUrl(
            fileName,
            contentType,
            expiresInMinutes ?? 15,
        );
        return { url };
    }
}
