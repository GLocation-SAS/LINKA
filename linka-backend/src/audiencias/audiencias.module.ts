import { Module } from '@nestjs/common';
import { AudienciasService } from './audiencias.service';
import { AudienciasController } from './audiencias.controller';

@Module({
  providers: [AudienciasService],
  controllers: [AudienciasController]
})
export class AudienciasModule {}
