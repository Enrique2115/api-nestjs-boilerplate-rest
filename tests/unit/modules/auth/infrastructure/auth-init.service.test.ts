import * as bcrypt from 'bcryptjs';
import { vi } from 'vitest';

import {
  DEFAULT_PERMISSIONS,
  DEFAULT_ROLES,
  ROLE_PERMISSIONS,
} from '@/modules/auth/domain';
import { AuthInitService } from '@/modules/auth/infrastructure';
import { PermissionRepository } from '@/modules/permission/infrastructure';
import { RoleRepository } from '@/modules/roles/infrastructure';
import { UserRepository } from '@/modules/users/infrastructure';

import { createMock, Mock } from '@/tests/utils/mock';

// Mock bcrypt
vi.mock('bcryptjs', () => ({
  hash: vi.fn(),
}));

// Mock Logger
vi.mock('@nestjs/common', async () => {
  const actual = await vi.importActual('@nestjs/common');
  return {
    ...actual,
    Logger: vi.fn().mockImplementation(() => ({
      log: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
      debug: vi.fn(),
    })),
  };
});

describe('AuthInitService', () => {
  let authInitService: AuthInitService;
  let mockUserRepository: Mock<UserRepository>;
  let mockRoleRepository: Mock<RoleRepository>;
  let mockPermissionRepository: Mock<PermissionRepository>;
  let mockLogger: any;

  beforeEach(() => {
    mockUserRepository = createMock<UserRepository>();
    mockRoleRepository = createMock<RoleRepository>();
    mockPermissionRepository = createMock<PermissionRepository>();

    authInitService = new AuthInitService(
      mockUserRepository,
      mockRoleRepository,
      mockPermissionRepository,
    );

    // Access the private logger for testing
    mockLogger = (authInitService as any).logger;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('onModuleInit', () => {
    it('should initialize auth module successfully', async () => {
      // Mock all repository methods to return appropriate values
      mockPermissionRepository.findByName.mockResolvedValue(undefined);
      mockPermissionRepository.create.mockResolvedValue({
        id: '1',
        name: 'users:create',
        description: 'Permission to users create',
        isActive: true,
      } as any);

      mockRoleRepository.findByName.mockResolvedValue(undefined);
      mockRoleRepository.create.mockResolvedValue({
        id: '1',
        name: 'admin',
        description: 'Admin role',
        isActive: true,
        permissions: [],
      } as any);

      mockUserRepository.findByEmail.mockResolvedValue(undefined);
      mockUserRepository.create.mockResolvedValue({
        id: '1',
        email: 'admin@example.com',
        firstName: 'Admin',
        lastName: 'User',
        isActive: true,
        isEmailVerified: true,
      } as any);

      mockRoleRepository.findByName.mockResolvedValue({
        id: '1',
        name: 'admin',
      } as any);

      mockUserRepository.addRole.mockResolvedValue({} as any);
      mockPermissionRepository.findByName.mockResolvedValue({
        id: '1',
        name: 'users:create',
      } as any);
      mockRoleRepository.addPermission.mockResolvedValue({} as any);

      await authInitService.onModuleInit();

      expect(mockLogger.log).toHaveBeenCalledWith(
        'Initializing Auth Module...',
      );
      expect(mockLogger.log).toHaveBeenCalledWith(
        'Auth Module initialized successfully',
      );
    });

    it('should handle errors during initialization', async () => {
      const error = new Error('Database connection failed');
      mockPermissionRepository.findByName.mockRejectedValue(error);

      await expect(authInitService.onModuleInit()).rejects.toThrow(
        'Database connection failed',
      );
    });
  });

  describe('createDefaultPermissions', () => {
    it('should create all default permissions when they do not exist', async () => {
      mockPermissionRepository.findByName.mockResolvedValue(undefined);
      mockPermissionRepository.create.mockResolvedValue({
        id: '1',
        name: 'users:create',
        description: 'Permission to users create',
        isActive: true,
      } as any);

      await (authInitService as any).createDefaultPermissions();

      expect(mockLogger.log).toHaveBeenCalledWith(
        'Creating default permissions...',
      );

      // Verify that findByName was called for each permission
      const permissionValues = Object.values(DEFAULT_PERMISSIONS);
      expect(mockPermissionRepository.findByName).toHaveBeenCalledTimes(
        permissionValues.length,
      );

      // Verify that create was called for each permission
      expect(mockPermissionRepository.create).toHaveBeenCalledTimes(
        permissionValues.length,
      );

      // Verify specific permission creation
      expect(mockPermissionRepository.create).toHaveBeenCalledWith({
        name: 'users:create',
        description: 'Permission to users create',
        isActive: true,
      });
    });

    it('should skip creating permissions that already exist', async () => {
      const existingPermission = {
        id: '1',
        name: 'users:create',
        description: 'Permission to users create',
        isActive: true,
      };

      mockPermissionRepository.findByName.mockResolvedValue(
        existingPermission as any,
      );

      await (authInitService as any).createDefaultPermissions();

      expect(mockPermissionRepository.create).not.toHaveBeenCalled();
      expect(mockLogger.log).toHaveBeenCalledWith(
        'Creating default permissions...',
      );
    });

    it('should handle mixed scenario with some existing and some new permissions', async () => {
      let callCount = 0;
      mockPermissionRepository.findByName.mockImplementation(() => {
        callCount++;
        // Return existing permission for first call, null for others
        if (callCount === 1) {
          return Promise.resolve({
            id: '1',
            name: 'users:create',
            description: 'Permission to users create',
            isActive: true,
          } as any);
        }
        return Promise.resolve(undefined);
      });

      mockPermissionRepository.create.mockResolvedValue({
        id: '2',
        name: 'users:read',
        description: 'Permission to users read',
        isActive: true,
      } as any);

      await (authInitService as any).createDefaultPermissions();

      const permissionValues = Object.values(DEFAULT_PERMISSIONS);
      expect(mockPermissionRepository.findByName).toHaveBeenCalledTimes(
        permissionValues.length,
      );
      // Should create all except the first one (which already exists)
      expect(mockPermissionRepository.create).toHaveBeenCalledTimes(
        permissionValues.length - 1,
      );
    });
  });

  describe('createDefaultRoles', () => {
    it('should create all default roles with permissions when they do not exist', async () => {
      const mockRole = {
        id: '1',
        name: 'admin',
        description: 'Admin role',
        isActive: true,
        permissions: [],
      };

      const mockPermission = {
        id: '1',
        name: 'users:create',
      };

      mockRoleRepository.findByName.mockResolvedValue(undefined);
      mockRoleRepository.create.mockResolvedValue(mockRole as any);
      mockPermissionRepository.findByName.mockResolvedValue(
        mockPermission as any,
      );
      mockRoleRepository.addPermission.mockResolvedValue(mockRole as any);

      await (authInitService as any).createDefaultRoles();

      expect(mockLogger.log).toHaveBeenCalledWith('Creating default roles...');

      // Verify role creation for each default role
      const roleNames = Object.keys(ROLE_PERMISSIONS);
      expect(mockRoleRepository.create).toHaveBeenCalledTimes(roleNames.length);

      // Verify specific role creation
      expect(mockRoleRepository.create).toHaveBeenCalledWith({
        name: 'admin',
        description: 'Admin role',
        isActive: true,
      });
    });

    it('should assign permissions to existing roles that do not have them', async () => {
      const mockRole = {
        id: '1',
        name: 'admin',
        description: 'Admin role',
        isActive: true,
        permissions: [], // No existing permissions
      };

      const mockPermission = {
        id: '1',
        name: 'users:create',
      };

      mockRoleRepository.findByName.mockResolvedValue(mockRole as any);
      mockPermissionRepository.findByName.mockResolvedValue(
        mockPermission as any,
      );
      mockRoleRepository.addPermission.mockResolvedValue(mockRole as any);

      await (authInitService as any).createDefaultRoles();

      expect(mockRoleRepository.create).not.toHaveBeenCalled();
      expect(mockRoleRepository.addPermission).toHaveBeenCalled();
    });

    it('should skip assigning permissions that role already has', async () => {
      // Create a role that already has all permissions for admin role
      const adminPermissions = ROLE_PERMISSIONS.admin || [];
      const mockRole = {
        id: '1',
        name: 'admin',
        description: 'Admin role',
        isActive: true,
        permissions: adminPermissions.map(name => ({ name })), // Already has all permissions
      };

      const mockPermission = {
        id: '1',
        name: 'users:create',
      };

      mockRoleRepository.findByName.mockResolvedValue(mockRole as any);
      mockPermissionRepository.findByName.mockResolvedValue(
        mockPermission as any,
      );

      await (authInitService as any).createDefaultRoles();

      expect(mockRoleRepository.addPermission).not.toHaveBeenCalled();
    });

    it('should skip assigning permissions when permission does not exist', async () => {
      const mockRole = {
        id: '1',
        name: 'admin',
        description: 'Admin role',
        isActive: true,
        permissions: [],
      };

      mockRoleRepository.findByName.mockResolvedValue(mockRole as any);
      mockPermissionRepository.findByName.mockResolvedValue(undefined); // Permission not found

      await (authInitService as any).createDefaultRoles();

      expect(mockRoleRepository.addPermission).not.toHaveBeenCalled();
    });

    it('should handle role creation with proper capitalization', async () => {
      const mockRole = {
        id: '1',
        name: 'user',
        description: 'User role',
        isActive: true,
        permissions: [],
      };

      mockRoleRepository.findByName.mockResolvedValue(undefined);
      mockRoleRepository.create.mockResolvedValue(mockRole as any);
      mockPermissionRepository.findByName.mockResolvedValue({
        id: '1',
        name: 'users:read',
      } as any);
      mockRoleRepository.addPermission.mockResolvedValue(mockRole as any);

      await (authInitService as any).createDefaultRoles();

      expect(mockRoleRepository.create).toHaveBeenCalledWith({
        name: 'user',
        description: 'User role',
        isActive: true,
      });
    });
  });

  describe('createAdminUser', () => {
    beforeEach(() => {
      (bcrypt.hash as any).mockResolvedValue('hashedPassword123');
    });

    it('should create admin user when it does not exist', async () => {
      const mockUser = {
        id: '1',
        email: 'admin@example.com',
        firstName: 'Admin',
        lastName: 'User',
        isActive: true,
        isEmailVerified: true,
      };

      const mockAdminRole = {
        id: '1',
        name: 'admin',
      };

      mockUserRepository.findByEmail.mockResolvedValue(undefined);
      mockUserRepository.create.mockResolvedValue(mockUser as any);
      mockRoleRepository.findByName.mockResolvedValue(mockAdminRole as any);
      mockUserRepository.addRole.mockResolvedValue(mockUser as any);

      await (authInitService as any).createAdminUser();

      expect(mockLogger.log).toHaveBeenCalledWith('Creating admin user...');
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(
        'admin@example.com',
      );
      expect(bcrypt.hash).toHaveBeenCalledWith('admin123', 12);
      expect(mockUserRepository.create).toHaveBeenCalledWith({
        email: 'admin@example.com',
        password: 'hashedPassword123',
        firstName: 'Admin',
        lastName: 'User',
        isActive: true,
        isEmailVerified: true,
      });
      expect(mockLogger.log).toHaveBeenCalledWith(
        'Admin user created successfully',
      );
      expect(mockRoleRepository.findByName).toHaveBeenCalledWith(
        DEFAULT_ROLES.ADMIN,
      );
      expect(mockUserRepository.addRole).toHaveBeenCalledWith('1', '1');
      expect(mockLogger.log).toHaveBeenCalledWith(
        'Admin role assigned to admin user',
      );
    });

    it('should skip creating admin user when it already exists', async () => {
      const existingUser = {
        id: '1',
        email: 'admin@example.com',
        firstName: 'Admin',
        lastName: 'User',
        isActive: true,
        isEmailVerified: true,
      };

      mockUserRepository.findByEmail.mockResolvedValue(existingUser as any);

      await (authInitService as any).createAdminUser();

      expect(mockLogger.log).toHaveBeenCalledWith('Creating admin user...');
      expect(mockUserRepository.create).not.toHaveBeenCalled();
      expect(mockUserRepository.addRole).not.toHaveBeenCalled();
    });

    it('should create admin user but skip role assignment when admin role does not exist', async () => {
      const mockUser = {
        id: '1',
        email: 'admin@example.com',
        firstName: 'Admin',
        lastName: 'User',
        isActive: true,
        isEmailVerified: true,
      };

      mockUserRepository.findByEmail.mockResolvedValue(undefined);
      mockUserRepository.create.mockResolvedValue(mockUser as any);
      mockRoleRepository.findByName.mockResolvedValue(undefined); // Admin role not found

      await (authInitService as any).createAdminUser();

      expect(mockUserRepository.create).toHaveBeenCalled();
      expect(mockLogger.log).toHaveBeenCalledWith(
        'Admin user created successfully',
      );
      expect(mockUserRepository.addRole).not.toHaveBeenCalled();
      expect(mockLogger.log).not.toHaveBeenCalledWith(
        'Admin role assigned to admin user',
      );
    });

    it('should handle bcrypt hashing correctly', async () => {
      const mockUser = {
        id: '1',
        email: 'admin@example.com',
        firstName: 'Admin',
        lastName: 'User',
        isActive: true,
        isEmailVerified: true,
      };

      mockUserRepository.findByEmail.mockResolvedValue(undefined);
      mockUserRepository.create.mockResolvedValue(mockUser as any);
      mockRoleRepository.findByName.mockResolvedValue(undefined);

      await (authInitService as any).createAdminUser();

      expect(bcrypt.hash).toHaveBeenCalledWith('admin123', 12);
      expect(mockUserRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          password: 'hashedPassword123',
        }),
      );
    });

    it('should handle user creation error', async () => {
      const error = new Error('User creation failed');
      mockUserRepository.findByEmail.mockResolvedValue(undefined);
      mockUserRepository.create.mockRejectedValue(error);

      await expect((authInitService as any).createAdminUser()).rejects.toThrow(
        'User creation failed',
      );
    });

    it('should handle role assignment error', async () => {
      const mockUser = {
        id: '1',
        email: 'admin@example.com',
        firstName: 'Admin',
        lastName: 'User',
        isActive: true,
        isEmailVerified: true,
      };

      const mockAdminRole = {
        id: '1',
        name: 'admin',
      };

      const error = new Error('Role assignment failed');
      mockUserRepository.findByEmail.mockResolvedValue(undefined);
      mockUserRepository.create.mockResolvedValue(mockUser as any);
      mockRoleRepository.findByName.mockResolvedValue(mockAdminRole as any);
      mockUserRepository.addRole.mockRejectedValue(error);

      await expect((authInitService as any).createAdminUser()).rejects.toThrow(
        'Role assignment failed',
      );
    });
  });

  describe('integration scenarios', () => {
    it('should handle complete initialization flow', async () => {
      // Reset all mocks
      vi.clearAllMocks();

      // Setup mocks for permissions creation
      mockPermissionRepository.findByName.mockResolvedValue(undefined);
      mockPermissionRepository.create.mockResolvedValue({
        id: '1',
        name: 'users:create',
        description: 'Permission to users create',
        isActive: true,
      } as any);

      // Setup mocks for roles creation
      let roleCallCount = 0;
      // @ts-expect-error - Mocking the implementation
      mockRoleRepository.findByName.mockImplementation((...args) => {
        const roleName = args[0];
        roleCallCount++;
        // First calls for role creation (return undefined), later calls for permission assignment (return role)
        if (roleCallCount <= Object.keys(ROLE_PERMISSIONS).length) {
          return Promise.resolve(undefined);
        }
        return Promise.resolve({
          id: '1',
          name: roleName,
          permissions: [],
        } as any);
      });

      mockRoleRepository.create.mockResolvedValue({
        id: '1',
        name: 'admin',
        description: 'Admin role',
        isActive: true,
        permissions: [],
      } as any);

      // Setup mocks for permission assignment
      let permissionCallCount = 0;
      mockPermissionRepository.findByName.mockImplementation(() => {
        permissionCallCount++;
        // First calls for permission creation (return null), later calls for assignment (return permission)
        if (permissionCallCount <= Object.values(DEFAULT_PERMISSIONS).length) {
          return Promise.resolve(undefined);
        }
        return Promise.resolve({
          id: '1',
          name: 'users:create',
        } as any);
      });

      mockRoleRepository.addPermission.mockResolvedValue({} as any);

      // Setup mocks for user creation
      mockUserRepository.findByEmail.mockResolvedValue(undefined);
      mockUserRepository.create.mockResolvedValue({
        id: '1',
        email: 'admin@example.com',
        firstName: 'Admin',
        lastName: 'User',
        isActive: true,
        isEmailVerified: true,
      } as any);
      mockUserRepository.addRole.mockResolvedValue({} as any);

      await authInitService.onModuleInit();

      // Verify the complete flow
      expect(mockPermissionRepository.create).toHaveBeenCalled();
      expect(mockRoleRepository.create).toHaveBeenCalled();
      expect(mockRoleRepository.addPermission).toHaveBeenCalled();
      expect(mockUserRepository.create).toHaveBeenCalled();
      expect(mockUserRepository.addRole).toHaveBeenCalled();
      expect(mockLogger.log).toHaveBeenCalledWith(
        'Auth Module initialized successfully',
      );
    });

    it('should handle partial initialization when some entities already exist', async () => {
      // Reset all mocks
      vi.clearAllMocks();

      // Some permissions exist, some don't
      let permissionFindCallCount = 0;
      mockPermissionRepository.findByName.mockImplementation(() => {
        permissionFindCallCount++;
        // First 2 calls return existing permissions, rest return null for creation
        if (permissionFindCallCount <= 2) {
          return Promise.resolve({ id: '1', name: 'existing' } as any);
        }
        // For permission assignment phase, return permissions
        if (
          permissionFindCallCount > Object.values(DEFAULT_PERMISSIONS).length
        ) {
          return Promise.resolve({ id: '1', name: 'permission' } as any);
        }
        return Promise.resolve(undefined);
      });
      mockPermissionRepository.create.mockResolvedValue({
        id: '2',
        name: 'new',
      } as any);

      // Role exists but needs permission assignment
      mockRoleRepository.findByName.mockResolvedValue({
        id: '1',
        name: 'admin',
        permissions: [],
      } as any);
      mockRoleRepository.addPermission.mockResolvedValue({} as any);

      // User already exists
      mockUserRepository.findByEmail.mockResolvedValue({
        id: '1',
        email: 'admin@example.com',
      } as any);

      await authInitService.onModuleInit();

      // Should create some permissions but not all
      const expectedCreateCalls = Object.values(DEFAULT_PERMISSIONS).length - 2;
      expect(mockPermissionRepository.create).toHaveBeenCalledTimes(
        expectedCreateCalls,
      );
      // Should not create role but should assign permissions
      expect(mockRoleRepository.create).not.toHaveBeenCalled();
      expect(mockRoleRepository.addPermission).toHaveBeenCalled();
      // Should not create user
      expect(mockUserRepository.create).not.toHaveBeenCalled();
    });
  });
});
