import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ required: true, type: 'string', format: 'username' })
  @IsNotEmpty()
  @IsString()
  username: string;

  @ApiProperty({ required: true, type: 'string' })
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  password: string;
}
