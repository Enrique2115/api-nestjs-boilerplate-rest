import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { JwtAuthGuard } from '@/modules/auth/application';
import {
  CreatePermissionDto,
  PermissionUseCase,
  UpdatePermissionDto,
} from '@/modules/permission/application';
import { Roles, RolesGuard } from '@/modules/roles/application';

@ApiTags('Permissions')
@Controller('permissions')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@ApiBearerAuth()
export class PermissionsController {
  constructor(private readonly permissionUseCase: PermissionUseCase) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new permission' })
  @ApiResponse({ status: 201, description: 'Permission created successfully' })
  @ApiResponse({ status: 400, description: 'Permission already exists' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  async createPermission(@Body() createPermissionDto: CreatePermissionDto) {
    try {
      const permission =
        await this.permissionUseCase.createPermission(createPermissionDto);
      return {
        message: 'Permission created successfully',
        data: permission,
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get all permissions' })
  @ApiResponse({
    status: 200,
    description: 'Permissions retrieved successfully',
  })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  async getAllPermissions() {
    try {
      const permissions = await this.permissionUseCase.getAllPermissions();
      return {
        message: 'Permissions retrieved successfully',
        data: permissions,
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get permission by ID' })
  @ApiParam({ name: 'id', description: 'Permission ID', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Permission retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Permission not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  async getPermissionById(@Param('id', ParseUUIDPipe) id: string) {
    try {
      const permission = await this.permissionUseCase.getPermissionById(id);
      if (!permission) {
        throw new Error('Permission not found');
      }
      return {
        message: 'Permission retrieved successfully',
        data: permission,
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update permission' })
  @ApiParam({ name: 'id', description: 'Permission ID', type: 'string' })
  @ApiResponse({ status: 200, description: 'Permission updated successfully' })
  @ApiResponse({ status: 404, description: 'Permission not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  async updatePermission(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePermissionDto: UpdatePermissionDto,
  ) {
    try {
      const permission = await this.permissionUseCase.updatePermission(
        id,
        updatePermissionDto,
      );
      return {
        message: 'Permission updated successfully',
        data: permission,
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete permission' })
  @ApiParam({ name: 'id', description: 'Permission ID', type: 'string' })
  @ApiResponse({ status: 200, description: 'Permission deleted successfully' })
  @ApiResponse({ status: 404, description: 'Permission not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  async deletePermission(@Param('id', ParseUUIDPipe) id: string) {
    try {
      await this.permissionUseCase.deletePermission(id);
      return {
        message: 'Permission deleted successfully',
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  @Put(':id/activate')
  @ApiOperation({ summary: 'Activate permission' })
  @ApiParam({ name: 'id', description: 'Permission ID', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Permission activated successfully',
  })
  @ApiResponse({ status: 404, description: 'Permission not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  async activatePermission(@Param('id', ParseUUIDPipe) id: string) {
    try {
      const permission = await this.permissionUseCase.activatePermission(id);
      return {
        message: 'Permission activated successfully',
        data: permission,
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  @Put(':id/deactivate')
  @ApiOperation({ summary: 'Deactivate permission' })
  @ApiParam({ name: 'id', description: 'Permission ID', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Permission deactivated successfully',
  })
  @ApiResponse({ status: 404, description: 'Permission not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  async deactivatePermission(@Param('id', ParseUUIDPipe) id: string) {
    try {
      const permission = await this.permissionUseCase.deactivatePermission(id);
      return {
        message: 'Permission deactivated successfully',
        data: permission,
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }
}
