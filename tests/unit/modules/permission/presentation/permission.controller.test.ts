import { PaginateQuery } from 'nestjs-paginate';

import {
  CreatePermissionDto,
  UpdatePermissionDto,
} from '@/src/modules/permission/application/dtos/permission.dto';
import { PermissionUseCase } from '@/src/modules/permission/application/use-cases/permission.use-case';
import { PermissionsController } from '@/src/modules/permission/presentation/controllers/permission.controller';

import { createMock, Mock } from '@/tests/utils/mock';

describe('PermissionsController', () => {
  let permissionsController: PermissionsController;
  let mockPermissionUseCase: Mock<PermissionUseCase>;

  beforeEach(() => {
    mockPermissionUseCase = createMock<PermissionUseCase>();
    permissionsController = new PermissionsController(mockPermissionUseCase);
  });

  describe('createPermission', () => {
    it('should create a permission successfully', async () => {
      const createPermissionDto: CreatePermissionDto = {
        name: 'read',
        description: 'Read permission',
      };

      const mockPermission = {
        id: '1',
        name: 'read',
        description: 'Read permission',
        isActive: true,
      };

      mockPermissionUseCase.createPermission.mockResolvedValue(mockPermission);

      const result =
        await permissionsController.createPermission(createPermissionDto);

      expect(mockPermissionUseCase.createPermission).toHaveBeenCalledWith(
        createPermissionDto,
      );
      expect(result).toEqual({
        message: 'Permission created successfully',
        data: mockPermission,
      });
    });

    it('should handle errors when creating permission', async () => {
      const createPermissionDto: CreatePermissionDto = {
        name: 'read',
        description: 'Read permission',
      };

      const error = new Error('Permission already exists');
      mockPermissionUseCase.createPermission.mockRejectedValue(error);

      await expect(
        permissionsController.createPermission(createPermissionDto),
      ).rejects.toThrow('Permission already exists');
      expect(mockPermissionUseCase.createPermission).toHaveBeenCalledWith(
        createPermissionDto,
      );
    });
  });

  describe('getAllPermissions', () => {
    it('should return paginated permissions successfully', async () => {
      const query = { page: 1, limit: 10 } as PaginateQuery;
      const mockPaginatedResult = {
        data: [
          {
            id: '1',
            name: 'read',
            description: 'Read permission',
            isActive: true,
          },
        ],
        meta: { totalItems: 1 },
      };

      mockPermissionUseCase.getAllPermissionsPaginated.mockResolvedValue(
        mockPaginatedResult as any,
      );

      const result = await permissionsController.getAllPermissions(query);

      expect(
        mockPermissionUseCase.getAllPermissionsPaginated,
      ).toHaveBeenCalledWith(query);
      expect(result).toEqual(mockPaginatedResult);
    });
  });

  describe('getPermissionById', () => {
    it('should return permission by id successfully', async () => {
      const permissionId = '1';
      const mockPermission = {
        id: permissionId,
        name: 'read',
        description: 'Read permission',
        isActive: true,
      };

      mockPermissionUseCase.getPermissionById.mockResolvedValue(mockPermission);

      const result =
        await permissionsController.getPermissionById(permissionId);

      expect(mockPermissionUseCase.getPermissionById).toHaveBeenCalledWith(
        permissionId,
      );
      expect(result).toEqual({
        message: 'Permission retrieved successfully',
        data: mockPermission,
      });
    });

    it('should handle permission not found', async () => {
      const permissionId = '1';

      mockPermissionUseCase.getPermissionById.mockResolvedValue(undefined);

      await expect(
        permissionsController.getPermissionById(permissionId),
      ).rejects.toThrow('Permission not found');
      expect(mockPermissionUseCase.getPermissionById).toHaveBeenCalledWith(
        permissionId,
      );
    });

    it('should handle errors when getting permission by id', async () => {
      const permissionId = '1';
      const error = new Error('Database error');
      mockPermissionUseCase.getPermissionById.mockRejectedValue(error);

      await expect(
        permissionsController.getPermissionById(permissionId),
      ).rejects.toThrow('Database error');
      expect(mockPermissionUseCase.getPermissionById).toHaveBeenCalledWith(
        permissionId,
      );
    });
  });

  describe('updatePermission', () => {
    it('should update permission successfully', async () => {
      const permissionId = '1';
      const updatePermissionDto: UpdatePermissionDto = {
        name: 'updated-read',
        description: 'Updated read permission',
      };

      const mockUpdatedPermission = {
        id: permissionId,
        name: 'updated-read',
        description: 'Updated read permission',
        isActive: true,
      };

      mockPermissionUseCase.updatePermission.mockResolvedValue(
        mockUpdatedPermission,
      );

      const result = await permissionsController.updatePermission(
        permissionId,
        updatePermissionDto,
      );

      expect(mockPermissionUseCase.updatePermission).toHaveBeenCalledWith(
        permissionId,
        updatePermissionDto,
      );
      expect(result).toEqual({
        message: 'Permission updated successfully',
        data: mockUpdatedPermission,
      });
    });

    it('should handle permission not found during update', async () => {
      const permissionId = 'nonexistent-id';
      const updatePermissionDto: UpdatePermissionDto = {
        name: 'Updated Permission',
      };

      mockPermissionUseCase.updatePermission.mockRejectedValue(
        new Error('Permission not found'),
      );

      await expect(
        permissionsController.updatePermission(
          permissionId,
          updatePermissionDto,
        ),
      ).rejects.toThrow('Permission not found');
      expect(mockPermissionUseCase.updatePermission).toHaveBeenCalledWith(
        permissionId,
        updatePermissionDto,
      );
    });

    it('should handle errors when updating permission', async () => {
      const permissionId = '1';
      const updatePermissionDto: UpdatePermissionDto = {
        name: 'updated-read',
      };

      const error = new Error('Permission update failed');
      mockPermissionUseCase.updatePermission.mockRejectedValue(error);

      await expect(
        permissionsController.updatePermission(
          permissionId,
          updatePermissionDto,
        ),
      ).rejects.toThrow('Permission update failed');
      expect(mockPermissionUseCase.updatePermission).toHaveBeenCalledWith(
        permissionId,
        updatePermissionDto,
      );
    });
  });

  describe('deletePermission', () => {
    it('should delete permission successfully', async () => {
      const permissionId = '1';

      mockPermissionUseCase.deletePermission.mockResolvedValue(true);

      const result = await permissionsController.deletePermission(permissionId);

      expect(mockPermissionUseCase.deletePermission).toHaveBeenCalledWith(
        permissionId,
      );
      expect(result).toEqual({
        message: 'Permission deleted successfully',
      });
    });

    it('should handle errors when deleting permission', async () => {
      const permissionId = '1';
      const error = new Error('Permission deletion failed');
      mockPermissionUseCase.deletePermission.mockRejectedValue(error);

      await expect(
        permissionsController.deletePermission(permissionId),
      ).rejects.toThrow('Permission deletion failed');
      expect(mockPermissionUseCase.deletePermission).toHaveBeenCalledWith(
        permissionId,
      );
    });
  });

  describe('activatePermission', () => {
    it('should activate permission successfully', async () => {
      const permissionId = '1';
      const mockActivatedPermission = {
        id: permissionId,
        name: 'read',
        description: 'Read permission',
        isActive: true,
      };

      mockPermissionUseCase.activatePermission.mockResolvedValue(
        mockActivatedPermission,
      );

      const result =
        await permissionsController.activatePermission(permissionId);

      expect(mockPermissionUseCase.activatePermission).toHaveBeenCalledWith(
        permissionId,
      );
      expect(result).toEqual({
        message: 'Permission activated successfully',
        data: mockActivatedPermission,
      });
    });

    it('should handle permission not found during activation', async () => {
      const permissionId = 'nonexistent-id';
      const mockPermission = {
        id: permissionId,
        name: 'Test Permission',
        isActive: true,
      };

      mockPermissionUseCase.activatePermission.mockResolvedValue(
        mockPermission,
      );

      const result =
        await permissionsController.activatePermission(permissionId);

      expect(mockPermissionUseCase.activatePermission).toHaveBeenCalledWith(
        permissionId,
      );
      expect(result).toEqual({
        message: 'Permission activated successfully',
        data: mockPermission,
      });
    });

    it('should handle errors when activating permission', async () => {
      const permissionId = '1';
      const error = new Error('Permission activation failed');
      mockPermissionUseCase.activatePermission.mockRejectedValue(error);

      await expect(
        permissionsController.activatePermission(permissionId),
      ).rejects.toThrow('Permission activation failed');
      expect(mockPermissionUseCase.activatePermission).toHaveBeenCalledWith(
        permissionId,
      );
    });
  });

  describe('deactivatePermission', () => {
    it('should deactivate permission successfully', async () => {
      const permissionId = '1';
      const mockDeactivatedPermission = {
        id: permissionId,
        name: 'read',
        description: 'Read permission',
        isActive: false,
      };

      mockPermissionUseCase.deactivatePermission.mockResolvedValue(
        mockDeactivatedPermission,
      );

      const result =
        await permissionsController.deactivatePermission(permissionId);

      expect(mockPermissionUseCase.deactivatePermission).toHaveBeenCalledWith(
        permissionId,
      );
      expect(result).toEqual({
        message: 'Permission deactivated successfully',
        data: mockDeactivatedPermission,
      });
    });

    it('should handle permission not found during deactivation', async () => {
      const permissionId = 'nonexistent-id';
      const mockPermission = {
        id: permissionId,
        name: 'Test Permission',
        isActive: false,
      };

      mockPermissionUseCase.deactivatePermission.mockResolvedValue(
        mockPermission,
      );

      const result =
        await permissionsController.deactivatePermission(permissionId);

      expect(mockPermissionUseCase.deactivatePermission).toHaveBeenCalledWith(
        permissionId,
      );
      expect(result).toEqual({
        message: 'Permission deactivated successfully',
        data: mockPermission,
      });
    });

    it('should handle errors when deactivating permission', async () => {
      const permissionId = '1';
      const error = new Error('Permission deactivation failed');
      mockPermissionUseCase.deactivatePermission.mockRejectedValue(error);

      await expect(
        permissionsController.deactivatePermission(permissionId),
      ).rejects.toThrow('Permission deactivation failed');
      expect(mockPermissionUseCase.deactivatePermission).toHaveBeenCalledWith(
        permissionId,
      );
    });
  });
});
