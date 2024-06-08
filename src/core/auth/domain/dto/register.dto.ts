import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
} from 'class-validator';

import { RoleModel } from '@core/auth/domain';

export class RegisterDto {
  @ApiProperty({ required: true, type: 'string', format: 'username' })
  @IsNotEmpty()
  @IsString()
  username: string;

  @ApiProperty({ required: true, type: 'string', format: 'email' })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ required: true, type: 'string' })
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({
    required: true,
    type: 'array',
    items: { type: 'object', properties: { name: { type: 'string' } } },
  })
  @IsNotEmpty()
  @IsArray()
  roles: RoleModel[];
}
