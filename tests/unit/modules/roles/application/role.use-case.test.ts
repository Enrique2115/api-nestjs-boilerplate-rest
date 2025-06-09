import { PaginateQuery } from 'nestjs-paginate';
import { vi } from 'vitest';

import { IPermissionRepository } from '@/modules/permission/domain';
import {
  CreateRoleDto,
  RoleUseCase,
  UpdateRoleDto,
} from '@/modules/roles/application';
import { IRoleRepository, Role } from '@/modules/roles/domain';

import { createMock, Mock } from '@/tests/utils/mock';

describe('RoleUseCase', () => {
  let roleUseCase: RoleUseCase;
  let mockRoleRepository: Mock<IRoleRepository>;
  let mockPermissionRepository: Mock<IPermissionRepository>;

  beforeEach(() => {
    mockRoleRepository = createMock<IRoleRepository>();
    mockPermissionRepository = createMock<IPermissionRepository>();
    roleUseCase = new RoleUseCase(mockRoleRepository, mockPermissionRepository);
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
        isActive: true,
        permissions: [],
      } as Role;

      mockRoleRepository.findByName.mockResolvedValue(undefined);
      mockRoleRepository.create.mockResolvedValue(mockRole);
      mockRoleRepository.findById.mockResolvedValue(mockRole);

      const result = await roleUseCase.createRole(createRoleDto);

      expect(mockRoleRepository.findByName).toHaveBeenCalledWith('admin');
      expect(mockRoleRepository.create).toHaveBeenCalledWith({
        name: 'admin',
        description: 'Administrator role',
        isActive: true,
      });
      expect(result).toEqual(mockRole);
    });

    it('should create a role with permissions', async () => {
      const createRoleDto: CreateRoleDto = {
        name: 'admin',
        description: 'Administrator role',
        permissionIds: ['permission-1', 'permission-2'],
      };

      const mockRole = {
        id: '1',
        name: 'admin',
        description: 'Administrator role',
        isActive: true,
        permissions: [],
      } as Role;

      const mockPermission1 = {
        id: 'permission-1',
        name: 'read',
      };

      const mockPermission2 = {
        id: 'permission-2',
        name: 'write',
      };

      mockRoleRepository.findByName.mockResolvedValue(undefined);
      mockRoleRepository.create.mockResolvedValue(mockRole);
      mockRoleRepository.findById.mockResolvedValue(mockRole);
      mockPermissionRepository.findById
        .mockResolvedValueOnce(mockPermission1)
        .mockResolvedValueOnce(mockPermission2);
      mockRoleRepository.addPermission.mockResolvedValue(mockRole);

      const result = await roleUseCase.createRole(createRoleDto);

      expect(mockRoleRepository.findByName).toHaveBeenCalledWith('admin');
      expect(mockRoleRepository.create).toHaveBeenCalledWith({
        name: 'admin',
        description: 'Administrator role',
        isActive: true,
      });
      expect(mockPermissionRepository.findById).toHaveBeenCalledWith(
        'permission-1',
      );
      expect(mockPermissionRepository.findById).toHaveBeenCalledWith(
        'permission-2',
      );
      expect(mockRoleRepository.addPermission).toHaveBeenCalledWith(
        '1',
        'permission-1',
      );
      expect(mockRoleRepository.addPermission).toHaveBeenCalledWith(
        '1',
        'permission-2',
      );
      expect(result).toEqual(mockRole);
    });

    it('should throw error when role already exists', async () => {
      const createRoleDto: CreateRoleDto = {
        name: 'admin',
        description: 'Administrator role',
      };

      const existingRole = {
        id: '1',
        name: 'admin',
      } as Role;

      mockRoleRepository.findByName.mockResolvedValue(existingRole);

      await expect(roleUseCase.createRole(createRoleDto)).rejects.toThrow(
        'Role already exists with this name',
      );
      expect(mockRoleRepository.findByName).toHaveBeenCalledWith('admin');
      expect(mockRoleRepository.create).not.toHaveBeenCalled();
    });

    it('should skip invalid permissions when creating role', async () => {
      const createRoleDto: CreateRoleDto = {
        name: 'admin',
        description: 'Administrator role',
        permissionIds: ['valid-permission', 'invalid-permission'],
      };

      const mockRole = {
        id: '1',
        name: 'admin',
        description: 'Administrator role',
        isActive: true,
        permissions: [],
      } as Role;

      const mockPermission = {
        id: 'valid-permission',
        name: 'read',
      };

      mockRoleRepository.findByName.mockResolvedValue(undefined);
      mockRoleRepository.create.mockResolvedValue(mockRole);
      mockRoleRepository.findById.mockResolvedValue(mockRole);
      mockPermissionRepository.findById
        .mockResolvedValueOnce(mockPermission)
        .mockResolvedValueOnce(undefined);
      mockRoleRepository.addPermission.mockResolvedValue(mockRole);

      const result = await roleUseCase.createRole(createRoleDto);

      expect(mockRoleRepository.addPermission).toHaveBeenCalledTimes(1);
      expect(mockRoleRepository.addPermission).toHaveBeenCalledWith(
        '1',
        'valid-permission',
      );
      expect(result).toEqual(mockRole);
    });
  });

  describe('getRoleById', () => {
    it('should return role by id', async () => {
      const roleId = '1';
      const mockRole = {
        id: roleId,
        name: 'admin',
        description: 'Administrator role',
      } as Role;

      mockRoleRepository.findById.mockResolvedValue(mockRole);

      const result = await roleUseCase.getRoleById(roleId);

      expect(mockRoleRepository.findById).toHaveBeenCalledWith(roleId);
      expect(result).toEqual(mockRole);
    });

    it('should return undefined when role not found', async () => {
      const roleId = 'non-existent';
      mockRoleRepository.findById.mockResolvedValue(undefined);

      const result = await roleUseCase.getRoleById(roleId);

      expect(mockRoleRepository.findById).toHaveBeenCalledWith(roleId);
      expect(result).toBeUndefined();
    });
  });

  describe('getRoleByName', () => {
    it('should return role by name', async () => {
      const roleName = 'admin';
      const mockRole = {
        id: '1',
        name: roleName,
        description: 'Administrator role',
      } as Role;

      mockRoleRepository.findByName.mockResolvedValue(mockRole);

      const result = await roleUseCase.getRoleByName(roleName);

      expect(mockRoleRepository.findByName).toHaveBeenCalledWith(roleName);
      expect(result).toEqual(mockRole);
    });

    it('should return undefined when role not found by name', async () => {
      const roleName = 'non-existent';
      mockRoleRepository.findByName.mockResolvedValue(undefined);

      const result = await roleUseCase.getRoleByName(roleName);

      expect(mockRoleRepository.findByName).toHaveBeenCalledWith(roleName);
      expect(result).toBeUndefined();
    });
  });

  describe('getAllRolesPaginated', () => {
    it('should return paginated roles', async () => {
      const query: PaginateQuery = { page: 1, limit: 10, path: '/roles' };
      const mockPaginatedRoles = {
        data: [
          { id: '1', name: 'admin' },
          { id: '2', name: 'user' },
        ],
        meta: {
          totalItems: 2,
          itemCount: 2,
          itemsPerPage: 10,
          totalPages: 1,
          currentPage: 1,
        },
      };

      mockRoleRepository.findAllPaginated.mockResolvedValue(mockPaginatedRoles);

      const result = await roleUseCase.getAllRolesPaginated(query);

      expect(mockRoleRepository.findAllPaginated).toHaveBeenCalledWith(query);
      expect(result).toEqual(mockPaginatedRoles);
    });
  });

  describe('updateRole', () => {
    it('should update role successfully', async () => {
      const roleId = '1';
      const updateRoleDto: UpdateRoleDto = {
        name: 'updated-admin',
        description: 'Updated administrator role',
      };

      const existingRole = {
        id: roleId,
        name: 'admin',
        description: 'Administrator role',
      } as Role;

      const updatedRole = {
        id: roleId,
        name: 'updated-admin',
        description: 'Updated administrator role',
      } as Role;

      mockRoleRepository.findById.mockResolvedValue(existingRole);
      mockRoleRepository.findByName.mockResolvedValue(undefined);
      mockRoleRepository.update.mockResolvedValue(updatedRole);

      const result = await roleUseCase.updateRole(roleId, updateRoleDto);

      expect(mockRoleRepository.findById).toHaveBeenCalledWith(roleId);
      expect(mockRoleRepository.findByName).toHaveBeenCalledWith(
        'updated-admin',
      );
      expect(mockRoleRepository.update).toHaveBeenCalledWith(
        roleId,
        updateRoleDto,
      );
      expect(result).toEqual(updatedRole);
    });

    it('should update role without changing name', async () => {
      const roleId = '1';
      const updateRoleDto: UpdateRoleDto = {
        description: 'Updated description only',
      };

      const existingRole = {
        id: roleId,
        name: 'admin',
        description: 'Administrator role',
      } as Role;

      const updatedRole = {
        id: roleId,
        name: 'admin',
        description: 'Updated description only',
      } as Role;

      mockRoleRepository.findById.mockResolvedValue(existingRole);
      mockRoleRepository.update.mockResolvedValue(updatedRole);

      const result = await roleUseCase.updateRole(roleId, updateRoleDto);

      expect(mockRoleRepository.findById).toHaveBeenCalledWith(roleId);
      expect(mockRoleRepository.findByName).not.toHaveBeenCalled();
      expect(mockRoleRepository.update).toHaveBeenCalledWith(
        roleId,
        updateRoleDto,
      );
      expect(result).toEqual(updatedRole);
    });

    it('should throw error when role not found', async () => {
      const roleId = 'non-existent';
      const updateRoleDto: UpdateRoleDto = {
        name: 'updated-admin',
      };

      mockRoleRepository.findById.mockResolvedValue(undefined);

      await expect(
        roleUseCase.updateRole(roleId, updateRoleDto),
      ).rejects.toThrow('Role not found');
      expect(mockRoleRepository.findById).toHaveBeenCalledWith(roleId);
      expect(mockRoleRepository.update).not.toHaveBeenCalled();
    });

    it('should throw error when new name is already in use', async () => {
      const roleId = '1';
      const updateRoleDto: UpdateRoleDto = {
        name: 'existing-role',
      };

      const existingRole = {
        id: roleId,
        name: 'admin',
      } as Role;

      const conflictingRole = {
        id: '2',
        name: 'existing-role',
      } as Role;

      mockRoleRepository.findById.mockResolvedValue(existingRole);
      mockRoleRepository.findByName.mockResolvedValue(conflictingRole);

      await expect(
        roleUseCase.updateRole(roleId, updateRoleDto),
      ).rejects.toThrow('Role name already in use');
      expect(mockRoleRepository.findById).toHaveBeenCalledWith(roleId);
      expect(mockRoleRepository.findByName).toHaveBeenCalledWith(
        'existing-role',
      );
      expect(mockRoleRepository.update).not.toHaveBeenCalled();
    });

    it('should allow updating to same name', async () => {
      const roleId = '1';
      const updateRoleDto: UpdateRoleDto = {
        name: 'admin',
        description: 'Updated description',
      };

      const existingRole = {
        id: roleId,
        name: 'admin',
        description: 'Old description',
      } as Role;

      const updatedRole = {
        id: roleId,
        name: 'admin',
        description: 'Updated description',
      } as Role;

      mockRoleRepository.findById.mockResolvedValue(existingRole);
      mockRoleRepository.update.mockResolvedValue(updatedRole);

      const result = await roleUseCase.updateRole(roleId, updateRoleDto);

      expect(mockRoleRepository.findById).toHaveBeenCalledWith(roleId);
      expect(mockRoleRepository.findByName).not.toHaveBeenCalled();
      expect(mockRoleRepository.update).toHaveBeenCalledWith(
        roleId,
        updateRoleDto,
      );
      expect(result).toEqual(updatedRole);
    });
  });

  describe('deleteRole', () => {
    it('should delete role successfully', async () => {
      const roleId = '1';
      const mockRole = {
        id: roleId,
        name: 'admin',
      } as Role;

      mockRoleRepository.findById.mockResolvedValue(mockRole);
      mockRoleRepository.delete.mockResolvedValue(true);

      const result = await roleUseCase.deleteRole(roleId);

      expect(mockRoleRepository.findById).toHaveBeenCalledWith(roleId);
      expect(mockRoleRepository.delete).toHaveBeenCalledWith(roleId);
      expect(result).toBe(true);
    });

    it('should throw error when role not found', async () => {
      const roleId = 'non-existent';
      mockRoleRepository.findById.mockResolvedValue(undefined);

      await expect(roleUseCase.deleteRole(roleId)).rejects.toThrow(
        'Role not found',
      );
      expect(mockRoleRepository.findById).toHaveBeenCalledWith(roleId);
      expect(mockRoleRepository.delete).not.toHaveBeenCalled();
    });
  });

  describe('assignPermission', () => {
    it('should assign permission to role successfully', async () => {
      const roleId = '1';
      const permissionId = 'permission-1';

      const mockRole = {
        id: roleId,
        name: 'admin',
        hasPermission: vi.fn().mockReturnValue(false),
      } as any;

      const mockPermission = {
        id: permissionId,
        name: 'read',
      };

      const updatedRole = {
        id: roleId,
        name: 'admin',
        permissions: [mockPermission],
      } as Role;

      mockRoleRepository.findById.mockResolvedValue(mockRole);
      mockPermissionRepository.findById.mockResolvedValue(mockPermission);
      mockRoleRepository.addPermission.mockResolvedValue(updatedRole);

      const result = await roleUseCase.assignPermission(roleId, permissionId);

      expect(mockRoleRepository.findById).toHaveBeenCalledWith(roleId);
      expect(mockPermissionRepository.findById).toHaveBeenCalledWith(
        permissionId,
      );
      expect(mockRole.hasPermission).toHaveBeenCalledWith('read');
      expect(mockRoleRepository.addPermission).toHaveBeenCalledWith(
        roleId,
        permissionId,
      );
      expect(result).toEqual(updatedRole);
    });

    it('should throw error when role not found', async () => {
      const roleId = 'non-existent';
      const permissionId = 'permission-1';

      mockRoleRepository.findById.mockResolvedValue(undefined);

      await expect(
        roleUseCase.assignPermission(roleId, permissionId),
      ).rejects.toThrow('Role not found');
      expect(mockRoleRepository.findById).toHaveBeenCalledWith(roleId);
      expect(mockPermissionRepository.findById).not.toHaveBeenCalled();
    });

    it('should throw error when permission not found', async () => {
      const roleId = '1';
      const permissionId = 'non-existent';

      const mockRole = {
        id: roleId,
        name: 'admin',
      } as Role;

      mockRoleRepository.findById.mockResolvedValue(mockRole);
      mockPermissionRepository.findById.mockResolvedValue(undefined);

      await expect(
        roleUseCase.assignPermission(roleId, permissionId),
      ).rejects.toThrow('Permission not found');
      expect(mockRoleRepository.findById).toHaveBeenCalledWith(roleId);
      expect(mockPermissionRepository.findById).toHaveBeenCalledWith(
        permissionId,
      );
    });

    it('should throw error when role already has permission', async () => {
      const roleId = '1';
      const permissionId = 'permission-1';

      const mockRole = {
        id: roleId,
        name: 'admin',
        hasPermission: vi.fn().mockReturnValue(true),
      } as any;

      const mockPermission = {
        id: permissionId,
        name: 'read',
      };

      mockRoleRepository.findById.mockResolvedValue(mockRole);
      mockPermissionRepository.findById.mockResolvedValue(mockPermission);

      await expect(
        roleUseCase.assignPermission(roleId, permissionId),
      ).rejects.toThrow('Role already has this permission');
      expect(mockRole.hasPermission).toHaveBeenCalledWith('read');
      expect(mockRoleRepository.addPermission).not.toHaveBeenCalled();
    });
  });

  describe('removePermission', () => {
    it('should remove permission from role successfully', async () => {
      const roleId = '1';
      const permissionId = 'permission-1';

      const mockRole = {
        id: roleId,
        name: 'admin',
        hasPermission: vi.fn().mockReturnValue(true),
      } as any;

      const mockPermission = {
        id: permissionId,
        name: 'read',
      };

      const updatedRole = {
        id: roleId,
        name: 'admin',
        permissions: [],
      } as Role;

      mockRoleRepository.findById.mockResolvedValue(mockRole);
      mockPermissionRepository.findById.mockResolvedValue(mockPermission);
      mockRoleRepository.removePermission.mockResolvedValue(updatedRole);

      const result = await roleUseCase.removePermission(roleId, permissionId);

      expect(mockRoleRepository.findById).toHaveBeenCalledWith(roleId);
      expect(mockPermissionRepository.findById).toHaveBeenCalledWith(
        permissionId,
      );
      expect(mockRole.hasPermission).toHaveBeenCalledWith('read');
      expect(mockRoleRepository.removePermission).toHaveBeenCalledWith(
        roleId,
        permissionId,
      );
      expect(result).toEqual(updatedRole);
    });

    it('should throw error when role not found', async () => {
      const roleId = 'non-existent';
      const permissionId = 'permission-1';

      mockRoleRepository.findById.mockResolvedValue(undefined);

      await expect(
        roleUseCase.removePermission(roleId, permissionId),
      ).rejects.toThrow('Role not found');
      expect(mockRoleRepository.findById).toHaveBeenCalledWith(roleId);
      expect(mockPermissionRepository.findById).not.toHaveBeenCalled();
    });

    it('should throw error when permission not found', async () => {
      const roleId = '1';
      const permissionId = 'non-existent';

      const mockRole = {
        id: roleId,
        name: 'admin',
      } as Role;

      mockRoleRepository.findById.mockResolvedValue(mockRole);
      mockPermissionRepository.findById.mockResolvedValue(undefined);

      await expect(
        roleUseCase.removePermission(roleId, permissionId),
      ).rejects.toThrow('Permission not found');
      expect(mockRoleRepository.findById).toHaveBeenCalledWith(roleId);
      expect(mockPermissionRepository.findById).toHaveBeenCalledWith(
        permissionId,
      );
    });

    it('should throw error when role does not have permission', async () => {
      const roleId = '1';
      const permissionId = 'permission-1';

      const mockRole = {
        id: roleId,
        name: 'admin',
        hasPermission: vi.fn().mockReturnValue(false),
      } as any;

      const mockPermission = {
        id: permissionId,
        name: 'read',
      };

      mockRoleRepository.findById.mockResolvedValue(mockRole);
      mockPermissionRepository.findById.mockResolvedValue(mockPermission);

      await expect(
        roleUseCase.removePermission(roleId, permissionId),
      ).rejects.toThrow('Role does not have this permission');
      expect(mockRole.hasPermission).toHaveBeenCalledWith('read');
      expect(mockRoleRepository.removePermission).not.toHaveBeenCalled();
    });
  });

  describe('activateRole', () => {
    it('should activate role successfully', async () => {
      const roleId = '1';
      const activatedRole = {
        id: roleId,
        name: 'admin',
        isActive: true,
      } as Role;

      mockRoleRepository.update.mockResolvedValue(activatedRole);

      const result = await roleUseCase.activateRole(roleId);

      expect(mockRoleRepository.update).toHaveBeenCalledWith(roleId, {
        isActive: true,
      });
      expect(result).toEqual(activatedRole);
    });

    it('should return undefined when role activation fails', async () => {
      const roleId = 'non-existent';
      mockRoleRepository.update.mockResolvedValue(undefined);

      const result = await roleUseCase.activateRole(roleId);

      expect(mockRoleRepository.update).toHaveBeenCalledWith(roleId, {
        isActive: true,
      });
      expect(result).toBeUndefined();
    });
  });

  describe('deactivateRole', () => {
    it('should deactivate role successfully', async () => {
      const roleId = '1';
      const deactivatedRole = {
        id: roleId,
        name: 'admin',
        isActive: false,
      } as Role;

      mockRoleRepository.update.mockResolvedValue(deactivatedRole);

      const result = await roleUseCase.deactivateRole(roleId);

      expect(mockRoleRepository.update).toHaveBeenCalledWith(roleId, {
        isActive: false,
      });
      expect(result).toEqual(deactivatedRole);
    });

    it('should return undefined when role deactivation fails', async () => {
      const roleId = 'non-existent';
      mockRoleRepository.update.mockResolvedValue(undefined);

      const result = await roleUseCase.deactivateRole(roleId);

      expect(mockRoleRepository.update).toHaveBeenCalledWith(roleId, {
        isActive: false,
      });
      expect(result).toBeUndefined();
    });
  });

  describe('getRolePermissions', () => {
    it('should return role permissions when role is active', async () => {
      const roleId = '1';
      const mockRole = {
        id: roleId,
        name: 'admin',
        isActive: true,
        permissions: [
          { id: '1', name: 'read' },
          { id: '2', name: 'write' },
        ],
      } as Role;

      mockRoleRepository.findById.mockResolvedValue(mockRole);

      const result = await roleUseCase.getRolePermissions(roleId);

      expect(mockRoleRepository.findById).toHaveBeenCalledWith(roleId);
      expect(result).toEqual(['read', 'write']);
    });

    it('should return empty array when role not found', async () => {
      const roleId = 'non-existent';
      mockRoleRepository.findById.mockResolvedValue(undefined);

      const result = await roleUseCase.getRolePermissions(roleId);

      expect(mockRoleRepository.findById).toHaveBeenCalledWith(roleId);
      expect(result).toEqual([]);
    });

    it('should return empty array when role is inactive', async () => {
      const roleId = '1';
      const mockRole = {
        id: roleId,
        name: 'admin',
        isActive: false,
        permissions: [
          { id: '1', name: 'read' },
          { id: '2', name: 'write' },
        ],
      } as Role;

      mockRoleRepository.findById.mockResolvedValue(mockRole);

      const result = await roleUseCase.getRolePermissions(roleId);

      expect(mockRoleRepository.findById).toHaveBeenCalledWith(roleId);
      expect(result).toEqual([]);
    });

    it('should return empty array when role has no permissions', async () => {
      const roleId = '1';
      const mockRole = {
        id: roleId,
        name: 'admin',
        isActive: true,
        permissions: [],
      } as Role;

      mockRoleRepository.findById.mockResolvedValue(mockRole);

      const result = await roleUseCase.getRolePermissions(roleId);

      expect(mockRoleRepository.findById).toHaveBeenCalledWith(roleId);
      expect(result).toEqual([]);
    });
  });
});
