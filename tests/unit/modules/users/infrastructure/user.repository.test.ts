import { paginate } from 'nestjs-paginate';
import { Repository } from 'typeorm';

import { Role } from '@/src/modules/roles/domain';
import { User } from '@/src/modules/users/domain';
import { UserRepository } from '@/src/modules/users/infrastructure/persistence/user.repository';

import { createMock, Mock } from '@/tests/utils/mock';

// Mock nestjs-paginate
vi.mock('nestjs-paginate', () => ({
  paginate: vi.fn(),
}));

describe('UserRepository', () => {
  let userRepository: UserRepository;
  let mockUserRepo: Mock<Repository<User>>;
  let mockRoleRepo: Mock<Repository<Role>>;
  let mockPaginate: any;

  beforeEach(() => {
    mockUserRepo = createMock<Repository<User>>();
    mockRoleRepo = createMock<Repository<Role>>();
    userRepository = new UserRepository(mockUserRepo, mockRoleRepo);
    mockPaginate = paginate as any;
  });

  describe('findById', () => {
    it('should return user when found', async () => {
      const userId = 'user-id';
      const mockUser = {
        id: userId,
        email: 'user@example.com',
        roles: [],
      } as User;

      mockUserRepo.findOne.mockResolvedValue(mockUser);

      const result = await userRepository.findById(userId);

      expect(mockUserRepo.findOne).toHaveBeenCalledWith({
        where: { id: userId },
        relations: ['roles', 'roles.permissions'],
      });
      expect(result).toEqual(mockUser);
    });

    it('should return undefined when user not found', async () => {
      const userId = 'nonexistent-id';

      mockUserRepo.findOne.mockResolvedValue(undefined);

      const result = await userRepository.findById(userId);

      expect(mockUserRepo.findOne).toHaveBeenCalledWith({
        where: { id: userId },
        relations: ['roles', 'roles.permissions'],
      });
      expect(result).toBeUndefined();
    });
  });

  describe('findByEmail', () => {
    it('should return user when found', async () => {
      const email = 'user@example.com';
      const mockUser = {
        id: 'user-id',
        email,
        roles: [],
      } as User;

      mockUserRepo.findOne.mockResolvedValue(mockUser);

      const result = await userRepository.findByEmail(email);

      expect(mockUserRepo.findOne).toHaveBeenCalledWith({
        where: { email },
        relations: ['roles', 'roles.permissions'],
      });
      expect(result).toEqual(mockUser);
    });

    it('should return undefined when user not found', async () => {
      const email = 'nonexistent@example.com';

      mockUserRepo.findOne.mockResolvedValue(undefined);

      const result = await userRepository.findByEmail(email);

      expect(result).toBeUndefined();
    });
  });

  describe('findAllPaginated', () => {
    it('should return paginated users', async () => {
      const query = { page: 1, limit: 10 };
      const mockPaginatedResult = {
        data: [{ id: '1', email: 'user@example.com' }],
        meta: { totalItems: 1 },
      };

      mockPaginate.mockResolvedValue(mockPaginatedResult);

      const result = await userRepository.findAllPaginated(query as any);

      expect(mockPaginate).toHaveBeenCalledWith(
        query,
        mockUserRepo,
        expect.any(Object),
      );
      expect(result).toEqual(mockPaginatedResult);
    });
  });

  describe('create', () => {
    it('should create and return user', async () => {
      const userData = {
        email: 'newuser@example.com',
        password: 'hashedpassword',
        firstName: 'New',
        lastName: 'User',
      };

      const mockUser = {
        id: '1',
        ...userData,
      } as User;

      mockUserRepo.create.mockReturnValue(mockUser);
      mockUserRepo.save.mockResolvedValue(mockUser);

      const result = await userRepository.create(userData);

      expect(mockUserRepo.create).toHaveBeenCalledWith(userData);
      expect(mockUserRepo.save).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual(mockUser);
    });
  });

  describe('update', () => {
    it('should update and return user', async () => {
      const userId = 'user-id';
      const updateData = {
        firstName: 'Updated',
        lastName: 'Name',
      };

      const mockUpdatedUser = {
        id: userId,
        email: 'user@example.com',
        firstName: 'Updated',
        lastName: 'Name',
      } as User;

      mockUserRepo.update.mockResolvedValue({ affected: 1 } as any);
      mockUserRepo.findOne.mockResolvedValue(mockUpdatedUser);

      const result = await userRepository.update(userId, updateData);

      expect(mockUserRepo.update).toHaveBeenCalledWith(userId, updateData);
      expect(result).toEqual(mockUpdatedUser);
    });

    it('should throw error when user not found after update', async () => {
      const userId = 'user-id';
      const updateData = { firstName: 'Updated' };

      mockUserRepo.update.mockResolvedValue({ affected: 1 } as any);
      mockUserRepo.findOne.mockResolvedValue(undefined);

      await expect(userRepository.update(userId, updateData)).rejects.toThrow(
        'User not found after update',
      );
    });
  });

  describe('delete', () => {
    it('should delete user successfully', async () => {
      const userId = 'user-id';

      mockUserRepo.delete.mockResolvedValue({ affected: 1 } as any);

      await userRepository.delete(userId);

      expect(mockUserRepo.delete).toHaveBeenCalledWith(userId);
    });

    it('should throw error when user not found or could not be deleted', async () => {
      const userId = 'user-id';

      mockUserRepo.delete.mockResolvedValue({ affected: 0 } as any);

      await expect(userRepository.delete(userId)).rejects.toThrow(
        'User not found or could not be deleted',
      );
    });
  });

  describe('addRole', () => {
    it('should add role to user successfully', async () => {
      const userId = 'user-id';
      const roleId = 'role-id';

      const mockUser = {
        id: userId,
        roles: [],
      } as User;

      const mockRole = {
        id: roleId,
        name: 'admin',
      } as Role;

      mockUserRepo.findOne.mockResolvedValue(mockUser);
      mockRoleRepo.findOne.mockResolvedValue(mockRole);
      mockUserRepo.save.mockResolvedValue(mockUser);

      await userRepository.addRole(userId, roleId);

      expect(mockUserRepo.findOne).toHaveBeenCalledWith({
        where: { id: userId },
        relations: ['roles'],
      });
      expect(mockRoleRepo.findOne).toHaveBeenCalledWith({
        where: { id: roleId },
      });
      expect(mockUser.roles).toContain(mockRole);
      expect(mockUserRepo.save).toHaveBeenCalledWith(mockUser);
    });

    it('should not add role if user already has it', async () => {
      const userId = 'user-id';
      const roleId = 'role-id';

      const mockRole = {
        id: roleId,
        name: 'admin',
      } as Role;

      const mockUser = {
        id: userId,
        roles: [mockRole],
      } as User;

      mockUserRepo.findOne.mockResolvedValue(mockUser);
      mockRoleRepo.findOne.mockResolvedValue(mockRole);

      await userRepository.addRole(userId, roleId);

      expect(mockUserRepo.save).not.toHaveBeenCalled();
    });

    it('should throw error when user not found', async () => {
      const userId = 'nonexistent-id';
      const roleId = 'role-id';

      mockUserRepo.findOne.mockResolvedValue(undefined);

      await expect(userRepository.addRole(userId, roleId)).rejects.toThrow(
        'User not found',
      );
    });

    it('should throw error when role not found', async () => {
      const userId = 'user-id';
      const roleId = 'nonexistent-role-id';

      const mockUser = {
        id: userId,
        roles: [],
      } as User;

      mockUserRepo.findOne.mockResolvedValue(mockUser);
      mockRoleRepo.findOne.mockResolvedValue(undefined);

      await expect(userRepository.addRole(userId, roleId)).rejects.toThrow(
        'Role not found',
      );
    });
  });

  describe('removeRole', () => {
    it('should remove role from user successfully', async () => {
      const userId = 'user-id';
      const roleId = 'role-id';

      const mockRole = {
        id: roleId,
        name: 'admin',
      } as Role;

      const mockUser = {
        id: userId,
        roles: [mockRole],
      } as User;

      mockUserRepo.findOne.mockResolvedValue(mockUser);
      mockUserRepo.save.mockResolvedValue(mockUser);

      await userRepository.removeRole(userId, roleId);

      expect(mockUser.roles).toHaveLength(0);
      expect(mockUserRepo.save).toHaveBeenCalledWith(mockUser);
    });

    it('should throw error when user not found', async () => {
      const userId = 'nonexistent-id';
      const roleId = 'role-id';

      mockUserRepo.findOne.mockResolvedValue(undefined);

      await expect(userRepository.removeRole(userId, roleId)).rejects.toThrow(
        'User not found',
      );
    });
  });

  describe('activate', () => {
    it('should activate user', async () => {
      const userId = 'user-id';
      const mockUser = {
        id: userId,
        isActive: true,
      } as User;

      mockUserRepo.update.mockResolvedValue({ affected: 1 } as any);
      mockUserRepo.findOne.mockResolvedValue(mockUser);

      const result = await userRepository.activate(userId);

      expect(mockUserRepo.update).toHaveBeenCalledWith(userId, {
        isActive: true,
      });
      expect(result).toEqual(mockUser);
    });
  });

  describe('deactivate', () => {
    it('should deactivate user', async () => {
      const userId = 'user-id';
      const mockUser = {
        id: userId,
        isActive: false,
      } as User;

      mockUserRepo.update.mockResolvedValue({ affected: 1 } as any);
      mockUserRepo.findOne.mockResolvedValue(mockUser);

      const result = await userRepository.deactivate(userId);

      expect(mockUserRepo.update).toHaveBeenCalledWith(userId, {
        isActive: false,
      });
      expect(result).toEqual(mockUser);
    });
  });
});
