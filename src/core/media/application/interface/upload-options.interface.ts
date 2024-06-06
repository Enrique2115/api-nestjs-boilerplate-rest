import { File } from '@nest-lab/fastify-multer';
import { UploadApiOptions } from 'cloudinary';

export interface IUploadOptionsProvider {
  getUploadOptions(file: File, folder: string): UploadApiOptions;
}
