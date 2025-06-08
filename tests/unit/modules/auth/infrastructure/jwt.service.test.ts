import { JwtService as NestJwtService } from '@nestjs/jwt';

import { JwtPayload } from '@/src/modules/auth/application';
import { JwtService } from '@/src/modules/auth/infrastructure/services/jwt.service';

import { createMock, Mock } from '@/tests/utils/mock';

describe('JwtService', () => {
  let jwtService: JwtService;
  let nestJwtService: Mock<NestJwtService>;

  beforeEach(() => {
    nestJwtService = createMock<NestJwtService>();
    jwtService = new JwtService(nestJwtService);
  });

  describe('sign', () => {
    it('should sign a JWT token', () => {
      const payload: JwtPayload = {
        sub: 'user-id',
        email: 'test@example.com',
        roles: ['user'],
        permissions: ['read:profile'],
      };

      const expectedToken = 'signed-jwt-token';
      nestJwtService.sign.mockReturnValue(expectedToken);

      const result = jwtService.sign(payload);

      expect(nestJwtService.sign).toHaveBeenCalledWith(payload);
      expect(result).toBe(expectedToken);
    });
  });

  describe('verify', () => {
    it('should verify a JWT token', () => {
      const token = 'valid-jwt-token';
      const expectedPayload: JwtPayload = {
        sub: 'user-id',
        email: 'test@example.com',
        roles: ['user'],
        permissions: ['read:profile'],
      };

      nestJwtService.verify.mockReturnValue(expectedPayload);

      const result = jwtService.verify(token);

      expect(nestJwtService.verify).toHaveBeenCalledWith(token);
      expect(result).toEqual(expectedPayload);
    });

    it('should throw error for invalid token', () => {
      const token = 'invalid-jwt-token';
      const error = new Error('Invalid token');

      nestJwtService.verify.mockImplementation(() => {
        throw error;
      });

      expect(() => jwtService.verify(token)).toThrow('Invalid token');
      expect(nestJwtService.verify).toHaveBeenCalledWith(token);
    });
  });

  describe('decode', () => {
    it('should decode a JWT token', () => {
      const token = 'jwt-token';
      const expectedPayload: JwtPayload = {
        sub: 'user-id',
        email: 'test@example.com',
        roles: ['user'],
        permissions: ['read:profile'],
      };

      nestJwtService.decode.mockReturnValue(expectedPayload);

      const result = jwtService.decode(token);

      expect(nestJwtService.decode).toHaveBeenCalledWith(token);
      expect(result).toEqual(expectedPayload);
    });

    it('should return undefined for invalid token', () => {
      const token = 'invalid-jwt-token';

      nestJwtService.decode.mockReturnValue(undefined);

      const result = jwtService.decode(token);

      expect(nestJwtService.decode).toHaveBeenCalledWith(token);
      expect(result).toBeUndefined();
    });
  });
});
