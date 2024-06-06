import { FastifyMulterModule } from '@nest-lab/fastify-multer';
import { Module } from '@nestjs/common';

import { MediaService } from '@core/media/application';
import {
  ClaudinaryUploadOptionsProvider,
  CloudinaryProvider,
} from '@core/media/infraestructure';
import { MediaController } from '@core/media/presentation';

@Module({
  imports: [FastifyMulterModule],
  controllers: [MediaController],
  providers: [
    CloudinaryProvider,
    MediaService,
    {
      provide: 'IUploadOptionsProvider',
      useClass: ClaudinaryUploadOptionsProvider,
    },
  ],
})
export class MediaModule {}
