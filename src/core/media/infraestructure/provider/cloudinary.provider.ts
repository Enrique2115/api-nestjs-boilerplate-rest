import { v2 } from 'cloudinary';

import { CLOUDINARY, envs } from '@src/config';

export const CloudinaryProvider = {
  provide: CLOUDINARY,
  useFactory: () => {
    return v2.config({
      cloud_name: envs.CLOUDINARY.API_NAME,
      api_key: envs.CLOUDINARY.API_KEY,
      api_secret: envs.CLOUDINARY.API_SECRET,
    });
  },
};
