import { UnauthorizedException } from '@nestjs/common';

import { TypedConfigService } from '@/src/core/infra/enviroment/config.service';
import { AuthUseCase, JwtPayload } from '@/src/modules/auth/application';
import { JwtStrategy } from '@/src/modules/auth/application/strategies/jwt.strategy';
import { User } from '@/src/modules/users/domain';

import { createMock, Mock } from '@/tests/utils/mock';

describe('JwtStrategy', () => {
  let jwtStrategy: JwtStrategy;
  let authUseCase: Mock<AuthUseCase>;
  let typeConfigService: Mock<TypedConfigService>;

  beforeEach(() => {
    authUseCase = createMock<AuthUseCase>();
    typeConfigService = createMock<TypedConfigService>();
    typeConfigService.jwt.SECRET = 'test-secret';
    jwtStrategy = new JwtStrategy(authUseCase, typeConfigService);
  });

  describe('validate', () => {
    it('should validate and return user data', async () => {
      const payload: JwtPayload = {
        sub: 'user-id',
        email: 'test@example.com',
        roles: ['user'],
        permissions: ['read:profile'],
      };

      const mockUser = {
        id: 'user-id',
        email: 'test@example.com',
        isActive: true,
      } as User;

      authUseCase.validateUser.mockResolvedValue(mockUser);

      const result = await jwtStrategy.validate(payload);

      expect(authUseCase.validateUser).toHaveBeenCalledWith(payload.sub);
      expect(result).toEqual({
        id: payload.sub,
        email: payload.email,
        roles: payload.roles,
        permissions: payload.permissions,
      });
    });

    it('should throw UnauthorizedException when user is not found', async () => {
      const payload: JwtPayload = {
        sub: 'invalid-user-id',
        email: 'test@example.com',
        roles: ['user'],
        permissions: ['read:profile'],
      };

      authUseCase.validateUser.mockResolvedValue(undefined);

      await expect(jwtStrategy.validate(payload)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(jwtStrategy.validate(payload)).rejects.toThrow(
        'Invalid token',
      );
      expect(authUseCase.validateUser).toHaveBeenCalledWith(payload.sub);
    });

    it('should throw UnauthorizedException when user is undefined', async () => {
      const payload: JwtPayload = {
        sub: 'inactive-user-id',
        email: 'test@example.com',
        roles: ['user'],
        permissions: ['read:profile'],
      };

      authUseCase.validateUser.mockResolvedValue(undefined as any);

      await expect(jwtStrategy.validate(payload)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(jwtStrategy.validate(payload)).rejects.toThrow(
        'Invalid token',
      );
      expect(authUseCase.validateUser).toHaveBeenCalledWith(payload.sub);
    });
  });
});
