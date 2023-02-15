// import { ConfigService } from '@nestjs/config';
import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import * as morgan from 'morgan';
import { CORS } from './constants';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(morgan('dev'));

  app.useGlobalPipes(
    new ValidationPipe({
      transformOptions: {
        enableImplicitConversion: true, // configuracion para manejar DTO con class-validator
      },
    }),
  );

  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  app.use(express.json({ limit: '50mb' }));

  app.enableCors(CORS);

  // prefijo 'api' localhost:8000/api/....
  app.setGlobalPrefix('api');

  await app.listen(+process.env.PORT);
  console.log(`Application running on: ${await app.getUrl()}`);
}
bootstrap();
