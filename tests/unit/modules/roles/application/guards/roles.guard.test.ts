import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { vi } from 'vitest';

import { ROLES_KEY } from '@/modules/roles/application';
import { RolesGuard } from '@/modules/roles/application/guards';

import { createMock, Mock } from '@/tests/utils/mock';

describe('RolesGuard', () => {
  let rolesGuard: RolesGuard;
  let mockReflector: Mock<Reflector>;
  let mockExecutionContext: Mock<ExecutionContext>;
  let mockHttpContext: any;
  let mockRequest: any;

  beforeEach(() => {
    mockReflector = createMock<Reflector>();
    rolesGuard = new RolesGuard(mockReflector);

    // Setup mock request
    mockRequest = {
      user: undefined,
    };

    // Setup mock HTTP context
    mockHttpContext = {
      getRequest: vi.fn().mockReturnValue(mockRequest),
    };

    // Setup mock execution context
    mockExecutionContext = createMock<ExecutionContext>();
    mockExecutionContext.switchToHttp.mockReturnValue(mockHttpContext);
    mockExecutionContext.getHandler.mockReturnValue(vi.fn());
    mockExecutionContext.getClass.mockReturnValue(vi.fn());
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('canActivate', () => {
    it('should return true when no roles are required', () => {
      // No roles required (reflector returns null/undefined)
      mockReflector.getAllAndOverride.mockReturnValue(undefined);

      const result = rolesGuard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
      expect(mockReflector.getAllAndOverride).toHaveBeenCalledWith(ROLES_KEY, [
        mockExecutionContext.getHandler(),
        mockExecutionContext.getClass(),
      ]);
    });

    it('should return false when required roles array is empty but user has no roles', () => {
      // Empty roles array
      mockReflector.getAllAndOverride.mockReturnValue([]);
      mockRequest.user = {
        id: '1',
        email: 'test@example.com',
        // No roles property
      };

      const result = rolesGuard.canActivate(mockExecutionContext);

      expect(result).toBe(false);
    });

    it('should return false when required roles array is empty even if user has roles', () => {
      // Empty roles array - some([]) always returns false
      mockReflector.getAllAndOverride.mockReturnValue([]);
      mockRequest.user = {
        id: '1',
        email: 'test@example.com',
        roles: ['user'],
      };

      const result = rolesGuard.canActivate(mockExecutionContext);

      expect(result).toBe(false); // some([]) always returns false
    });

    it('should return false when user is not present in request', () => {
      mockReflector.getAllAndOverride.mockReturnValue(['admin']);
      mockRequest.user = undefined;

      const result = rolesGuard.canActivate(mockExecutionContext);

      expect(result).toBe(false);
    });

    it('should return false when user exists but has no roles property', () => {
      mockReflector.getAllAndOverride.mockReturnValue(['admin']);
      mockRequest.user = {
        id: '1',
        email: 'test@example.com',
        // No roles property
      };

      const result = rolesGuard.canActivate(mockExecutionContext);

      expect(result).toBe(false);
    });

    it('should return false when user has null roles', () => {
      mockReflector.getAllAndOverride.mockReturnValue(['admin']);
      mockRequest.user = {
        id: '1',
        email: 'test@example.com',
        roles: undefined,
      };

      const result = rolesGuard.canActivate(mockExecutionContext);

      expect(result).toBe(false);
    });

    it('should return false when user has empty roles array', () => {
      mockReflector.getAllAndOverride.mockReturnValue(['admin']);
      mockRequest.user = {
        id: '1',
        email: 'test@example.com',
        roles: [],
      };

      const result = rolesGuard.canActivate(mockExecutionContext);

      expect(result).toBe(false);
    });

    it('should return false when user roles do not match required roles', () => {
      mockReflector.getAllAndOverride.mockReturnValue(['admin']);
      mockRequest.user = {
        id: '1',
        email: 'test@example.com',
        roles: ['user', 'moderator'],
      };

      const result = rolesGuard.canActivate(mockExecutionContext);

      expect(result).toBe(false);
    });

    it('should return true when user has one of the required roles', () => {
      mockReflector.getAllAndOverride.mockReturnValue(['admin', 'moderator']);
      mockRequest.user = {
        id: '1',
        email: 'test@example.com',
        roles: ['user', 'moderator'],
      };

      const result = rolesGuard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
    });

    it('should return true when user has all required roles', () => {
      mockReflector.getAllAndOverride.mockReturnValue(['admin']);
      mockRequest.user = {
        id: '1',
        email: 'test@example.com',
        roles: ['admin', 'user'],
      };

      const result = rolesGuard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
    });

    it('should return true when user has exact required role', () => {
      mockReflector.getAllAndOverride.mockReturnValue(['admin']);
      mockRequest.user = {
        id: '1',
        email: 'test@example.com',
        roles: ['admin'],
      };

      const result = rolesGuard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
    });

    it('should handle multiple required roles correctly', () => {
      mockReflector.getAllAndOverride.mockReturnValue([
        'admin',
        'superuser',
        'moderator',
      ]);
      mockRequest.user = {
        id: '1',
        email: 'test@example.com',
        roles: ['user', 'superuser'],
      };

      const result = rolesGuard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
    });

    it('should be case sensitive for role matching', () => {
      mockReflector.getAllAndOverride.mockReturnValue(['Admin']);
      mockRequest.user = {
        id: '1',
        email: 'test@example.com',
        roles: ['admin'], // lowercase
      };

      const result = rolesGuard.canActivate(mockExecutionContext);

      expect(result).toBe(false);
    });

    it('should work with single required role as string array', () => {
      mockReflector.getAllAndOverride.mockReturnValue(['user']);
      mockRequest.user = {
        id: '1',
        email: 'test@example.com',
        roles: ['user'],
      };

      const result = rolesGuard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
    });

    it('should call reflector with correct parameters', () => {
      const mockHandler = vi.fn();
      const mockClass = vi.fn();
      mockExecutionContext.getHandler.mockReturnValue(mockHandler);
      mockExecutionContext.getClass.mockReturnValue(mockClass);
      mockReflector.getAllAndOverride.mockReturnValue(['admin']);
      mockRequest.user = {
        id: '1',
        email: 'test@example.com',
        roles: ['admin'],
      };

      rolesGuard.canActivate(mockExecutionContext);

      expect(mockReflector.getAllAndOverride).toHaveBeenCalledWith(ROLES_KEY, [
        mockHandler,
        mockClass,
      ]);
      expect(mockExecutionContext.getHandler).toHaveBeenCalled();
      expect(mockExecutionContext.getClass).toHaveBeenCalled();
      expect(mockExecutionContext.switchToHttp).toHaveBeenCalled();
      expect(mockHttpContext.getRequest).toHaveBeenCalled();
    });

    it('should handle undefined user roles gracefully', () => {
      mockReflector.getAllAndOverride.mockReturnValue(['admin']);
      mockRequest.user = {
        id: '1',
        email: 'test@example.com',
        roles: undefined,
      };

      const result = rolesGuard.canActivate(mockExecutionContext);

      expect(result).toBe(false);
    });

    it('should work with complex user object structure', () => {
      mockReflector.getAllAndOverride.mockReturnValue(['admin']);
      mockRequest.user = {
        id: '1',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        isActive: true,
        roles: ['admin'],
        permissions: ['read', 'write'],
      };

      const result = rolesGuard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
    });
  });

  describe('constructor', () => {
    it('should create instance with reflector dependency', () => {
      const guard = new RolesGuard(mockReflector);

      expect(guard).toBeInstanceOf(RolesGuard);
      expect(guard['reflector']).toBe(mockReflector);
    });
  });

  describe('integration scenarios', () => {
    it('should handle real-world admin access scenario', () => {
      // Simulate @Roles('admin') decorator
      mockReflector.getAllAndOverride.mockReturnValue(['admin']);

      // Simulate authenticated admin user
      mockRequest.user = {
        id: 'admin-123',
        email: 'admin@example.com',
        firstName: 'Admin',
        lastName: 'User',
        roles: ['admin'],
        isActive: true,
      };

      const result = rolesGuard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
    });

    it('should handle real-world multi-role access scenario', () => {
      // Simulate @Roles('admin', 'moderator') decorator
      mockReflector.getAllAndOverride.mockReturnValue(['admin', 'moderator']);

      // Simulate authenticated moderator user
      mockRequest.user = {
        id: 'mod-456',
        email: 'moderator@example.com',
        firstName: 'Moderator',
        lastName: 'User',
        roles: ['moderator', 'user'],
        isActive: true,
      };

      const result = rolesGuard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
    });

    it('should handle real-world unauthorized access scenario', () => {
      // Simulate @Roles('admin') decorator
      mockReflector.getAllAndOverride.mockReturnValue(['admin']);

      // Simulate authenticated regular user
      mockRequest.user = {
        id: 'user-789',
        email: 'user@example.com',
        firstName: 'Regular',
        lastName: 'User',
        roles: ['user'],
        isActive: true,
      };

      const result = rolesGuard.canActivate(mockExecutionContext);

      expect(result).toBe(false);
    });

    it('should handle public endpoint scenario (no roles required)', () => {
      // No @Roles decorator applied
      mockReflector.getAllAndOverride.mockReturnValue(undefined);

      // Any user or even no user should be allowed
      mockRequest.user = undefined;

      const result = rolesGuard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
    });

    it('should handle unauthenticated user trying to access protected endpoint', () => {
      // Simulate @Roles('user') decorator
      mockReflector.getAllAndOverride.mockReturnValue(['user']);

      // No user in request (unauthenticated)
      mockRequest.user = undefined;

      const result = rolesGuard.canActivate(mockExecutionContext);

      expect(result).toBe(false);
    });
  });
});
