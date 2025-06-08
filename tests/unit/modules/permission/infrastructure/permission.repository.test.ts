import { paginate, PaginateQuery } from 'nestjs-paginate';
import { Repository } from 'typeorm';

import { Permission } from '@/src/modules/permission/domain/entities/permission.entity';
import { PermissionRepository } from '@/src/modules/permission/infrastructure/persistence/permission.repository';

import { createMock, Mock } from '@/tests/utils/mock';

// Mock nestjs-paginate
vi.mock('nestjs-paginate', () => ({
  paginate: vi.fn(),
}));

describe('PermissionRepository', () => {
  let permissionRepository: PermissionRepository;
  let mockPermissionRepo: Mock<Repository<Permission>>;
  let mockPaginate: any;

  beforeEach(() => {
    mockPermissionRepo = createMock<Repository<Permission>>();
    permissionRepository = new PermissionRepository(mockPermissionRepo);
    mockPaginate = paginate as any;
  });

  describe('findById', () => {
    it('should return permission when found', async () => {
      const permissionId = 'permission-id';
      const mockPermission = {
        id: permissionId,
        name: 'read',
        description: 'Read permission',
        isActive: true,
      } as Permission;

      mockPermissionRepo.findOne.mockResolvedValue(mockPermission);

      const result = await permissionRepository.findById(permissionId);

      expect(mockPermissionRepo.findOne).toHaveBeenCalledWith({
        where: { id: permissionId },
      });
      expect(result).toEqual(mockPermission);
    });

    it('should return undefined when permission not found', async () => {
      const permissionId = 'nonexistent-id';

      mockPermissionRepo.findOne.mockResolvedValue(undefined);

      const result = await permissionRepository.findById(permissionId);

      expect(mockPermissionRepo.findOne).toHaveBeenCalledWith({
        where: { id: permissionId },
      });
      expect(result).toBeUndefined();
    });
  });

  describe('findByName', () => {
    it('should return permission when found', async () => {
      const permissionName = 'read';
      const mockPermission = {
        id: 'permission-id',
        name: permissionName,
        description: 'Read permission',
        isActive: true,
      } as Permission;

      mockPermissionRepo.findOne.mockResolvedValue(mockPermission);

      const result = await permissionRepository.findByName(permissionName);

      expect(mockPermissionRepo.findOne).toHaveBeenCalledWith({
        where: { name: permissionName },
      });
      expect(result).toEqual(mockPermission);
    });

    it('should return undefined when permission not found', async () => {
      const permissionName = 'nonexistent';

      mockPermissionRepo.findOne.mockResolvedValue(undefined);

      const result = await permissionRepository.findByName(permissionName);

      expect(mockPermissionRepo.findOne).toHaveBeenCalledWith({
        where: { name: permissionName },
      });
      expect(result).toBeUndefined();
    });
  });

  describe('findAllPaginated', () => {
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

      mockPaginate.mockResolvedValue(mockPaginatedResult);

      const result = await permissionRepository.findAllPaginated(query);

      expect(mockPaginate).toHaveBeenCalledWith(
        query,
        mockPermissionRepo,
        expect.any(Object),
      );
      expect(result).toEqual(mockPaginatedResult);
    });
  });

  describe('create', () => {
    it('should create and return permission', async () => {
      const permissionData = {
        name: 'write',
        description: 'Write permission',
        isActive: true,
      };

      const mockPermission = {
        id: '1',
        ...permissionData,
      } as Permission;

      mockPermissionRepo.create.mockReturnValue(mockPermission);
      mockPermissionRepo.save.mockResolvedValue(mockPermission);

      const result = await permissionRepository.create(permissionData);

      expect(mockPermissionRepo.create).toHaveBeenCalledWith(permissionData);
      expect(mockPermissionRepo.save).toHaveBeenCalledWith(mockPermission);
      expect(result).toEqual(mockPermission);
    });
  });

  describe('update', () => {
    it('should update and return permission', async () => {
      const permissionId = 'permission-id';
      const updateData = {
        name: 'updated-read',
        description: 'Updated read permission',
      };

      const mockUpdatedPermission = {
        id: permissionId,
        name: 'updated-read',
        description: 'Updated read permission',
        isActive: true,
      } as Permission;

      mockPermissionRepo.update.mockResolvedValue({ affected: 1 } as any);
      mockPermissionRepo.findOne.mockResolvedValue(mockUpdatedPermission);

      const result = await permissionRepository.update(
        permissionId,
        updateData,
      );

      expect(mockPermissionRepo.update).toHaveBeenCalledWith(
        permissionId,
        updateData,
      );
      expect(mockPermissionRepo.findOne).toHaveBeenCalledWith({
        where: { id: permissionId },
      });
      expect(result).toEqual(mockUpdatedPermission);
    });

    it('should return null when permission not found after update', async () => {
      const permissionId = 'permission-id';
      const updateData = { name: 'updated-read' };

      mockPermissionRepo.update.mockResolvedValue({ affected: 1 } as any);
      mockPermissionRepo.findOne.mockResolvedValue(undefined);

      const result = await permissionRepository.update(
        permissionId,
        updateData,
      );

      expect(mockPermissionRepo.update).toHaveBeenCalledWith(
        permissionId,
        updateData,
      );
      expect(result).toBeUndefined();
    });
  });

  describe('delete', () => {
    it('should delete permission successfully', async () => {
      const permissionId = 'permission-id';

      mockPermissionRepo.delete.mockResolvedValue({ affected: 1 } as any);

      const result = await permissionRepository.delete(permissionId);

      expect(mockPermissionRepo.delete).toHaveBeenCalledWith(permissionId);
      expect(result).toBe(true);
    });

    it('should return false when permission not found or could not be deleted', async () => {
      const permissionId = 'permission-id';

      mockPermissionRepo.delete.mockResolvedValue({ affected: 0 } as any);

      const result = await permissionRepository.delete(permissionId);

      expect(mockPermissionRepo.delete).toHaveBeenCalledWith(permissionId);
      expect(result).toBe(false);
    });

    it('should return false when affected is undefined', async () => {
      const permissionId = 'permission-id';

      mockPermissionRepo.delete.mockResolvedValue({
        affected: undefined,
      } as any);

      const result = await permissionRepository.delete(permissionId);

      expect(mockPermissionRepo.delete).toHaveBeenCalledWith(permissionId);
      expect(result).toBe(false);
    });
  });
});
