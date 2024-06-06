import {
  File,
  FileInterceptor,
  FilesInterceptor,
} from '@nest-lab/fastify-multer';
import {
  Controller,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Patch,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { MediaService } from '@core/media/application';
import { MediaDto } from '@core/media/domain';
import { FileUploadSchema } from '@core/media/presentation/schemas/file-upload.schema';
import { FilesUploadSchema } from '@core/media/presentation/schemas/files-upload.schema';

@ApiTags('Media')
@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Patch('/file/:folder')
  @ApiOperation({ summary: 'Upload Single file' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  @ApiBody({
    required: true,
    description: 'File to upload',
    type: FileUploadSchema,
  })
  async uploadFile(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 10 }),
          new FileTypeValidator({ fileType: /image\/(png|jpg|jpeg)/ }),
        ],
      }),
    )
    file: File,
    @Param('folder') folder: string,
  ): Promise<MediaDto> {
    const data = await this.mediaService.uploadFile(file, folder);

    return {
      public_id: data.public_id as string,
      url: data.secure_url as string,
    };
    // return this.mediaService.uploadFile(file, folder);
  }

  @Patch('/files/:folder')
  @ApiOperation({ summary: 'Upload Multiple files' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FilesInterceptor('files', 2))
  @ApiBody({
    required: true,
    description: 'Files to upload',
    type: FilesUploadSchema,
  })
  async uploadFiles(
    @UploadedFiles() files: Array<File>,
    @Param('folder') folder: string,
  ): Promise<MediaDto[]> {
    const data = await this.mediaService.uploadFiles(files, folder);

    return data.map(item => {
      return {
        public_id: item.public_id as string,
        url: item.secure_url as string,
      };
    });
  }

  @Get('/:publicId/delete')
  @ApiOperation({ summary: 'Delete file by publicId' })
  @ApiResponse({
    status: 200,
    description: 'File deleted successfully',
  })
  async deleteFile(@Param('publicId') publicId: string): Promise<void> {
    await this.mediaService.deleteFile(publicId);
  }
}
