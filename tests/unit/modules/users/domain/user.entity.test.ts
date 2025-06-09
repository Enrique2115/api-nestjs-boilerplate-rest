import { beforeEach, describe, expect, it } from 'vitest';

import { Permission } from '@/modules/permission/domain';
import { Role } from '@/modules/roles/domain';
import { User } from '@/modules/users/domain';

describe('User Entity', () => {
  let user: User;
  let adminRole: Role;
  let userRole: Role;
  let readPermission: Permission;
  let writePermission: Permission;

  beforeEach(() => {
    // Create permissions
    readPermission = {
      id: '1',
      name: 'read',
      description: 'Read permission',
      isActive: true,
      roles: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Permission;

    writePermission = {
      id: '2',
      name: 'write',
      description: 'Write permission',
      isActive: true,
      roles: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Permission;

    // Create roles
    adminRole = {
      id: '1',
      name: 'admin',
      description: 'Administrator role',
      isActive: true,
      users: [],
      permissions: [readPermission, writePermission],
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Role;

    userRole = {
      id: '2',
      name: 'user',
      description: 'Regular user role',
      isActive: true,
      users: [],
      permissions: [readPermission],
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Role;

    // Create user
    user = new User();
    user.id = '123e4567-e89b-12d3-a456-426614174000';
    user.email = 'test@example.com';
    user.password = 'hashedPassword123';
    user.firstName = 'John';
    user.lastName = 'Doe';
    user.isActive = true;
    user.isEmailVerified = false;
    user.roles = [];
    user.createdAt = new Date();
    user.updatedAt = new Date();
  });

  describe('Entity Properties', () => {
    it('should have all required properties', () => {
      expect(user.id).toBe('123e4567-e89b-12d3-a456-426614174000');
      expect(user.email).toBe('test@example.com');
      expect(user.password).toBe('hashedPassword123');
      expect(user.firstName).toBe('John');
      expect(user.lastName).toBe('Doe');
      expect(user.isActive).toBe(true);
      expect(user.isEmailVerified).toBe(false);
      expect(user.roles).toEqual([]);
      expect(user.createdAt).toBeInstanceOf(Date);
      expect(user.updatedAt).toBeInstanceOf(Date);
    });

    it('should have default values for boolean properties', () => {
      const newUser = new User();
      expect(newUser.isActive).toBeUndefined(); // Will be set by TypeORM default
      expect(newUser.isEmailVerified).toBeUndefined(); // Will be set by TypeORM default
    });
  });

  describe('hasRole method', () => {
    it('should return true when user has the specified role', () => {
      user.roles = [adminRole, userRole];

      expect(user.hasRole('admin')).toBe(true);
      expect(user.hasRole('user')).toBe(true);
    });

    it('should return false when user does not have the specified role', () => {
      user.roles = [userRole];

      expect(user.hasRole('admin')).toBe(false);
      expect(user.hasRole('moderator')).toBe(false);
    });

    it('should return false when user has no roles', () => {
      user.roles = [];

      expect(user.hasRole('admin')).toBe(false);
      expect(user.hasRole('user')).toBe(false);
    });

    it('should be case sensitive', () => {
      user.roles = [adminRole];

      expect(user.hasRole('Admin')).toBe(false);
      expect(user.hasRole('ADMIN')).toBe(false);
    });

    it('should handle empty string role name', () => {
      user.roles = [adminRole];

      expect(user.hasRole('')).toBe(false);
    });

    it('should handle null/undefined roles array', () => {
      user.roles = undefined as any;

      expect(() => user.hasRole('admin')).toThrow();
    });
  });

  describe('hasPermission method', () => {
    it('should return true when user has role with the specified permission', () => {
      user.roles = [adminRole];

      expect(user.hasPermission('read')).toBe(true);
      expect(user.hasPermission('write')).toBe(true);
    });

    it('should return false when user does not have the specified permission', () => {
      user.roles = [userRole];

      expect(user.hasPermission('write')).toBe(false);
      expect(user.hasPermission('delete')).toBe(false);
    });

    it('should return false when user has no roles', () => {
      user.roles = [];

      expect(user.hasPermission('read')).toBe(false);
      expect(user.hasPermission('write')).toBe(false);
    });

    it('should return true when any role has the permission', () => {
      user.roles = [adminRole, userRole];

      expect(user.hasPermission('read')).toBe(true); // Both roles have this
      expect(user.hasPermission('write')).toBe(true); // Only admin has this
    });

    it('should be case sensitive', () => {
      user.roles = [adminRole];

      expect(user.hasPermission('Read')).toBe(false);
      expect(user.hasPermission('READ')).toBe(false);
    });

    it('should handle empty string permission name', () => {
      user.roles = [adminRole];

      expect(user.hasPermission('')).toBe(false);
    });

    it('should handle roles with no permissions', () => {
      const roleWithoutPermissions = {
        ...adminRole,
        permissions: [],
        hasPermission: vi.fn(),
        addPermission: vi.fn(),
        removePermission: vi.fn(),
        activate: vi.fn(),
        deactivate: vi.fn(),
      };
      user.roles = [roleWithoutPermissions];

      expect(user.hasPermission('read')).toBe(false);
    });

    it('should handle null/undefined roles array', () => {
      user.roles = undefined as any;

      expect(() => user.hasPermission('read')).toThrow();
    });
  });

  describe('getFullName method', () => {
    it('should return concatenated first and last name', () => {
      expect(user.getFullName()).toBe('John Doe');
    });

    it('should handle empty first name', () => {
      user.firstName = '';

      expect(user.getFullName()).toBe(' Doe');
    });

    it('should handle empty last name', () => {
      user.lastName = '';

      expect(user.getFullName()).toBe('John ');
    });

    it('should handle both names empty', () => {
      user.firstName = '';
      user.lastName = '';

      expect(user.getFullName()).toBe(' ');
    });

    it('should handle names with spaces', () => {
      user.firstName = 'John Michael';
      user.lastName = 'Doe Smith';

      expect(user.getFullName()).toBe('John Michael Doe Smith');
    });

    it('should handle special characters in names', () => {
      user.firstName = 'José';
      user.lastName = "O'Connor";

      expect(user.getFullName()).toBe("José O'Connor");
    });
  });

  describe('activate method', () => {
    it('should set isActive to true', () => {
      user.isActive = false;

      user.activate();

      expect(user.isActive).toBe(true);
    });

    it('should keep isActive true if already active', () => {
      user.isActive = true;

      user.activate();

      expect(user.isActive).toBe(true);
    });
  });

  describe('deactivate method', () => {
    it('should set isActive to false', () => {
      user.isActive = true;

      user.deactivate();

      expect(user.isActive).toBe(false);
    });

    it('should keep isActive false if already inactive', () => {
      user.isActive = false;

      user.deactivate();

      expect(user.isActive).toBe(false);
    });
  });

  describe('verifyEmail method', () => {
    it('should set isEmailVerified to true', () => {
      user.isEmailVerified = false;

      user.verifyEmail();

      expect(user.isEmailVerified).toBe(true);
    });

    it('should keep isEmailVerified true if already verified', () => {
      user.isEmailVerified = true;

      user.verifyEmail();

      expect(user.isEmailVerified).toBe(true);
    });
  });

  describe('Integration scenarios', () => {
    it('should handle complex role and permission scenarios', () => {
      const moderatorPermission = {
        id: '3',
        name: 'moderate',
        description: 'Moderate permission',
        isActive: true,
        roles: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Permission;

      const moderatorRole = {
        id: '3',
        name: 'moderator',
        description: 'Moderator role',
        isActive: true,
        users: [],
        permissions: [readPermission, moderatorPermission],
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Role;

      user.roles = [userRole, moderatorRole];

      expect(user.hasRole('user')).toBe(true);
      expect(user.hasRole('moderator')).toBe(true);
      expect(user.hasRole('admin')).toBe(false);

      expect(user.hasPermission('read')).toBe(true);
      expect(user.hasPermission('moderate')).toBe(true);
      expect(user.hasPermission('write')).toBe(false);
    });

    it('should handle user state changes', () => {
      expect(user.isActive).toBe(true);
      expect(user.isEmailVerified).toBe(false);
      expect(user.getFullName()).toBe('John Doe');

      user.deactivate();
      user.verifyEmail();
      user.firstName = 'Jane';

      expect(user.isActive).toBe(false);
      expect(user.isEmailVerified).toBe(true);
      expect(user.getFullName()).toBe('Jane Doe');

      user.activate();
      expect(user.isActive).toBe(true);
    });
  });
});
