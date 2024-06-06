import { ApiProperty } from '@nestjs/swagger';

export class FileUploadSchema {
  @ApiProperty({ required: true, type: 'string', format: 'binary' })
  file: string;
}
