import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as dotenv from 'dotenv';
import morgan from 'morgan';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ✅ Habilitar CORS
  app.enableCors({
    origin: '*', // puedes restringirlo a dominios específicos
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // ✅ Logger con Morgan
  app.use(morgan('dev'));

  // Usar .env
  dotenv.config();

  // ✅ Swagger Config
  const config = new DocumentBuilder()
    .setTitle('Linka API')
    .setDescription('Documentación de la API de Linka (Usuarios, Campañas, Mensajes, etc.)')
    .setVersion('1.0')
    .addBearerAuth() // soporte para autenticación con token
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // ✅ Iniciar servidor
  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`🚀 Servidor corriendo en http://localhost:${port}/api/docs`);
  console.log('ENV GOOGLE_APPLICATION_CREDENTIALS:', process.env.GOOGLE_APPLICATION_CREDENTIALS);

}
bootstrap();
