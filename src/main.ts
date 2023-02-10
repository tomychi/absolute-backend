import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as morgan from 'morgan';
import { CORS } from './constants';
import { ValidationPipe } from '@nestjs/common';

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

  const configService = app.get(ConfigService);

  app.enableCors(CORS);

  // prefijo 'api' localhost:8000/api/....
  app.setGlobalPrefix('api');

  const PORT = 8000;
  await app.listen(PORT);
  console.log(`Application running on: ${await app.getUrl()}`);
}
bootstrap();
