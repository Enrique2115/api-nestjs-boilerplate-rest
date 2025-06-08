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
import {
  ApiPaginationQuery,
  Paginate,
  Paginated,
  PaginateQuery,
} from 'nestjs-paginate';

import { JwtAuthGuard } from '@/modules/auth/application';
import {
  AssignPermissionDto,
  CreateRoleDto,
  Roles,
  RolesGuard,
  RoleUseCase,
  UpdateRoleDto,
} from '@/modules/roles/application';
import { Role, rolesPaginateConfig } from '@/modules/roles/domain';

@ApiTags('Roles')
@Controller('roles')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@ApiBearerAuth()
export class RolesController {
  constructor(private readonly roleUseCase: RoleUseCase) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new role' })
  @ApiResponse({ status: 201, description: 'Role created successfully' })
  @ApiResponse({ status: 400, description: 'Role already exists' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  async createRole(@Body() createRoleDto: CreateRoleDto) {
    try {
      const role = await this.roleUseCase.createRole(createRoleDto);
      return {
        message: 'Role created successfully',
        data: role,
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get all roles' })
  @ApiResponse({ status: 200, description: 'Roles retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  @ApiPaginationQuery(rolesPaginateConfig)
  async getAllRoles(
    @Paginate() query: PaginateQuery,
  ): Promise<Paginated<Role>> {
    return await this.roleUseCase.getAllRolesPaginated(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get role by ID' })
  @ApiParam({ name: 'id', description: 'Role ID', type: 'string' })
  @ApiResponse({ status: 200, description: 'Role retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Role not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  async getRoleById(@Param('id', ParseUUIDPipe) id: string) {
    try {
      const role = await this.roleUseCase.getRoleById(id);
      if (!role) {
        throw new Error('Role not found');
      }
      return {
        message: 'Role retrieved successfully',
        data: role,
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update role' })
  @ApiParam({ name: 'id', description: 'Role ID', type: 'string' })
  @ApiResponse({ status: 200, description: 'Role updated successfully' })
  @ApiResponse({ status: 404, description: 'Role not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  async updateRole(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateRoleDto: UpdateRoleDto,
  ) {
    try {
      const role = await this.roleUseCase.updateRole(id, updateRoleDto);
      return {
        message: 'Role updated successfully',
        data: role,
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete role' })
  @ApiParam({ name: 'id', description: 'Role ID', type: 'string' })
  @ApiResponse({ status: 200, description: 'Role deleted successfully' })
  @ApiResponse({ status: 404, description: 'Role not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  async deleteRole(@Param('id', ParseUUIDPipe) id: string) {
    try {
      await this.roleUseCase.deleteRole(id);
      return {
        message: 'Role deleted successfully',
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  @Post(':id/permissions')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Assign permission to role' })
  @ApiParam({ name: 'id', description: 'Role ID', type: 'string' })
  @ApiResponse({ status: 200, description: 'Permission assigned successfully' })
  @ApiResponse({ status: 404, description: 'Role or permission not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  async assignPermission(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() assignPermissionDto: AssignPermissionDto,
  ) {
    try {
      const role = await this.roleUseCase.assignPermission(
        id,
        assignPermissionDto.permissionId,
      );
      return {
        message: 'Permission assigned successfully',
        data: role,
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  @Delete(':id/permissions/:permissionId')
  @ApiOperation({ summary: 'Remove permission from role' })
  @ApiParam({ name: 'id', description: 'Role ID', type: 'string' })
  @ApiParam({
    name: 'permissionId',
    description: 'Permission ID',
    type: 'string',
  })
  @ApiResponse({ status: 200, description: 'Permission removed successfully' })
  @ApiResponse({ status: 404, description: 'Role or permission not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  async removePermission(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('permissionId', ParseUUIDPipe) permissionId: string,
  ) {
    try {
      const role = await this.roleUseCase.removePermission(id, permissionId);
      return {
        message: 'Permission removed successfully',
        data: role,
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  @Put(':id/activate')
  @ApiOperation({ summary: 'Activate role' })
  @ApiParam({ name: 'id', description: 'Role ID', type: 'string' })
  @ApiResponse({ status: 200, description: 'Role activated successfully' })
  @ApiResponse({ status: 404, description: 'Role not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  async activateRole(@Param('id', ParseUUIDPipe) id: string) {
    try {
      const role = await this.roleUseCase.activateRole(id);
      return {
        message: 'Role activated successfully',
        data: role,
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  @Put(':id/deactivate')
  @ApiOperation({ summary: 'Deactivate role' })
  @ApiParam({ name: 'id', description: 'Role ID', type: 'string' })
  @ApiResponse({ status: 200, description: 'Role deactivated successfully' })
  @ApiResponse({ status: 404, description: 'Role not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  async deactivateRole(@Param('id', ParseUUIDPipe) id: string) {
    try {
      const role = await this.roleUseCase.deactivateRole(id);
      return {
        message: 'Role deactivated successfully',
        data: role,
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }
}
