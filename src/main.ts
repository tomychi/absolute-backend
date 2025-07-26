import { ConfigService } from '@nestjs/config';
import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import * as morgan from 'morgan';
import { CORS } from './constants';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AccessLevelsService } from './modules/access-levels/services/access-levels.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    snapshot: true,
  });

  app.use(morgan('dev'));

  app.useGlobalPipes(
    new ValidationPipe({
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  const reflector = app.get(Reflector);

  app.useGlobalInterceptors(new ClassSerializerInterceptor(reflector));

  const configService = app.get(ConfigService);

  app.enableCors(CORS);
  app.setGlobalPrefix('api');
  const config = new DocumentBuilder()
    .setTitle('Absolute API')
    .setDescription('Software Empresarial')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);
  // ← AGREGAR SEEDING AUTOMÁTICO
  try {
    const accessLevelsService = app.get(AccessLevelsService);
    await accessLevelsService.initializeDefaultAccessLevels();
    console.log('✅ Access levels initialized');
  } catch (error) {
    console.log('⚠️ Access levels already exist or error:', error);
  }

  await app.listen(configService.get('PORT'));

  console.log(`Application running on: ${await app.getUrl()}`);
}
bootstrap();
