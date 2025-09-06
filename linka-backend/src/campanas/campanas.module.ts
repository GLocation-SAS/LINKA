import { Module } from '@nestjs/common';
import { CampanasService } from './campanas.service';
import { CampanasController } from './campanas.controller';

@Module({
  providers: [CampanasService],
  controllers: [CampanasController]
})
export class CampanasModule {}
