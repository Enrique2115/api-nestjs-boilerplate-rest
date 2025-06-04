import { JwtAuthGuard } from '@modules/auth/application';
import { Permissions, PermissionsGuard } from '@modules/permission/application';
import { Roles, RolesGuard } from '@modules/roles/application';
import {
  AssignRoleDto,
  CreateUserDto,
  CurrentUser,
  UpdateUserDto,
  UserUseCase,
} from '@modules/users/application';
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

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly userUseCase: UserUseCase) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('admin')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 400, description: 'User already exists' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  async createUser(@Body() createUserDto: CreateUserDto) {
    try {
      const user = await this.userUseCase.createUser(createUserDto);
      return {
        message: 'User created successfully',
        data: user,
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  @Get()
  @UseGuards(PermissionsGuard)
  @Permissions('users:read')
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - users:read permission required',
  })
  async getAllUsers() {
    try {
      const users = await this.userUseCase.getAllUsers();
      return {
        message: 'Users retrieved successfully',
        data: users,
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved successfully',
  })
  async getCurrentUser(@CurrentUser() user: { id: string }) {
    try {
      const userProfile = await this.userUseCase.getUserById(user.id);
      return {
        message: 'User profile retrieved successfully',
        data: userProfile,
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  @Get(':id')
  @UseGuards(PermissionsGuard)
  @Permissions('users:read')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({ name: 'id', description: 'User ID', type: 'string' })
  @ApiResponse({ status: 200, description: 'User retrieved successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - users:read permission required',
  })
  async getUserById(@Param('id', ParseUUIDPipe) id: string) {
    try {
      const user = await this.userUseCase.getUserById(id);
      if (!user) {
        throw new Error('User not found');
      }
      return {
        message: 'User retrieved successfully',
        data: user,
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  @Put(':id')
  @UseGuards(PermissionsGuard)
  @Permissions('users:update')
  @ApiOperation({ summary: 'Update user' })
  @ApiParam({ name: 'id', description: 'User ID', type: 'string' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - users:update permission required',
  })
  async updateUser(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    try {
      const user = await this.userUseCase.updateUser(id, updateUserDto);
      return {
        message: 'User updated successfully',
        data: user,
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Delete user' })
  @ApiParam({ name: 'id', description: 'User ID', type: 'string' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  async deleteUser(@Param('id', ParseUUIDPipe) id: string) {
    try {
      await this.userUseCase.deleteUser(id);
      return {
        message: 'User deleted successfully',
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  @Post(':id/roles')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Assign role to user' })
  @ApiParam({ name: 'id', description: 'User ID', type: 'string' })
  @ApiResponse({ status: 200, description: 'Role assigned successfully' })
  @ApiResponse({ status: 404, description: 'User or role not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  async assignRole(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() assignRoleDto: AssignRoleDto,
  ) {
    try {
      await this.userUseCase.assignRole(id, assignRoleDto.roleId);
      const user = await this.userUseCase.getUserById(id);
      return {
        message: 'Role assigned successfully',
        data: user,
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  @Delete(':id/roles/:roleId')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Remove role from user' })
  @ApiParam({ name: 'id', description: 'User ID', type: 'string' })
  @ApiParam({ name: 'roleId', description: 'Role ID', type: 'string' })
  @ApiResponse({ status: 200, description: 'Role removed successfully' })
  @ApiResponse({ status: 404, description: 'User or role not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  async removeRole(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('roleId', ParseUUIDPipe) roleId: string,
  ) {
    try {
      await this.userUseCase.removeRole(id, roleId);
      const user = await this.userUseCase.getUserById(id);
      return {
        message: 'Role removed successfully',
        data: user,
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  @Put(':id/activate')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Activate user' })
  @ApiParam({ name: 'id', description: 'User ID', type: 'string' })
  @ApiResponse({ status: 200, description: 'User activated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  async activateUser(@Param('id', ParseUUIDPipe) id: string) {
    try {
      const user = await this.userUseCase.activateUser(id);
      return {
        message: 'User activated successfully',
        data: user,
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  @Put(':id/deactivate')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Deactivate user' })
  @ApiParam({ name: 'id', description: 'User ID', type: 'string' })
  @ApiResponse({ status: 200, description: 'User deactivated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  async deactivateUser(@Param('id', ParseUUIDPipe) id: string) {
    try {
      const user = await this.userUseCase.deactivateUser(id);
      return {
        message: 'User deactivated successfully',
        data: user,
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }
}
