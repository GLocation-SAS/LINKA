import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FirebaseModule } from './firebase/firebase.module';
import { BigqueryModule } from './bigquery/bigquery.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { HistorialModule } from './historial/historial.module';
import { CampanasModule } from './campanas/campanas.module';
import { AudienciasModule } from './audiencias/audiencias.module';
import { MensajesModule } from './mensajes/mensajes.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [ConfigModule.forRoot({
    isGlobal: true,
  }), FirebaseModule, BigqueryModule, UsuariosModule, HistorialModule, CampanasModule, AudienciasModule, MensajesModule, AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
