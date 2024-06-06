import { ApiProperty } from '@nestjs/swagger';

type Files = {
  items: string[];
};

export class FilesUploadSchema {
  @ApiProperty({
    required: true,
    type: 'array',
    items: { type: 'string', format: 'binary' },
  })
  files: Files[];
}
