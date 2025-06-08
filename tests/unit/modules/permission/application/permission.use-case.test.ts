import { PaginateQuery } from 'nestjs-paginate';

import {
  CreatePermissionDto,
  UpdatePermissionDto,
} from '@/src/modules/permission/application/dtos/permission.dto';
import { PermissionUseCase } from '@/src/modules/permission/application/use-cases/permission.use-case';
import { Permission } from '@/src/modules/permission/domain/entities/permission.entity';
import { IPermissionRepository } from '@/src/modules/permission/domain/repositories/permission.repository.interface';

import { createMock, Mock } from '@/tests/utils/mock';

describe('PermissionUseCase', () => {
  let permissionUseCase: PermissionUseCase;
  let mockPermissionRepository: Mock<IPermissionRepository>;

  beforeEach(() => {
    mockPermissionRepository = createMock<IPermissionRepository>();
    permissionUseCase = new PermissionUseCase(mockPermissionRepository);
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
      } as Permission;

      mockPermissionRepository.findByName.mockResolvedValue(undefined);
      mockPermissionRepository.create.mockResolvedValue(mockPermission);

      const result =
        await permissionUseCase.createPermission(createPermissionDto);

      expect(mockPermissionRepository.findByName).toHaveBeenCalledWith('read');
      expect(mockPermissionRepository.create).toHaveBeenCalledWith({
        name: 'read',
        description: 'Read permission',
        isActive: true,
      });
      expect(result).toEqual(mockPermission);
    });

    it('should throw error when permission already exists', async () => {
      const createPermissionDto: CreatePermissionDto = {
        name: 'read',
        description: 'Read permission',
      };

      const existingPermission = {
        id: '1',
        name: 'read',
        description: 'Existing read permission',
        isActive: true,
      } as Permission;

      mockPermissionRepository.findByName.mockResolvedValue(existingPermission);

      await expect(
        permissionUseCase.createPermission(createPermissionDto),
      ).rejects.toThrow('Permission already exists with this name');
      expect(mockPermissionRepository.findByName).toHaveBeenCalledWith('read');
      expect(mockPermissionRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('getPermissionById', () => {
    it('should return permission when found', async () => {
      const permissionId = '1';
      const mockPermission = {
        id: permissionId,
        name: 'read',
        description: 'Read permission',
        isActive: true,
      } as Permission;

      mockPermissionRepository.findById.mockResolvedValue(mockPermission);

      const result = await permissionUseCase.getPermissionById(permissionId);

      expect(mockPermissionRepository.findById).toHaveBeenCalledWith(
        permissionId,
      );
      expect(result).toEqual(mockPermission);
    });

    it('should return null when permission not found', async () => {
      const permissionId = 'nonexistent-id';

      mockPermissionRepository.findById.mockResolvedValue(undefined);

      const result = await permissionUseCase.getPermissionById(permissionId);

      expect(mockPermissionRepository.findById).toHaveBeenCalledWith(
        permissionId,
      );
      expect(result).toBeUndefined();
    });
  });

  describe('getPermissionByName', () => {
    it('should return permission when found', async () => {
      const permissionName = 'read';
      const mockPermission = {
        id: '1',
        name: permissionName,
        description: 'Read permission',
        isActive: true,
      } as Permission;

      mockPermissionRepository.findByName.mockResolvedValue(mockPermission);

      const result =
        await permissionUseCase.getPermissionByName(permissionName);

      expect(mockPermissionRepository.findByName).toHaveBeenCalledWith(
        permissionName,
      );
      expect(result).toEqual(mockPermission);
    });

    it('should return null when permission not found', async () => {
      const permissionName = 'nonexistent';

      mockPermissionRepository.findByName.mockResolvedValue(undefined);

      const result =
        await permissionUseCase.getPermissionByName(permissionName);

      expect(mockPermissionRepository.findByName).toHaveBeenCalledWith(
        permissionName,
      );
      expect(result).toBeUndefined();
    });
  });

  describe('getAllPermissionsPaginated', () => {
    it('should return paginated permissions', async () => {
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

      mockPermissionRepository.findAllPaginated.mockResolvedValue(
        mockPaginatedResult as any,
      );

      const result = await permissionUseCase.getAllPermissionsPaginated(query);

      expect(mockPermissionRepository.findAllPaginated).toHaveBeenCalledWith(
        query,
      );
      expect(result).toEqual(mockPaginatedResult);
    });
  });

  describe('updatePermission', () => {
    it('should update permission successfully', async () => {
      const permissionId = '1';
      const updatePermissionDto: UpdatePermissionDto = {
        name: 'updated-read',
        description: 'Updated read permission',
      };

      const existingPermission = {
        id: permissionId,
        name: 'read',
        description: 'Read permission',
        isActive: true,
      } as Permission;

      const updatedPermission = {
        id: permissionId,
        name: 'updated-read',
        description: 'Updated read permission',
        isActive: true,
      } as Permission;

      mockPermissionRepository.findById.mockResolvedValue(existingPermission);
      mockPermissionRepository.findByName.mockResolvedValue(undefined);
      mockPermissionRepository.update.mockResolvedValue(updatedPermission);

      const result = await permissionUseCase.updatePermission(
        permissionId,
        updatePermissionDto,
      );

      expect(mockPermissionRepository.findById).toHaveBeenCalledWith(
        permissionId,
      );
      expect(mockPermissionRepository.findByName).toHaveBeenCalledWith(
        'updated-read',
      );
      expect(mockPermissionRepository.update).toHaveBeenCalledWith(
        permissionId,
        updatePermissionDto,
      );
      expect(result).toEqual(updatedPermission);
    });

    it('should throw error when permission not found', async () => {
      const permissionId = 'nonexistent-id';
      const updatePermissionDto: UpdatePermissionDto = {
        name: 'updated-read',
      };

      mockPermissionRepository.findById.mockResolvedValue(undefined);

      await expect(
        permissionUseCase.updatePermission(permissionId, updatePermissionDto),
      ).rejects.toThrow('Permission not found');
      expect(mockPermissionRepository.findById).toHaveBeenCalledWith(
        permissionId,
      );
      expect(mockPermissionRepository.update).not.toHaveBeenCalled();
    });

    it('should throw error when new name is already in use', async () => {
      const permissionId = '1';
      const updatePermissionDto: UpdatePermissionDto = {
        name: 'existing-name',
      };

      const existingPermission = {
        id: permissionId,
        name: 'read',
        description: 'Read permission',
        isActive: true,
      } as Permission;

      const conflictingPermission = {
        id: '2',
        name: 'existing-name',
        description: 'Another permission',
        isActive: true,
      } as Permission;

      mockPermissionRepository.findById.mockResolvedValue(existingPermission);
      mockPermissionRepository.findByName.mockResolvedValue(
        conflictingPermission,
      );

      await expect(
        permissionUseCase.updatePermission(permissionId, updatePermissionDto),
      ).rejects.toThrow('Permission name already in use');
      expect(mockPermissionRepository.findById).toHaveBeenCalledWith(
        permissionId,
      );
      expect(mockPermissionRepository.findByName).toHaveBeenCalledWith(
        'existing-name',
      );
      expect(mockPermissionRepository.update).not.toHaveBeenCalled();
    });

    it('should allow updating with same name', async () => {
      const permissionId = '1';
      const updatePermissionDto: UpdatePermissionDto = {
        name: 'read',
        description: 'Updated description',
      };

      const existingPermission = {
        id: permissionId,
        name: 'read',
        description: 'Read permission',
        isActive: true,
      } as Permission;

      const updatedPermission = {
        id: permissionId,
        name: 'read',
        description: 'Updated description',
        isActive: true,
      } as Permission;

      mockPermissionRepository.findById.mockResolvedValue(existingPermission);
      mockPermissionRepository.update.mockResolvedValue(updatedPermission);

      const result = await permissionUseCase.updatePermission(
        permissionId,
        updatePermissionDto,
      );

      expect(mockPermissionRepository.findById).toHaveBeenCalledWith(
        permissionId,
      );
      expect(mockPermissionRepository.findByName).not.toHaveBeenCalled();
      expect(mockPermissionRepository.update).toHaveBeenCalledWith(
        permissionId,
        updatePermissionDto,
      );
      expect(result).toEqual(updatedPermission);
    });
  });

  describe('deletePermission', () => {
    it('should delete permission successfully', async () => {
      const permissionId = '1';
      const existingPermission = {
        id: permissionId,
        name: 'read',
        description: 'Read permission',
        isActive: true,
      } as Permission;

      mockPermissionRepository.findById.mockResolvedValue(existingPermission);
      mockPermissionRepository.delete.mockResolvedValue(true);

      const result = await permissionUseCase.deletePermission(permissionId);

      expect(mockPermissionRepository.findById).toHaveBeenCalledWith(
        permissionId,
      );
      expect(mockPermissionRepository.delete).toHaveBeenCalledWith(
        permissionId,
      );
      expect(result).toBe(true);
    });

    it('should throw error when permission not found', async () => {
      const permissionId = 'nonexistent-id';

      mockPermissionRepository.findById.mockResolvedValue(undefined);

      await expect(
        permissionUseCase.deletePermission(permissionId),
      ).rejects.toThrow('Permission not found');
      expect(mockPermissionRepository.findById).toHaveBeenCalledWith(
        permissionId,
      );
      expect(mockPermissionRepository.delete).not.toHaveBeenCalled();
    });
  });

  describe('activatePermission', () => {
    it('should activate permission successfully', async () => {
      const permissionId = '1';
      const activatedPermission = {
        id: permissionId,
        name: 'read',
        description: 'Read permission',
        isActive: true,
      } as Permission;

      mockPermissionRepository.update.mockResolvedValue(activatedPermission);

      const result = await permissionUseCase.activatePermission(permissionId);

      expect(mockPermissionRepository.update).toHaveBeenCalledWith(
        permissionId,
        { isActive: true },
      );
      expect(result).toEqual(activatedPermission);
    });
  });

  describe('deactivatePermission', () => {
    it('should deactivate permission successfully', async () => {
      const permissionId = '1';
      const deactivatedPermission = {
        id: permissionId,
        name: 'read',
        description: 'Read permission',
        isActive: false,
      } as Permission;

      mockPermissionRepository.update.mockResolvedValue(deactivatedPermission);

      const result = await permissionUseCase.deactivatePermission(permissionId);

      expect(mockPermissionRepository.update).toHaveBeenCalledWith(
        permissionId,
        { isActive: false },
      );
      expect(result).toEqual(deactivatedPermission);
    });
  });
});
