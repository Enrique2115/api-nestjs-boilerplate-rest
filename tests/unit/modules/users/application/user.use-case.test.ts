import * as bcrypt from 'bcryptjs';
import { PaginateQuery } from 'nestjs-paginate';

import { IRoleRepository, Role } from '@/src/modules/roles/domain';
import {
  CreateUserDto,
  UpdateUserDto,
  UserUseCase,
} from '@/src/modules/users/application';
import { IUserRepository, User } from '@/src/modules/users/domain';

import { createMock, Mock } from '@/tests/utils/mock';

// Mock bcrypt
vi.mock('bcryptjs', () => ({
  hash: vi.fn(),
}));

describe('UserUseCase', () => {
  let userUseCase: UserUseCase;
  let userRepository: Mock<IUserRepository>;
  let roleRepository: Mock<IRoleRepository>;
  let mockBcrypt: typeof bcrypt;

  beforeEach(() => {
    userRepository = createMock<IUserRepository>();
    roleRepository = createMock<IRoleRepository>();
    userUseCase = new UserUseCase(userRepository, roleRepository);
    mockBcrypt = bcrypt as any;
  });

  describe('createUser', () => {
    it('should create user successfully', async () => {
      const createUserDto: CreateUserDto = {
        email: 'newuser@example.com',
        password: 'password123',
        firstName: 'New',
        lastName: 'User',
        roleIds: ['role-id-1'],
      };

      const mockUser = {
        id: '1',
        email: 'newuser@example.com',
        firstName: 'New',
        lastName: 'User',
        isActive: true,
        isEmailVerified: false,
      } as User;

      const mockUserWithRoles = {
        ...mockUser,
        roles: [{ id: 'role-id-1', name: 'user' }],
      } as User;

      userRepository.findByEmail.mockResolvedValue(undefined);
      (mockBcrypt.hash as any).mockResolvedValue('hashedpassword');
      userRepository.create.mockResolvedValue(mockUser);
      userRepository.addRole.mockResolvedValue(undefined);
      userRepository.findById.mockResolvedValue(mockUserWithRoles);

      const result = await userUseCase.createUser(createUserDto);

      expect(userRepository.findByEmail).toHaveBeenCalledWith(
        createUserDto.email,
      );
      expect(mockBcrypt.hash).toHaveBeenCalledWith(createUserDto.password, 12);
      expect(userRepository.create).toHaveBeenCalledWith({
        email: createUserDto.email,
        password: 'hashedpassword',
        firstName: createUserDto.firstName,
        lastName: createUserDto.lastName,
        isActive: true,
        isEmailVerified: false,
      });
      expect(userRepository.addRole).toHaveBeenCalledWith(
        mockUser.id,
        'role-id-1',
      );
      expect(result).toEqual(mockUserWithRoles);
    });

    it('should create user without roles', async () => {
      const createUserDto: CreateUserDto = {
        email: 'newuser@example.com',
        password: 'password123',
        firstName: 'New',
        lastName: 'User',
      };

      const mockUser = {
        id: '1',
        email: 'newuser@example.com',
        firstName: 'New',
        lastName: 'User',
        isActive: true,
        isEmailVerified: false,
      } as User;

      userRepository.findByEmail.mockResolvedValue(undefined);
      (mockBcrypt.hash as any).mockResolvedValue('hashedpassword');
      userRepository.create.mockResolvedValue(mockUser);
      userRepository.findById.mockResolvedValue(mockUser);

      const result = await userUseCase.createUser(createUserDto);

      expect(userRepository.addRole).not.toHaveBeenCalled();
      expect(result).toEqual(mockUser);
    });

    it('should throw error when user already exists', async () => {
      const createUserDto: CreateUserDto = {
        email: 'existing@example.com',
        password: 'password123',
        firstName: 'Existing',
        lastName: 'User',
      };

      const existingUser = {
        id: '1',
        email: 'existing@example.com',
      } as User;

      userRepository.findByEmail.mockResolvedValue(existingUser);

      await expect(userUseCase.createUser(createUserDto)).rejects.toThrow(
        'User already exists with this email',
      );
      expect(userRepository.findByEmail).toHaveBeenCalledWith(
        createUserDto.email,
      );
    });
  });

  describe('getUserById', () => {
    it('should return user by id', async () => {
      const userId = 'user-id';
      const mockUser = {
        id: userId,
        email: 'user@example.com',
      } as User;

      userRepository.findById.mockResolvedValue(mockUser);

      const result = await userUseCase.getUserById(userId);

      expect(userRepository.findById).toHaveBeenCalledWith(userId);
      expect(result).toEqual(mockUser);
    });

    it('should return undefined when user not found', async () => {
      const userId = 'nonexistent-id';

      userRepository.findById.mockResolvedValue(undefined);

      const result = await userUseCase.getUserById(userId);

      expect(userRepository.findById).toHaveBeenCalledWith(userId);
      expect(result).toBeUndefined();
    });
  });

  describe('getUserByEmail', () => {
    it('should return user by email', async () => {
      const email = 'user@example.com';
      const mockUser = {
        id: 'user-id',
        email,
      } as User;

      userRepository.findByEmail.mockResolvedValue(mockUser);

      const result = await userUseCase.getUserByEmail(email);

      expect(userRepository.findByEmail).toHaveBeenCalledWith(email);
      expect(result).toEqual(mockUser);
    });
  });

  describe('getAllUsersPaginated', () => {
    it('should return paginated users', async () => {
      const query: PaginateQuery = {
        page: 1,
        limit: 10,
        path: '/users',
      };

      const mockPaginatedResult = {
        data: [{ id: '1', email: 'user@example.com' }],
        meta: { totalItems: 1, currentPage: 1 },
      };

      userRepository.findAllPaginated.mockResolvedValue(
        mockPaginatedResult as any,
      );

      const result = await userUseCase.getAllUsersPaginated(query);

      expect(userRepository.findAllPaginated).toHaveBeenCalledWith(query);
      expect(result).toEqual(mockPaginatedResult);
    });
  });

  describe('updateUser', () => {
    it('should update user successfully', async () => {
      const userId = 'user-id';
      const updateUserDto: UpdateUserDto = {
        firstName: 'Updated',
        lastName: 'Name',
      };

      const mockUser = {
        id: userId,
        email: 'user@example.com',
        firstName: 'Original',
        lastName: 'Name',
      } as User;

      const mockUpdatedUser = {
        ...mockUser,
        firstName: 'Updated',
      } as User;

      userRepository.findById.mockResolvedValue(mockUser);
      userRepository.update.mockResolvedValue(mockUpdatedUser);

      const result = await userUseCase.updateUser(userId, updateUserDto);

      expect(userRepository.findById).toHaveBeenCalledWith(userId);
      expect(userRepository.update).toHaveBeenCalledWith(userId, updateUserDto);
      expect(result).toEqual(mockUpdatedUser);
    });

    it('should throw error when user not found', async () => {
      const userId = 'nonexistent-id';
      const updateUserDto: UpdateUserDto = {
        firstName: 'Updated',
      };

      userRepository.findById.mockResolvedValue(undefined);

      await expect(
        userUseCase.updateUser(userId, updateUserDto),
      ).rejects.toThrow('User not found');
      expect(userRepository.findById).toHaveBeenCalledWith(userId);
    });

    it('should throw error when email is already in use', async () => {
      const userId = 'user-id';
      const updateUserDto: UpdateUserDto = {
        email: 'existing@example.com',
      };

      const mockUser = {
        id: userId,
        email: 'user@example.com',
      } as User;

      const existingUser = {
        id: 'other-id',
        email: 'existing@example.com',
      } as User;

      userRepository.findById.mockResolvedValue(mockUser);
      userRepository.findByEmail.mockResolvedValue(existingUser);

      await expect(
        userUseCase.updateUser(userId, updateUserDto),
      ).rejects.toThrow('Email already in use');
      expect(userRepository.findByEmail).toHaveBeenCalledWith(
        updateUserDto.email,
      );
    });
  });

  describe('deleteUser', () => {
    it('should delete user successfully', async () => {
      const userId = 'user-id';
      const mockUser = {
        id: userId,
        email: 'user@example.com',
      } as User;

      userRepository.findById.mockResolvedValue(mockUser);
      userRepository.delete.mockResolvedValue(undefined);

      await userUseCase.deleteUser(userId);

      expect(userRepository.findById).toHaveBeenCalledWith(userId);
      expect(userRepository.delete).toHaveBeenCalledWith(userId);
    });

    it('should throw error when user not found', async () => {
      const userId = 'nonexistent-id';

      userRepository.findById.mockResolvedValue(undefined);

      await expect(userUseCase.deleteUser(userId)).rejects.toThrow(
        'User not found',
      );
      expect(userRepository.findById).toHaveBeenCalledWith(userId);
    });
  });

  describe('assignRole', () => {
    it('should assign role to user successfully', async () => {
      const userId = 'user-id';
      const roleId = 'role-id';

      const mockUser = {
        id: userId,
        hasRole: vi.fn().mockReturnValue(false),
      } as any;

      const mockRole = {
        id: roleId,
        name: 'admin',
      } as Role;

      userRepository.findById.mockResolvedValue(mockUser);
      roleRepository.findById.mockResolvedValue(mockRole);
      userRepository.addRole.mockResolvedValue(undefined);

      await userUseCase.assignRole(userId, roleId);

      expect(userRepository.findById).toHaveBeenCalledWith(userId);
      expect(roleRepository.findById).toHaveBeenCalledWith(roleId);
      expect(mockUser.hasRole).toHaveBeenCalledWith(mockRole.name);
      expect(userRepository.addRole).toHaveBeenCalledWith(userId, roleId);
    });

    it('should throw error when user not found', async () => {
      const userId = 'nonexistent-id';
      const roleId = 'role-id';

      userRepository.findById.mockResolvedValue(undefined);

      await expect(userUseCase.assignRole(userId, roleId)).rejects.toThrow(
        'User not found',
      );
      expect(userRepository.findById).toHaveBeenCalledWith(userId);
    });

    it('should throw error when role not found', async () => {
      const userId = 'user-id';
      const roleId = 'nonexistent-role-id';

      const mockUser = {
        id: userId,
      } as User;

      userRepository.findById.mockResolvedValue(mockUser);
      roleRepository.findById.mockResolvedValue(undefined);

      await expect(userUseCase.assignRole(userId, roleId)).rejects.toThrow(
        'Role not found',
      );
      expect(roleRepository.findById).toHaveBeenCalledWith(roleId);
    });

    it('should throw error when user already has the role', async () => {
      const userId = 'user-id';
      const roleId = 'role-id';

      const mockUser = {
        id: userId,
        hasRole: vi.fn().mockReturnValue(true),
      } as any;

      const mockRole = {
        id: roleId,
        name: 'admin',
      } as Role;

      userRepository.findById.mockResolvedValue(mockUser);
      roleRepository.findById.mockResolvedValue(mockRole);

      await expect(userUseCase.assignRole(userId, roleId)).rejects.toThrow(
        'User already has this role',
      );
      expect(mockUser.hasRole).toHaveBeenCalledWith(mockRole.name);
    });
  });

  describe('removeRole', () => {
    it('should remove role from user successfully', async () => {
      const userId = 'user-id';
      const roleId = 'role-id';

      const mockUser = {
        id: userId,
        hasRole: vi.fn().mockReturnValue(true),
      } as any;

      const mockRole = {
        id: roleId,
        name: 'admin',
      } as Role;

      userRepository.findById.mockResolvedValue(mockUser);
      roleRepository.findById.mockResolvedValue(mockRole);
      userRepository.removeRole.mockResolvedValue(undefined);

      await userUseCase.removeRole(userId, roleId);

      expect(userRepository.findById).toHaveBeenCalledWith(userId);
      expect(roleRepository.findById).toHaveBeenCalledWith(roleId);
      expect(mockUser.hasRole).toHaveBeenCalledWith(mockRole.name);
      expect(userRepository.removeRole).toHaveBeenCalledWith(userId, roleId);
    });

    it('should throw error when user not found', async () => {
      const userId = 'nonexistent-id';
      const roleId = 'role-id';

      userRepository.findById.mockResolvedValue(undefined);

      await expect(userUseCase.removeRole(userId, roleId)).rejects.toThrow(
        'User not found',
      );
      expect(userRepository.findById).toHaveBeenCalledWith(userId);
    });

    it('should throw error when role not found', async () => {
      const userId = 'user-id';
      const roleId = 'nonexistent-role-id';

      const mockUser = {
        id: userId,
      } as User;

      userRepository.findById.mockResolvedValue(mockUser);
      roleRepository.findById.mockResolvedValue(undefined);

      await expect(userUseCase.removeRole(userId, roleId)).rejects.toThrow(
        'Role not found',
      );
      expect(roleRepository.findById).toHaveBeenCalledWith(roleId);
    });

    it('should throw error when user does not have the role', async () => {
      const userId = 'user-id';
      const roleId = 'role-id';

      const mockUser = {
        id: userId,
        hasRole: vi.fn().mockReturnValue(false),
      } as any;

      const mockRole = {
        id: roleId,
        name: 'admin',
      } as Role;

      userRepository.findById.mockResolvedValue(mockUser);
      roleRepository.findById.mockResolvedValue(mockRole);

      await expect(userUseCase.removeRole(userId, roleId)).rejects.toThrow(
        'User does not have this role',
      );
      expect(mockUser.hasRole).toHaveBeenCalledWith(mockRole.name);
    });
  });

  describe('activateUser', () => {
    it('should activate user successfully', async () => {
      const userId = 'user-id';
      const mockActivatedUser = {
        id: userId,
        isActive: true,
      } as User;

      userRepository.activate.mockResolvedValue(mockActivatedUser);

      const result = await userUseCase.activateUser(userId);

      expect(userRepository.activate).toHaveBeenCalledWith(userId);
      expect(result).toEqual(mockActivatedUser);
    });
  });

  describe('deactivateUser', () => {
    it('should deactivate user successfully', async () => {
      const userId = 'user-id';
      const mockDeactivatedUser = {
        id: userId,
        isActive: false,
      } as User;

      userRepository.deactivate.mockResolvedValue(mockDeactivatedUser);

      const result = await userUseCase.deactivateUser(userId);

      expect(userRepository.deactivate).toHaveBeenCalledWith(userId);
      expect(result).toEqual(mockDeactivatedUser);
    });
  });

  describe('verifyUserEmail', () => {
    it('should verify user email successfully', async () => {
      const userId = 'user-id';
      const mockVerifiedUser = {
        id: userId,
        isEmailVerified: true,
      } as User;

      userRepository.update.mockResolvedValue(mockVerifiedUser);

      const result = await userUseCase.verifyUserEmail(userId);

      expect(userRepository.update).toHaveBeenCalledWith(userId, {
        isEmailVerified: true,
      });
      expect(result).toEqual(mockVerifiedUser);
    });

    it('should return null when user not found', async () => {
      const userId = 'nonexistent-id';

      userRepository.update.mockResolvedValue(undefined);

      const result = await userUseCase.verifyUserEmail(userId);

      expect(userRepository.update).toHaveBeenCalledWith(userId, {
        isEmailVerified: true,
      });

      expect(result).toBeUndefined();
    });
  });

  describe('checkUserPermission', () => {
    it('should return true when user has permission', async () => {
      const userId = 'user-id';
      const permissionName = 'read';

      const mockUser = {
        id: userId,
        isActive: true,
        hasPermission: vi.fn().mockReturnValue(true),
      } as any;

      userRepository.findById.mockResolvedValue(mockUser);

      const result = await userUseCase.checkUserPermission(
        userId,
        permissionName,
      );

      expect(userRepository.findById).toHaveBeenCalledWith(userId);
      expect(mockUser.hasPermission).toHaveBeenCalledWith(permissionName);
      expect(result).toBe(true);
    });

    it('should return false when user does not have permission', async () => {
      const userId = 'user-id';
      const permissionName = 'write';

      const mockUser = {
        id: userId,
        isActive: true,
        hasPermission: vi.fn().mockReturnValue(false),
      } as any;

      userRepository.findById.mockResolvedValue(mockUser);

      const result = await userUseCase.checkUserPermission(
        userId,
        permissionName,
      );

      expect(userRepository.findById).toHaveBeenCalledWith(userId);
      expect(mockUser.hasPermission).toHaveBeenCalledWith(permissionName);
      expect(result).toBe(false);
    });

    it('should return false when user not found', async () => {
      const userId = 'nonexistent-id';
      const permissionName = 'read';

      userRepository.findById.mockResolvedValue(undefined);

      const result = await userUseCase.checkUserPermission(
        userId,
        permissionName,
      );

      expect(userRepository.findById).toHaveBeenCalledWith(userId);
      expect(result).toBe(false);
    });

    it('should return false when user is inactive', async () => {
      const userId = 'user-id';
      const permissionName = 'read';

      const mockUser = {
        id: userId,
        isActive: false,
      } as User;

      userRepository.findById.mockResolvedValue(mockUser);

      const result = await userUseCase.checkUserPermission(
        userId,
        permissionName,
      );

      expect(userRepository.findById).toHaveBeenCalledWith(userId);
      expect(result).toBe(false);
    });
  });

  describe('getUserPermissions', () => {
    it('should return user permissions successfully', async () => {
      const userId = 'user-id';

      const mockUser = {
        id: userId,
        isActive: true,
        roles: [
          {
            permissions: [{ name: 'read' }, { name: 'write' }],
          },
          {
            permissions: [
              { name: 'write' }, // duplicate permission
              { name: 'delete' },
            ],
          },
        ],
      } as any;

      userRepository.findById.mockResolvedValue(mockUser);

      const result = await userUseCase.getUserPermissions(userId);

      expect(userRepository.findById).toHaveBeenCalledWith(userId);
      expect(result).toEqual(['read', 'write', 'delete']);
    });

    it('should return empty array when user not found', async () => {
      const userId = 'nonexistent-id';

      userRepository.findById.mockResolvedValue(undefined);

      const result = await userUseCase.getUserPermissions(userId);

      expect(userRepository.findById).toHaveBeenCalledWith(userId);
      expect(result).toEqual([]);
    });

    it('should return empty array when user is inactive', async () => {
      const userId = 'user-id';

      const mockUser = {
        id: userId,
        isActive: false,
      } as User;

      userRepository.findById.mockResolvedValue(mockUser);

      const result = await userUseCase.getUserPermissions(userId);

      expect(userRepository.findById).toHaveBeenCalledWith(userId);
      expect(result).toEqual([]);
    });

    it('should return empty array when user has no roles', async () => {
      const userId = 'user-id';

      const mockUser = {
        id: userId,
        isActive: true,
        roles: [],
      } as any;

      userRepository.findById.mockResolvedValue(mockUser);

      const result = await userUseCase.getUserPermissions(userId);

      expect(userRepository.findById).toHaveBeenCalledWith(userId);
      expect(result).toEqual([]);
    });
  });
});
