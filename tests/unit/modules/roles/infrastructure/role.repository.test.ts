import { paginate, PaginateQuery } from 'nestjs-paginate';
import { Repository } from 'typeorm';
import { vi } from 'vitest';

import { Permission } from '@/src/modules/permission/domain';
import { Role } from '@/src/modules/roles/domain';
import { RoleRepository } from '@/src/modules/roles/infrastructure/persistence/role.repository';

import { createMock, Mock } from '@/tests/utils/mock';

vi.mock('nestjs-paginate', () => ({
  paginate: vi.fn(),
}));

describe('RoleRepository', () => {
  let roleRepository: RoleRepository;
  let mockRoleRepo: Mock<Repository<Role>>;
  let mockPermissionRepo: Mock<Repository<Permission>>;
  let mockPaginate: any;

  beforeEach(() => {
    mockRoleRepo = createMock<Repository<Role>>();
    mockPermissionRepo = createMock<Repository<Permission>>();
    roleRepository = new RoleRepository(mockRoleRepo, mockPermissionRepo);
    mockPaginate = vi.mocked(paginate);
  });

  describe('findById', () => {
    it('should return role when found', async () => {
      const roleId = 'role-id';
      const mockRole = {
        id: roleId,
        name: 'admin',
        permissions: [],
      } as Role;

      mockRoleRepo.findOne.mockResolvedValue(mockRole);

      const result = await roleRepository.findById(roleId);

      expect(mockRoleRepo.findOne).toHaveBeenCalledWith({
        where: { id: roleId },
        relations: ['permissions'],
      });
      expect(result).toEqual(mockRole);
    });

    it('should return undefined when role not found', async () => {
      const roleId = 'nonexistent-id';

      mockRoleRepo.findOne.mockResolvedValue(undefined);

      const result = await roleRepository.findById(roleId);

      expect(mockRoleRepo.findOne).toHaveBeenCalledWith({
        where: { id: roleId },
        relations: ['permissions'],
      });
      expect(result).toBeUndefined();
    });
  });

  describe('findByName', () => {
    it('should return role when found', async () => {
      const roleName = 'admin';
      const mockRole = {
        id: 'role-id',
        name: roleName,
        permissions: [],
      } as Role;

      mockRoleRepo.findOne.mockResolvedValue(mockRole);

      const result = await roleRepository.findByName(roleName);

      expect(mockRoleRepo.findOne).toHaveBeenCalledWith({
        where: { name: roleName },
        relations: ['permissions'],
      });
      expect(result).toEqual(mockRole);
    });

    it('should return undefined when role not found', async () => {
      const roleName = 'nonexistent';

      mockRoleRepo.findOne.mockResolvedValue(undefined);

      const result = await roleRepository.findByName(roleName);

      expect(result).toBeUndefined();
    });
  });

  describe('findAllPaginated', () => {
    it('should return paginated roles', async () => {
      const mockQuery: PaginateQuery = { page: 1, limit: 10, path: '/roles' };
      const mockPaginatedResult = {
        data: [
          { id: '1', name: 'admin', permissions: [] },
          { id: '2', name: 'user', permissions: [] },
        ],
        meta: {
          totalItems: 2,
          itemCount: 2,
          itemsPerPage: 10,
          totalPages: 1,
          currentPage: 1,
        },
      };

      mockPaginate.mockResolvedValue(mockPaginatedResult);

      const result = await roleRepository.findAllPaginated(mockQuery);

      expect(result).toEqual(mockPaginatedResult);
    });
  });

  describe('create', () => {
    it('should create and return role', async () => {
      const roleData = {
        name: 'new-role',
        description: 'A new role',
      };

      const mockRole = {
        id: '1',
        ...roleData,
        permissions: [],
      } as Role;

      mockRoleRepo.create.mockReturnValue(mockRole);
      mockRoleRepo.save.mockResolvedValue(mockRole);

      const result = await roleRepository.create(roleData);

      expect(mockRoleRepo.create).toHaveBeenCalledWith(roleData);
      expect(mockRoleRepo.save).toHaveBeenCalledWith(mockRole);
      expect(result).toEqual(mockRole);
    });
  });

  describe('update', () => {
    it('should update and return role', async () => {
      const roleId = 'role-id';
      const updateData = {
        name: 'updated-role',
        description: 'Updated description',
      };

      const mockUpdatedRole = {
        id: roleId,
        name: 'updated-role',
        description: 'Updated description',
        permissions: [],
      } as Role;

      mockRoleRepo.update.mockResolvedValue({ affected: 1 } as any);
      mockRoleRepo.findOne.mockResolvedValue(mockUpdatedRole);

      const result = await roleRepository.update(roleId, updateData);

      expect(mockRoleRepo.update).toHaveBeenCalledWith(roleId, updateData);
      expect(result).toEqual(mockUpdatedRole);
    });

    it('should return undefined when role not found after update', async () => {
      const roleId = 'nonexistent-id';
      const updateData = { name: 'updated-role' };

      mockRoleRepo.update.mockResolvedValue({ affected: 1 });
      mockRoleRepo.findOne.mockResolvedValue(undefined);

      const result = await roleRepository.update(roleId, updateData);

      expect(result).toBeUndefined();
    });
  });

  describe('delete', () => {
    it('should delete role successfully', async () => {
      const roleId = 'role-id';

      mockRoleRepo.delete.mockResolvedValue({ affected: 1 } as any);

      await roleRepository.delete(roleId);

      expect(mockRoleRepo.delete).toHaveBeenCalledWith(roleId);
    });

    it('should return false when role not found or could not be deleted', async () => {
      const roleId = 'nonexistent-id';

      mockRoleRepo.delete.mockResolvedValue({ affected: 0 });

      const result = await roleRepository.delete(roleId);

      expect(result).toBe(false);
    });
  });

  describe('addPermission', () => {
    it('should add permission to role successfully', async () => {
      const roleId = 'role-id';
      const permissionId = 'permission-id';

      const mockRole = {
        id: roleId,
        name: 'admin',
        permissions: [],
      } as Role;

      const mockPermission = {
        id: permissionId,
        name: 'read',
      } as Permission;

      mockRoleRepo.findOne.mockResolvedValue(mockRole);
      mockPermissionRepo.findOne.mockResolvedValue(mockPermission);
      mockRoleRepo.save.mockResolvedValue(mockRole);

      await roleRepository.addPermission(roleId, permissionId);

      expect(mockRoleRepo.findOne).toHaveBeenCalledWith({
        where: { id: roleId },
        relations: ['permissions'],
      });
      expect(mockPermissionRepo.findOne).toHaveBeenCalledWith({
        where: { id: permissionId },
      });
      expect(mockRole.permissions).toContain(mockPermission);
      expect(mockRoleRepo.save).toHaveBeenCalledWith(mockRole);
    });

    it('should not add permission if role already has it', async () => {
      const roleId = 'role-id';
      const permissionId = 'permission-id';

      const mockPermission = {
        id: permissionId,
        name: 'read',
      } as Permission;

      const mockRole = {
        id: roleId,
        name: 'admin',
        permissions: [mockPermission],
      } as Role;

      mockRoleRepo.findOne.mockResolvedValue(mockRole);
      mockPermissionRepo.findOne.mockResolvedValue(mockPermission);

      await roleRepository.addPermission(roleId, permissionId);

      expect(mockRoleRepo.save).not.toHaveBeenCalled();
    });

    it('should return undefined when role not found', async () => {
      const roleId = 'nonexistent-id';
      const permissionId = 'permission-id';

      mockRoleRepo.findOne.mockResolvedValue(undefined);

      const result = await roleRepository.addPermission(roleId, permissionId);

      expect(result).toBeUndefined();
    });

    it('should return undefined when permission not found', async () => {
      const roleId = 'role-id';
      const permissionId = 'nonexistent-permission-id';

      const mockRole = {
        id: roleId,
        name: 'admin',
        permissions: [],
      } as Role;

      mockRoleRepo.findOne.mockResolvedValue(mockRole);
      mockPermissionRepo.findOne.mockResolvedValue(undefined);

      const result = await roleRepository.addPermission(roleId, permissionId);

      expect(result).toBeUndefined();
    });
  });

  describe('removePermission', () => {
    it('should remove permission from role successfully', async () => {
      const roleId = 'role-id';
      const permissionId = 'permission-id';

      const mockPermission = {
        id: permissionId,
        name: 'read',
      } as Permission;

      const mockRole = {
        id: roleId,
        name: 'admin',
        permissions: [mockPermission],
      } as Role;

      mockRoleRepo.findOne.mockResolvedValue(mockRole);
      mockRoleRepo.save.mockResolvedValue(mockRole);

      await roleRepository.removePermission(roleId, permissionId);

      expect(mockRole.permissions).toHaveLength(0);
      expect(mockRoleRepo.save).toHaveBeenCalledWith(mockRole);
    });

    it('should return undefined when role not found', async () => {
      const roleId = 'nonexistent-id';
      const permissionId = 'permission-id';

      mockRoleRepo.findOne.mockResolvedValue(undefined);

      const result = await roleRepository.removePermission(
        roleId,
        permissionId,
      );

      expect(result).toBeUndefined();
    });
  });
});
