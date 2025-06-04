import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateRoleDto {
  @ApiProperty({
    description: 'Role name',
    example: 'admin',
  })
  @IsString({ message: 'Role name must be a string' })
  @IsNotEmpty({ message: 'Role name is required' })
  name: string;

  @ApiPropertyOptional({
    description: 'Role description',
    example: 'Administrator role with full access',
  })
  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  description?: string;

  @ApiPropertyOptional({
    description: 'Array of permission IDs to assign to the role',
    example: ['550e8400-e29b-41d4-a716-446655440000'],
    type: [String],
  })
  @IsOptional()
  @IsArray({ message: 'Permission IDs must be an array' })
  @IsUUID('4', {
    each: true,
    message: 'Each permission ID must be a valid UUID',
  })
  permissionIds?: string[];
}

export class UpdateRoleDto {
  @ApiPropertyOptional({
    description: 'Role name',
    example: 'admin',
  })
  @IsOptional()
  @IsString({ message: 'Role name must be a string' })
  name?: string;

  @ApiPropertyOptional({
    description: 'Role description',
    example: 'Administrator role with full access',
  })
  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  description?: string;

  @ApiPropertyOptional({
    description: 'Role active status',
    example: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'Active status must be a boolean' })
  isActive?: boolean;
}

export class AssignPermissionDto {
  @ApiProperty({
    description: 'Permission ID to assign',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsNotEmpty({ message: 'Permission ID is required' })
  @IsUUID('4', { message: 'Permission ID must be a valid UUID' })
  permissionId: string;
}
