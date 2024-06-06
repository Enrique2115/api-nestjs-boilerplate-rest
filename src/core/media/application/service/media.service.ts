import { File } from '@nest-lab/fastify-multer';
import { Inject, Injectable } from '@nestjs/common';
import toStream from 'buffer-to-stream';
import { UploadApiErrorResponse, UploadApiResponse, v2 } from 'cloudinary';

import { IMediaService, IUploadOptionsProvider } from '@core/media/application';

@Injectable()
export class MediaService implements IMediaService {
  constructor(
    @Inject('IUploadOptionsProvider')
    private readonly uploadOptionsProvider: IUploadOptionsProvider,
  ) {}

  async uploadFile(
    file: File,
    folder: string,
  ): Promise<UploadApiResponse | UploadApiErrorResponse> {
    const buffer = await Promise.resolve(file.buffer);

    const options = this.uploadOptionsProvider.getUploadOptions(file, folder);

    return new Promise((resolve, reject) => {
      const upload = v2.uploader.upload_stream(options, (error, result) => {
        if (error) return reject(error);
        resolve(result);
      });
      toStream(buffer).pipe(upload);
    });
  }

  async uploadFiles(
    files: Array<File>,
    folder: string,
  ): Promise<Array<UploadApiResponse | UploadApiErrorResponse>> {
    const promises = files.map(file => this.uploadFile(file, folder));
    const results = await Promise.all(promises);
    return results;
  }

  async deleteFile(publicId: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      v2.uploader
        .destroy(publicId, error => {
          if (error) return reject(error);
          resolve();
        })
        .catch(reject);
    });
  }
}
