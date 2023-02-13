import { v2, ConfigOptions } from 'cloudinary';
import { CLOUDINARY } from '../../constants/cloudinary';
import { ConfigModule, ConfigService } from '@nestjs/config';

ConfigModule.forRoot({
  envFilePath: `.${process.env.NODE_ENV}.env`,
});

const configService = new ConfigService();

export const CloudinaryProvider = {
  provide: CLOUDINARY,
  useFactory: (): ConfigOptions => {
    return v2.config({
      cloud_name: configService.get<string>('CLOUD_NAME'),
      api_key: configService.get<string>('API_KEY'),
      api_secret: configService.get<string>('API_SECRET'),
    });
  },
};
