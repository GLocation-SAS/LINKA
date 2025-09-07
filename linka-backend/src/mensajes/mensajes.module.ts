import { Module } from '@nestjs/common';
import { MensajesService } from './mensajes.service';
import { MensajesController } from './mensajes.controller';

@Module({
  providers: [MensajesService],
  controllers: [MensajesController]
})
export class MensajesModule {}
