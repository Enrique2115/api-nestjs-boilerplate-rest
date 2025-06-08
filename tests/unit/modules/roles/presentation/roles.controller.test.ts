import { PaginateQuery } from 'nestjs-paginate';

import {
  CreateRoleDto,
  RoleUseCase,
  UpdateRoleDto,
} from '@/src/modules/roles/application';
import { RolesController } from '@/src/modules/roles/presentation';

import { createMock, Mock } from '@/tests/utils/mock';

describe('RolesController', () => {
  let rolesController: RolesController;
  let mockRoleUseCase: Mock<RoleUseCase>;

  beforeEach(() => {
    mockRoleUseCase = createMock<RoleUseCase>();
    rolesController = new RolesController(mockRoleUseCase);
  });

  describe('createRole', () => {
    it('should create a role successfully', async () => {
      const createRoleDto: CreateRoleDto = {
        name: 'admin',
        description: 'Administrator role',
      };

      const mockRole = {
        id: '1',
        name: 'admin',
        description: 'Administrator role',
        permissions: [],
      };

      mockRoleUseCase.createRole.mockResolvedValue(mockRole);

      const result = await rolesController.createRole(createRoleDto);

      expect(mockRoleUseCase.createRole).toHaveBeenCalledWith(createRoleDto);
      expect(result).toEqual({
        message: 'Role created successfully',
        data: mockRole,
      });
    });

    it('should handle errors when creating role', async () => {
      const createRoleDto: CreateRoleDto = {
        name: 'admin',
        description: 'Administrator role',
      };

      const error = new Error('Role creation failed');
      mockRoleUseCase.createRole.mockRejectedValue(error);

      await expect(rolesController.createRole(createRoleDto)).rejects.toThrow(
        'Role creation failed',
      );
      expect(mockRoleUseCase.createRole).toHaveBeenCalledWith(createRoleDto);
    });
  });

  describe('getAllRoles', () => {
    it('should return all roles successfully', async () => {
      const mockQuery: PaginateQuery = { page: 1, limit: 10, path: '/roles' };
      const mockRoles = {
        data: [
          {
            id: '1',
            name: 'admin',
            description: 'Administrator role',
            permissions: [],
          },
          {
            id: '2',
            name: 'user',
            description: 'User role',
            permissions: [],
          },
        ],
        meta: {
          totalItems: 2,
          itemCount: 2,
          itemsPerPage: 10,
          totalPages: 1,
          currentPage: 1,
        },
      };

      mockRoleUseCase.getAllRolesPaginated.mockResolvedValue(mockRoles);

      const result = await rolesController.getAllRoles(mockQuery);

      expect(mockRoleUseCase.getAllRolesPaginated).toHaveBeenCalledWith(
        mockQuery,
      );
      expect(result).toEqual(mockRoles);
    });

    it('should handle errors when getting all roles', async () => {
      const mockQuery: PaginateQuery = { page: 1, limit: 10, path: '/roles' };
      const error = new Error('Failed to get roles');
      mockRoleUseCase.getAllRolesPaginated.mockRejectedValue(error);

      await expect(rolesController.getAllRoles(mockQuery)).rejects.toThrow(
        'Failed to get roles',
      );
      expect(mockRoleUseCase.getAllRolesPaginated).toHaveBeenCalledWith(
        mockQuery,
      );
    });
  });

  describe('getRoleById', () => {
    it('should return role by id successfully', async () => {
      const roleId = '1';
      const mockRole = {
        id: roleId,
        name: 'admin',
        description: 'Administrator role',
        permissions: [],
      };

      mockRoleUseCase.getRoleById.mockResolvedValue(mockRole);

      const result = await rolesController.getRoleById(roleId);

      expect(mockRoleUseCase.getRoleById).toHaveBeenCalledWith(roleId);
      expect(result).toEqual({
        message: 'Role retrieved successfully',
        data: mockRole,
      });
    });

    it('should handle errors when getting role by id', async () => {
      const roleId = '1';
      const error = new Error('Role not found');
      mockRoleUseCase.getRoleById.mockRejectedValue(error);

      await expect(rolesController.getRoleById(roleId)).rejects.toThrow(
        'Role not found',
      );
      expect(mockRoleUseCase.getRoleById).toHaveBeenCalledWith(roleId);
    });
  });

  describe('updateRole', () => {
    it('should update role successfully', async () => {
      const roleId = '1';
      const updateRoleDto: UpdateRoleDto = {
        name: 'updated-admin',
        description: 'Updated administrator role',
      };

      const mockUpdatedRole = {
        id: roleId,
        name: 'updated-admin',
        description: 'Updated administrator role',
        permissions: [],
      };

      mockRoleUseCase.updateRole.mockResolvedValue(mockUpdatedRole);

      const result = await rolesController.updateRole(roleId, updateRoleDto);

      expect(mockRoleUseCase.updateRole).toHaveBeenCalledWith(
        roleId,
        updateRoleDto,
      );
      expect(result).toEqual({
        message: 'Role updated successfully',
        data: mockUpdatedRole,
      });
    });

    it('should handle errors when updating role', async () => {
      const roleId = '1';
      const updateRoleDto: UpdateRoleDto = {
        name: 'updated-admin',
      };

      const error = new Error('Role update failed');
      mockRoleUseCase.updateRole.mockRejectedValue(error);

      await expect(
        rolesController.updateRole(roleId, updateRoleDto),
      ).rejects.toThrow('Role update failed');
      expect(mockRoleUseCase.updateRole).toHaveBeenCalledWith(
        roleId,
        updateRoleDto,
      );
    });
  });

  describe('deleteRole', () => {
    it('should delete role successfully', async () => {
      const roleId = '1';

      mockRoleUseCase.deleteRole.mockResolvedValue(undefined);

      await rolesController.deleteRole(roleId);

      expect(mockRoleUseCase.deleteRole).toHaveBeenCalledWith(roleId);
    });

    it('should handle errors when deleting role', async () => {
      const roleId = '1';
      const error = new Error('Role deletion failed');
      mockRoleUseCase.deleteRole.mockRejectedValue(error);

      await expect(rolesController.deleteRole(roleId)).rejects.toThrow(
        'Role deletion failed',
      );
      expect(mockRoleUseCase.deleteRole).toHaveBeenCalledWith(roleId);
    });
  });

  describe('assignPermission', () => {
    it('should assign permission to role successfully', async () => {
      const roleId = '1';
      const assignPermissionDto = { permissionId: 'permission-1' };
      const mockRole = {
        id: roleId,
        name: 'admin',
        permissions: [{ id: 'permission-1', name: 'read' }],
      };

      mockRoleUseCase.assignPermission.mockResolvedValue(mockRole);

      await rolesController.assignPermission(roleId, assignPermissionDto);

      expect(mockRoleUseCase.assignPermission).toHaveBeenCalledWith(
        roleId,
        assignPermissionDto.permissionId,
      );
    });

    it('should handle errors when assigning permission', async () => {
      const roleId = '1';
      const assignPermissionDto = { permissionId: 'permission-1' };

      mockRoleUseCase.assignPermission.mockRejectedValue(
        new Error('Permission assignment failed'),
      );

      await expect(
        rolesController.assignPermission(roleId, assignPermissionDto),
      ).rejects.toThrow('Permission assignment failed');
      expect(mockRoleUseCase.assignPermission).toHaveBeenCalledWith(
        roleId,
        assignPermissionDto.permissionId,
      );
    });
  });

  describe('removePermission', () => {
    it('should remove permission from role successfully', async () => {
      const roleId = '1';
      const permissionId = 'permission-1';

      mockRoleUseCase.removePermission.mockResolvedValue(undefined);

      await rolesController.removePermission(roleId, permissionId);

      expect(mockRoleUseCase.removePermission).toHaveBeenCalledWith(
        roleId,
        permissionId,
      );
    });

    it('should handle errors when removing permission', async () => {
      const roleId = '1';
      const permissionId = 'permission-1';
      const error = new Error('Permission removal failed');
      mockRoleUseCase.removePermission.mockRejectedValue(error);

      await expect(
        rolesController.removePermission(roleId, permissionId),
      ).rejects.toThrow('Permission removal failed');
      expect(mockRoleUseCase.removePermission).toHaveBeenCalledWith(
        roleId,
        permissionId,
      );
    });
  });
});
