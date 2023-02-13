import { v2, ConfigOptions } from 'cloudinary';
import { CLOUDINARY } from '../../constants/cloudinary';

export const CloudinaryProvider = {
  provide: CLOUDINARY,
  useFactory: (): ConfigOptions => {
    return v2.config({
      cloud_name: 'db2gtt9hk',
      api_key: '477323513318191',
      api_secret: '12FZlKpedGhy3THFCeCbUfYZ1Fo',
    });
  },
};
