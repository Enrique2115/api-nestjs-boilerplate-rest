import { PaginateQuery } from 'nestjs-paginate';

import {
  AssignRoleDto,
  CreateUserDto,
  UpdateUserDto,
  UserUseCase,
} from '@/src/modules/users/application';
import { User } from '@/src/modules/users/domain';
import { UsersController } from '@/src/modules/users/presentation/controllers/users.controller';

import { createMock, Mock } from '@/tests/utils/mock';

describe('UsersController', () => {
  let controller: UsersController;
  let userUseCase: Mock<UserUseCase>;

  beforeEach(() => {
    userUseCase = createMock<UserUseCase>();
    controller = new UsersController(userUseCase);
  });

  describe('createUser', () => {
    it('should create user successfully', async () => {
      const createUserDto: CreateUserDto = {
        email: 'newuser@example.com',
        password: 'password123',
        firstName: 'New',
        lastName: 'User',
        roleIds: ['role-id'],
      };

      const mockUser = {
        id: '1',
        email: 'newuser@example.com',
        firstName: 'New',
        lastName: 'User',
        isActive: true,
      } as User;

      userUseCase.createUser.mockResolvedValue(mockUser);

      const result = await controller.createUser(createUserDto);

      expect(userUseCase.createUser).toHaveBeenCalledWith(createUserDto);
      expect(result).toEqual({
        message: 'User created successfully',
        data: mockUser,
      });
    });

    it('should throw error when user creation fails', async () => {
      const createUserDto: CreateUserDto = {
        email: 'existing@example.com',
        password: 'password123',
        firstName: 'Existing',
        lastName: 'User',
      };

      userUseCase.createUser.mockRejectedValue(
        new Error('User already exists with this email'),
      );

      await expect(controller.createUser(createUserDto)).rejects.toThrow(
        'User already exists with this email',
      );
      expect(userUseCase.createUser).toHaveBeenCalledWith(createUserDto);
    });
  });

  describe('getAllUsers', () => {
    it('should return paginated users', async () => {
      const query: PaginateQuery = {
        page: 1,
        limit: 10,
      };

      const mockPaginatedResult = {
        data: [
          {
            id: '1',
            email: 'user1@example.com',
            firstName: 'User',
            lastName: 'One',
          },
        ],
        meta: {
          itemsPerPage: 10,
          totalItems: 1,
          currentPage: 1,
          totalPages: 1,
        },
      };

      userUseCase.getAllUsersPaginated.mockResolvedValue(
        mockPaginatedResult as any,
      );

      const result = await controller.getAllUsers(query);

      expect(userUseCase.getAllUsersPaginated).toHaveBeenCalledWith(query);
      expect(result).toEqual(mockPaginatedResult);
    });
  });

  describe('getCurrentUser', () => {
    it('should return current user profile', async () => {
      const mockUser = {
        id: 'user-id',
        email: 'user@example.com',
        firstName: 'Current',
        lastName: 'User',
      };

      const currentUser = { id: 'user-id' };

      userUseCase.getUserById.mockResolvedValue(mockUser as User);

      const result = await controller.getCurrentUser(currentUser as any);

      expect(userUseCase.getUserById).toHaveBeenCalledWith(currentUser.id);
      expect(result).toEqual({
        message: 'User profile retrieved successfully',
        data: mockUser,
      });
    });

    it('should throw error when user not found', async () => {
      const currentUser = { id: 'nonexistent-id' };

      userUseCase.getUserById.mockRejectedValue(new Error('User not found'));

      await expect(
        controller.getCurrentUser(currentUser as any),
      ).rejects.toThrow('User not found');
      expect(userUseCase.getUserById).toHaveBeenCalledWith(currentUser.id);
    });
  });

  describe('getUserById', () => {
    it('should return user by id', async () => {
      const userId = 'user-id';
      const mockUser = {
        id: userId,
        email: 'user@example.com',
        firstName: 'Test',
        lastName: 'User',
      } as User;

      userUseCase.getUserById.mockResolvedValue(mockUser);

      const result = await controller.getUserById(userId);

      expect(userUseCase.getUserById).toHaveBeenCalledWith(userId);
      expect(result).toEqual({
        message: 'User retrieved successfully',
        data: mockUser,
      });
    });

    it('should throw error when user not found', async () => {
      const userId = 'nonexistent-id';

      userUseCase.getUserById.mockRejectedValue(new Error('User not found'));

      await expect(controller.getUserById(userId)).rejects.toThrow(
        'User not found',
      );
      expect(userUseCase.getUserById).toHaveBeenCalledWith(userId);
    });
  });

  describe('updateUser', () => {
    it('should update user successfully', async () => {
      const userId = 'user-id';
      const updateUserDto: UpdateUserDto = {
        firstName: 'Updated',
        lastName: 'Name',
      };

      const mockUpdatedUser = {
        id: userId,
        email: 'user@example.com',
        firstName: 'Updated',
        lastName: 'Name',
      } as User;

      userUseCase.updateUser.mockResolvedValue(mockUpdatedUser);

      const result = await controller.updateUser(userId, updateUserDto);

      expect(userUseCase.updateUser).toHaveBeenCalledWith(
        userId,
        updateUserDto,
      );
      expect(result).toEqual({
        message: 'User updated successfully',
        data: mockUpdatedUser,
      });
    });

    it('should throw error when user not found', async () => {
      const userId = 'nonexistent-id';
      const updateUserDto: UpdateUserDto = {
        firstName: 'Updated',
      };

      userUseCase.updateUser.mockRejectedValue(new Error('User not found'));

      await expect(
        controller.updateUser(userId, updateUserDto),
      ).rejects.toThrow('User not found');
      expect(userUseCase.updateUser).toHaveBeenCalledWith(
        userId,
        updateUserDto,
      );
    });
  });

  describe('deleteUser', () => {
    it('should delete user successfully', async () => {
      const userId = 'user-id';

      userUseCase.deleteUser.mockResolvedValue(undefined);

      const result = await controller.deleteUser(userId);

      expect(userUseCase.deleteUser).toHaveBeenCalledWith(userId);
      expect(result).toEqual({
        message: 'User deleted successfully',
      });
    });

    it('should throw error when user not found', async () => {
      const userId = 'nonexistent-id';

      userUseCase.deleteUser.mockRejectedValue(new Error('User not found'));

      await expect(controller.deleteUser(userId)).rejects.toThrow(
        'User not found',
      );
      expect(userUseCase.deleteUser).toHaveBeenCalledWith(userId);
    });
  });

  describe('assignRole', () => {
    it('should assign role to user successfully', async () => {
      const userId = 'user-id';
      const assignRoleDto: AssignRoleDto = { roleId: 'role-id' };
      const mockUser = {
        id: userId,
        email: 'test@example.com',
        roles: [{ id: 'role-id', name: 'admin' }],
      };

      userUseCase.assignRole.mockResolvedValue(undefined);
      userUseCase.getUserById.mockResolvedValue(mockUser);

      const result = await controller.assignRole(userId, assignRoleDto);

      expect(userUseCase.assignRole).toHaveBeenCalledWith(
        userId,
        assignRoleDto.roleId,
      );
      expect(userUseCase.getUserById).toHaveBeenCalledWith(userId);
      expect(result).toEqual({
        message: 'Role assigned successfully',
        data: mockUser,
      });
    });

    it('should throw error when user not found', async () => {
      const userId = 'nonexistent-id';
      const assignRoleDto: AssignRoleDto = { roleId: 'role-id' };

      userUseCase.assignRole.mockRejectedValue(new Error('User not found'));

      await expect(
        controller.assignRole(userId, assignRoleDto),
      ).rejects.toThrow('User not found');
      expect(userUseCase.assignRole).toHaveBeenCalledWith(
        userId,
        assignRoleDto.roleId,
      );
    });
  });

  describe('removeRole', () => {
    it('should remove role from user successfully', async () => {
      const userId = 'user-id';
      const roleId = 'role-id';
      const mockUser = {
        id: userId,
        email: 'test@example.com',
        roles: [],
      };

      userUseCase.removeRole.mockResolvedValue(undefined);
      userUseCase.getUserById.mockResolvedValue(mockUser);

      const result = await controller.removeRole(userId, roleId);

      expect(userUseCase.removeRole).toHaveBeenCalledWith(userId, roleId);
      expect(userUseCase.getUserById).toHaveBeenCalledWith(userId);
      expect(result).toEqual({
        message: 'Role removed successfully',
        data: mockUser,
      });
    });

    it('should throw error when user not found', async () => {
      const userId = 'nonexistent-id';
      const roleId = 'role-id';

      userUseCase.removeRole.mockRejectedValue(new Error('User not found'));

      await expect(controller.removeRole(userId, roleId)).rejects.toThrow(
        'User not found',
      );
      expect(userUseCase.removeRole).toHaveBeenCalledWith(userId, roleId);
    });
  });

  describe('activateUser', () => {
    it('should activate user successfully', async () => {
      const userId = 'user-id';
      const mockUser = {
        id: userId,
        isActive: true,
      } as User;

      userUseCase.activateUser.mockResolvedValue(mockUser);

      const result = await controller.activateUser(userId);

      expect(userUseCase.activateUser).toHaveBeenCalledWith(userId);
      expect(result).toEqual({
        message: 'User activated successfully',
        data: mockUser,
      });
    });
  });

  describe('deactivateUser', () => {
    it('should deactivate user successfully', async () => {
      const userId = 'user-id';
      const mockUser = {
        id: userId,
        isActive: false,
      } as User;

      userUseCase.deactivateUser.mockResolvedValue(mockUser);

      const result = await controller.deactivateUser(userId);

      expect(userUseCase.deactivateUser).toHaveBeenCalledWith(userId);
      expect(result).toEqual({
        message: 'User deactivated successfully',
        data: mockUser,
      });
    });
  });
});
