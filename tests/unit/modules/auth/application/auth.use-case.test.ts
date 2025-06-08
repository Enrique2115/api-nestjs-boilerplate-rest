import * as bcrypt from 'bcryptjs';

import {
  AuthUseCase,
  IJwtService,
  LoginDto,
  RegisterDto,
} from '@/src/modules/auth/application';
import { IUserRepository, User } from '@/src/modules/users/domain';

import { createMock, Mock } from '@/tests/utils/mock';

// Mock bcrypt
vi.mock('bcryptjs', () => ({
  compare: vi.fn(),
  hash: vi.fn(),
}));

describe('AuthUseCase', () => {
  let authUseCase: AuthUseCase;
  let userRepository: Mock<IUserRepository>;
  let jwtService: Mock<IJwtService>;
  let mockBcrypt: typeof bcrypt;

  beforeEach(() => {
    userRepository = createMock<IUserRepository>();
    jwtService = createMock<IJwtService>();
    authUseCase = new AuthUseCase(userRepository, jwtService);
    mockBcrypt = bcrypt as any;
  });

  describe('login', () => {
    it('should login user successfully', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockUser = {
        id: '1',
        email: 'test@example.com',
        password: 'hashedpassword',
        isActive: true,
        roles: [
          {
            name: 'user',
            permissions: [{ name: 'read:profile' }],
          },
        ],
      } as User;

      userRepository.findByEmail.mockResolvedValue(mockUser);
      (mockBcrypt.compare as any).mockResolvedValue(true);
      jwtService.sign.mockReturnValue('mock-jwt-token');

      const result = await authUseCase.login(loginDto);

      expect(userRepository.findByEmail).toHaveBeenCalledWith(loginDto.email);
      expect(mockBcrypt.compare).toHaveBeenCalledWith(
        loginDto.password,
        mockUser.password,
      );
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: mockUser.id,
        email: mockUser.email,
        roles: ['user'],
        permissions: ['read:profile'],
      });
      expect(result).toEqual({
        user: mockUser,
        accessToken: 'mock-jwt-token',
      });
    });

    it('should throw error when user not found', async () => {
      const loginDto: LoginDto = {
        email: 'nonexistent@example.com',
        password: 'password123',
      };

      userRepository.findByEmail.mockResolvedValue(undefined);

      await expect(authUseCase.login(loginDto)).rejects.toThrow(
        'Invalid credentials',
      );
      expect(userRepository.findByEmail).toHaveBeenCalledWith(loginDto.email);
    });

    it('should throw error when user is inactive', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockUser = {
        id: '1',
        email: 'test@example.com',
        isActive: false,
      } as User;

      userRepository.findByEmail.mockResolvedValue(mockUser);

      await expect(authUseCase.login(loginDto)).rejects.toThrow(
        'User account is deactivated',
      );
      expect(userRepository.findByEmail).toHaveBeenCalledWith(loginDto.email);
    });

    it('should throw error when password is invalid', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      const mockUser = {
        id: '1',
        email: 'test@example.com',
        password: 'hashedpassword',
        isActive: true,
      } as User;

      userRepository.findByEmail.mockResolvedValue(mockUser);
      (mockBcrypt.compare as any).mockResolvedValue(false);

      await expect(authUseCase.login(loginDto)).rejects.toThrow(
        'Invalid credentials',
      );
      expect(mockBcrypt.compare).toHaveBeenCalledWith(
        loginDto.password,
        mockUser.password,
      );
    });
  });

  describe('register', () => {
    it('should register user successfully', async () => {
      const registerDto: RegisterDto = {
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

      const result = await authUseCase.register(registerDto);

      expect(userRepository.findByEmail).toHaveBeenCalledWith(
        registerDto.email,
      );
      expect(mockBcrypt.hash).toHaveBeenCalledWith(registerDto.password, 12);
      expect(userRepository.create).toHaveBeenCalledWith({
        email: registerDto.email,
        password: 'hashedpassword',
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
        isActive: true,
        isEmailVerified: false,
      });
      expect(result).toEqual(mockUser);
    });

    it('should throw error when user already exists', async () => {
      const registerDto: RegisterDto = {
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

      await expect(authUseCase.register(registerDto)).rejects.toThrow(
        'User already exists with this email',
      );
      expect(userRepository.findByEmail).toHaveBeenCalledWith(
        registerDto.email,
      );
    });
  });

  describe('validateUser', () => {
    it('should return user when valid and active', async () => {
      const userId = 'user-id';
      const mockUser = {
        id: userId,
        isActive: true,
      } as User;

      userRepository.findById.mockResolvedValue(mockUser);

      const result = await authUseCase.validateUser(userId);

      expect(userRepository.findById).toHaveBeenCalledWith(userId);
      expect(result).toEqual(mockUser);
    });

    it('should return null when user not found', async () => {
      const userId = 'nonexistent-id';

      userRepository.findById.mockResolvedValue(undefined);

      const result = await authUseCase.validateUser(userId);

      expect(userRepository.findById).toHaveBeenCalledWith(userId);
      expect(result).toBeUndefined();
    });

    it('should return null when user is inactive', async () => {
      const userId = 'user-id';
      const mockUser = {
        id: userId,
        isActive: false,
      } as User;

      userRepository.findById.mockResolvedValue(mockUser);

      const result = await authUseCase.validateUser(userId);

      expect(userRepository.findById).toHaveBeenCalledWith(userId);
      expect(result).toBeUndefined();
    });
  });

  describe('changePassword', () => {
    it('should change password successfully', async () => {
      const userId = 'user-id';
      const oldPassword = 'oldpassword';
      const newPassword = 'newpassword';

      const mockUser = {
        id: userId,
        password: 'hashedoldpassword',
      } as User;

      userRepository.findById.mockResolvedValue(mockUser);
      (mockBcrypt.compare as any).mockResolvedValue(true);
      (mockBcrypt.hash as any).mockResolvedValue('hashednewpassword');
      userRepository.update.mockResolvedValue(mockUser);

      const result = await authUseCase.changePassword(
        userId,
        oldPassword,
        newPassword,
      );

      expect(userRepository.findById).toHaveBeenCalledWith(userId);
      expect(mockBcrypt.compare).toHaveBeenCalledWith(
        oldPassword,
        mockUser.password,
      );
      expect(mockBcrypt.hash).toHaveBeenCalledWith(newPassword, 12);
      expect(userRepository.update).toHaveBeenCalledWith(userId, {
        password: 'hashednewpassword',
      });
      expect(result).toBe(true);
    });

    it('should throw error when user not found', async () => {
      const userId = 'nonexistent-id';
      const oldPassword = 'oldpassword';
      const newPassword = 'newpassword';

      userRepository.findById.mockResolvedValue(undefined);

      await expect(
        authUseCase.changePassword(userId, oldPassword, newPassword),
      ).rejects.toThrow('User not found');
      expect(userRepository.findById).toHaveBeenCalledWith(userId);
    });

    it('should throw error when old password is invalid', async () => {
      const userId = 'user-id';
      const oldPassword = 'wrongpassword';
      const newPassword = 'newpassword';

      const mockUser = {
        id: userId,
        password: 'hashedoldpassword',
      } as User;

      userRepository.findById.mockResolvedValue(mockUser);
      (mockBcrypt.compare as any).mockResolvedValue(false);

      await expect(
        authUseCase.changePassword(userId, oldPassword, newPassword),
      ).rejects.toThrow('Invalid old password');
      expect(mockBcrypt.compare).toHaveBeenCalledWith(
        oldPassword,
        mockUser.password,
      );
    });
  });
});
