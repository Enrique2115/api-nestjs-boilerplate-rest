import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { PERMISSIONS_KEY } from '@/src/modules/permission/application/decorators/permissions.decorator';
import { PermissionsGuard } from '@/src/modules/permission/application/guards/permissions.guard';

import { createMock, Mock } from '@/tests/utils/mock';

describe('PermissionsGuard', () => {
  let permissionsGuard: PermissionsGuard;
  let mockReflector: Mock<Reflector>;
  let mockExecutionContext: Mock<ExecutionContext>;
  let mockRequest: any;

  beforeEach(() => {
    mockReflector = createMock<Reflector>();
    permissionsGuard = new PermissionsGuard(mockReflector);
    mockExecutionContext = createMock<ExecutionContext>();
    mockRequest = {
      user: undefined,
    };

    mockExecutionContext.switchToHttp.mockReturnValue({
      getRequest: () => mockRequest,
    } as any);
  });

  describe('canActivate', () => {
    it('should return true when no permissions are required', () => {
      mockReflector.getAllAndOverride.mockReturnValue(undefined);

      const result = permissionsGuard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
    });

    it('should return true when no permissions are required (empty array)', () => {
      mockReflector.getAllAndOverride.mockReturnValue([]);

      const mockRequest = {
        user: {
          id: 'user-id',
          permissions: ['read', 'write'],
        },
      };
      mockExecutionContext.switchToHttp.mockReturnValue({
        getRequest: () => mockRequest,
      });

      const result = permissionsGuard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
    });

    it('should return false when user is not present', () => {
      const requiredPermissions = ['read', 'write'];
      mockReflector.getAllAndOverride.mockReturnValue(requiredPermissions);
      mockRequest.user = undefined;

      const result = permissionsGuard.canActivate(mockExecutionContext);

      expect(mockReflector.getAllAndOverride).toHaveBeenCalledWith(
        PERMISSIONS_KEY,
        [mockExecutionContext.getHandler(), mockExecutionContext.getClass()],
      );
      expect(result).toBe(false);
    });

    it('should return false when user has no permissions', () => {
      const requiredPermissions = ['read', 'write'];
      mockReflector.getAllAndOverride.mockReturnValue(requiredPermissions);
      mockRequest.user = {
        id: 'user-id',
        email: 'user@example.com',
        permissions: undefined,
      };

      const result = permissionsGuard.canActivate(mockExecutionContext);

      expect(result).toBe(false);
    });

    it('should return false when user permissions is undefined', () => {
      const requiredPermissions = ['read', 'write'];
      mockReflector.getAllAndOverride.mockReturnValue(requiredPermissions);
      mockRequest.user = {
        id: 'user-id',
        email: 'user@example.com',
        permissions: undefined,
      };

      const result = permissionsGuard.canActivate(mockExecutionContext);

      expect(result).toBe(false);
    });

    it('should return true when user has at least one required permission', () => {
      const requiredPermissions = ['read', 'write'];
      mockReflector.getAllAndOverride.mockReturnValue(requiredPermissions);
      mockRequest.user = {
        id: 'user-id',
        email: 'user@example.com',
        permissions: ['read', 'delete'],
      };

      const result = permissionsGuard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
    });

    it('should return true when user has all required permissions', () => {
      const requiredPermissions = ['read', 'write'];
      mockReflector.getAllAndOverride.mockReturnValue(requiredPermissions);
      mockRequest.user = {
        id: 'user-id',
        email: 'user@example.com',
        permissions: ['read', 'write', 'delete'],
      };

      const result = permissionsGuard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
    });

    it('should return false when user has none of the required permissions', () => {
      const requiredPermissions = ['read', 'write'];
      mockReflector.getAllAndOverride.mockReturnValue(requiredPermissions);
      mockRequest.user = {
        id: 'user-id',
        email: 'user@example.com',
        permissions: ['delete', 'admin'],
      };

      const result = permissionsGuard.canActivate(mockExecutionContext);

      expect(result).toBe(false);
    });

    it('should return true when user has exactly one required permission', () => {
      const requiredPermissions = ['read'];
      mockReflector.getAllAndOverride.mockReturnValue(requiredPermissions);
      mockRequest.user = {
        id: 'user-id',
        email: 'user@example.com',
        permissions: ['read'],
      };

      const result = permissionsGuard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
    });

    it('should return false when user permissions is empty array', () => {
      const requiredPermissions = ['read', 'write'];
      mockReflector.getAllAndOverride.mockReturnValue(requiredPermissions);
      mockRequest.user = {
        id: 'user-id',
        email: 'user@example.com',
        permissions: [],
      };

      const result = permissionsGuard.canActivate(mockExecutionContext);

      expect(result).toBe(false);
    });

    it('should handle case-sensitive permission matching', () => {
      const requiredPermissions = ['Read', 'Write'];
      mockReflector.getAllAndOverride.mockReturnValue(requiredPermissions);
      mockRequest.user = {
        id: 'user-id',
        email: 'user@example.com',
        permissions: ['read', 'write'], // lowercase
      };

      const result = permissionsGuard.canActivate(mockExecutionContext);

      expect(result).toBe(false); // Should be case-sensitive
    });
  });
});
