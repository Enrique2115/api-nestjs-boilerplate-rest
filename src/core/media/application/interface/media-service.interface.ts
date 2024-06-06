import { File } from '@nest-lab/fastify-multer';
import { UploadApiErrorResponse, UploadApiResponse } from 'cloudinary';

export interface IMediaService {
  uploadFile(
    file: File,
    folder: string,
  ): Promise<UploadApiResponse | UploadApiErrorResponse>;
  uploadFiles(
    files: Array<File>,
    folder: string,
  ): Promise<Array<UploadApiResponse | UploadApiErrorResponse>>;
}
