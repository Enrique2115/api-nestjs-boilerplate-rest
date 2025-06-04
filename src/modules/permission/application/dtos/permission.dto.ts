import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreatePermissionDto {
  @ApiProperty({
    description: 'Permission name',
    example: 'users:read',
  })
  @IsString({ message: 'Permission name must be a string' })
  @IsNotEmpty({ message: 'Permission name is required' })
  name: string;

  @ApiPropertyOptional({
    description: 'Permission description',
    example: 'Allows reading user information',
  })
  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  description?: string;
}

export class UpdatePermissionDto {
  @ApiPropertyOptional({
    description: 'Permission name',
    example: 'users:read',
  })
  @IsOptional()
  @IsString({ message: 'Permission name must be a string' })
  name?: string;

  @ApiPropertyOptional({
    description: 'Permission description',
    example: 'Allows reading user information',
  })
  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  description?: string;

  @ApiPropertyOptional({
    description: 'Permission active status',
    example: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'Active status must be a boolean' })
  isActive?: boolean;
}
