import { File } from '@nest-lab/fastify-multer';
import { Injectable } from '@nestjs/common';
import { UploadApiOptions } from 'cloudinary';

import { IUploadOptionsProvider } from '@core/media/application';

@Injectable()
export class ClaudinaryUploadOptionsProvider implements IUploadOptionsProvider {
  getUploadOptions(file: File, folder: string): UploadApiOptions {
    return {
      public_id:
        file.originalname.replaceAll(/\s+/g, '_').toLowerCase().split('.')[0] +
        '_' +
        Math.random().toString(36).slice(7),
      resource_type: 'auto',
      folder,
      transformation: [{ quality: 'auto', fetch_format: 'webp' }],
    };
  }
}
