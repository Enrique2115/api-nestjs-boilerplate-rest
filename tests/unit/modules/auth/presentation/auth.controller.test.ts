import {
  AuthUseCase,
  ChangePasswordDto,
  LoginDto,
  RegisterDto,
} from '@/src/modules/auth/application';
import { AuthController } from '@/src/modules/auth/presentation/controllers/auth.controller';

import { createMock, Mock } from '@/tests/utils/mock';

describe('AuthController', () => {
  let controller: AuthController;
  let authUseCase: Mock<AuthUseCase>;

  beforeEach(() => {
    authUseCase = createMock<AuthUseCase>();
    controller = new AuthController(authUseCase);
  });

  describe('login', () => {
    it('should login user successfully', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockResult = {
        user: {
          id: '1',
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
          isActive: true,
          roles: [],
        },
        accessToken: 'mock-jwt-token',
      };

      authUseCase.login.mockResolvedValue(mockResult);

      const result = await controller.login(loginDto);

      expect(authUseCase.login).toHaveBeenCalledWith(loginDto);
      expect(result).toEqual({
        message: 'Login successful',
        data: mockResult,
      });
    });

    it('should throw error when login fails', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      authUseCase.login.mockRejectedValue(new Error('Invalid credentials'));

      await expect(controller.login(loginDto)).rejects.toThrow(
        'Invalid credentials',
      );
      expect(authUseCase.login).toHaveBeenCalledWith(loginDto);
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
      };

      authUseCase.register.mockResolvedValue(mockUser as any);

      const result = await controller.register(registerDto);

      expect(authUseCase.register).toHaveBeenCalledWith(registerDto);
      expect(result).toEqual({
        message: 'User registered successfully',
        data: mockUser,
      });
    });

    it('should throw error when user already exists', async () => {
      const registerDto: RegisterDto = {
        email: 'existing@example.com',
        password: 'password123',
        firstName: 'Existing',
        lastName: 'User',
      };

      authUseCase.register.mockRejectedValue(
        new Error('User already exists with this email'),
      );

      await expect(controller.register(registerDto)).rejects.toThrow(
        'User already exists with this email',
      );
      expect(authUseCase.register).toHaveBeenCalledWith(registerDto);
    });
  });

  describe('changePassword', () => {
    it('should change password successfully', async () => {
      const changePasswordDto: ChangePasswordDto = {
        oldPassword: 'oldpassword',
        newPassword: 'newpassword',
      };

      const mockUser = { id: 'user-id' };

      authUseCase.changePassword.mockResolvedValue(true);

      const result = await controller.changePassword(
        mockUser as any,
        changePasswordDto,
      );

      expect(authUseCase.changePassword).toHaveBeenCalledWith(
        mockUser.id,
        changePasswordDto.oldPassword,
        changePasswordDto.newPassword,
      );
      expect(result).toEqual({
        message: 'Password changed successfully',
      });
    });

    it('should throw error when old password is invalid', async () => {
      const changePasswordDto: ChangePasswordDto = {
        oldPassword: 'wrongpassword',
        newPassword: 'newpassword',
      };

      const mockUser = { id: 'user-id' };

      authUseCase.changePassword.mockRejectedValue(
        new Error('Invalid old password'),
      );

      await expect(
        controller.changePassword(mockUser as any, changePasswordDto),
      ).rejects.toThrow('Invalid old password');
      expect(authUseCase.changePassword).toHaveBeenCalledWith(
        mockUser.id,
        changePasswordDto.oldPassword,
        changePasswordDto.newPassword,
      );
    });
  });
});
