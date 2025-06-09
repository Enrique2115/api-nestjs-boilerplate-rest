import { beforeEach, describe, expect, it } from 'vitest';

import { Permission } from '@/modules/permission/domain';
import { Role } from '@/modules/roles/domain';
import { User } from '@/modules/users/domain';

describe('Role Entity', () => {
  let role: Role;
  let permission1: Permission;
  let permission2: Permission;
  let user: User;

  beforeEach(() => {
    role = new Role();
    role.id = '550e8400-e29b-41d4-a716-446655440000';
    role.name = 'admin';
    role.description = 'Administrator role';
    role.isActive = true;
    role.permissions = [];
    role.users = [];
    role.createdAt = new Date('2023-01-01T00:00:00.000Z');
    role.updatedAt = new Date('2023-01-01T00:00:00.000Z');

    permission1 = new Permission();
    permission1.id = '550e8400-e29b-41d4-a716-446655440001';
    permission1.name = 'read_users';
    permission1.description = 'Read users permission';
    permission1.isActive = true;

    permission2 = new Permission();
    permission2.id = '550e8400-e29b-41d4-a716-446655440002';
    permission2.name = 'write_users';
    permission2.description = 'Write users permission';
    permission2.isActive = true;

    user = new User();
    user.id = '550e8400-e29b-41d4-a716-446655440003';
    user.email = 'test@example.com';
    user.firstName = 'John';
    user.lastName = 'Doe';
  });

  describe('Entity Properties', () => {
    it('should have all required properties', () => {
      expect(role.id).toBe('550e8400-e29b-41d4-a716-446655440000');
      expect(role.name).toBe('admin');
      expect(role.description).toBe('Administrator role');
      expect(role.isActive).toBe(true);
      expect(role.permissions).toEqual([]);
      expect(role.users).toEqual([]);
      expect(role.createdAt).toBeInstanceOf(Date);
      expect(role.updatedAt).toBeInstanceOf(Date);
    });

    it('should allow nullable description', () => {
      role.description = undefined;
      expect(role.description).toBeUndefined();
    });

    it('should allow setting isActive property', () => {
      const newRole = new Role();
      newRole.isActive = true;
      expect(newRole.isActive).toBe(true);

      newRole.isActive = false;
      expect(newRole.isActive).toBe(false);
    });
  });

  describe('hasPermission', () => {
    it('should return true when role has the specified permission', () => {
      role.permissions = [permission1, permission2];

      expect(role.hasPermission('read_users')).toBe(true);
      expect(role.hasPermission('write_users')).toBe(true);
    });

    it('should return false when role does not have the specified permission', () => {
      role.permissions = [permission1];

      expect(role.hasPermission('write_users')).toBe(false);
      expect(role.hasPermission('delete_users')).toBe(false);
    });

    it('should return false when role has no permissions', () => {
      role.permissions = [];

      expect(role.hasPermission('read_users')).toBe(false);
    });

    it('should handle case-sensitive permission names', () => {
      role.permissions = [permission1];

      expect(role.hasPermission('READ_USERS')).toBe(false);
      expect(role.hasPermission('read_users')).toBe(true);
    });
  });

  describe('addPermission', () => {
    it('should add a new permission to the role', () => {
      role.permissions = [];

      role.addPermission(permission1);

      expect(role.permissions).toHaveLength(1);
      expect(role.permissions[0]).toBe(permission1);
    });

    it('should not add duplicate permissions', () => {
      role.permissions = [permission1];

      role.addPermission(permission1);

      expect(role.permissions).toHaveLength(1);
      expect(role.permissions[0]).toBe(permission1);
    });

    it('should add multiple different permissions', () => {
      role.permissions = [];

      role.addPermission(permission1);
      role.addPermission(permission2);

      expect(role.permissions).toHaveLength(2);
      expect(role.permissions).toContain(permission1);
      expect(role.permissions).toContain(permission2);
    });

    it('should handle adding permission to existing permissions list', () => {
      role.permissions = [permission1];

      role.addPermission(permission2);

      expect(role.permissions).toHaveLength(2);
      expect(role.permissions).toContain(permission1);
      expect(role.permissions).toContain(permission2);
    });
  });

  describe('removePermission', () => {
    it('should remove permission by id', () => {
      role.permissions = [permission1, permission2];

      role.removePermission(permission1.id);

      expect(role.permissions).toHaveLength(1);
      expect(role.permissions[0]).toBe(permission2);
    });

    it('should handle removing non-existent permission', () => {
      role.permissions = [permission1];

      role.removePermission('non-existent-id');

      expect(role.permissions).toHaveLength(1);
      expect(role.permissions[0]).toBe(permission1);
    });

    it('should handle removing from empty permissions list', () => {
      role.permissions = [];

      role.removePermission(permission1.id);

      expect(role.permissions).toHaveLength(0);
    });

    it('should remove all instances of permission with same id', () => {
      const duplicatePermission = {
        ...permission1,
        activate: vi.fn(),
        deactivate: vi.fn(),
      };
      role.permissions = [permission1, duplicatePermission, permission2];

      role.removePermission(permission1.id);

      expect(role.permissions).toHaveLength(1);
      expect(role.permissions[0]).toBe(permission2);
    });
  });

  describe('activate', () => {
    it('should set isActive to true', () => {
      role.isActive = false;

      role.activate();

      expect(role.isActive).toBe(true);
    });

    it('should keep isActive true if already active', () => {
      role.isActive = true;

      role.activate();

      expect(role.isActive).toBe(true);
    });
  });

  describe('deactivate', () => {
    it('should set isActive to false', () => {
      role.isActive = true;

      role.deactivate();

      expect(role.isActive).toBe(false);
    });

    it('should keep isActive false if already inactive', () => {
      role.isActive = false;

      role.deactivate();

      expect(role.isActive).toBe(false);
    });
  });

  describe('Integration Scenarios', () => {
    it('should handle complete role lifecycle', () => {
      // Create new role
      const newRole = new Role();
      newRole.name = 'moderator';
      newRole.description = 'Moderator role';
      newRole.permissions = [];

      // Add permissions
      newRole.addPermission(permission1);
      newRole.addPermission(permission2);

      expect(newRole.permissions).toHaveLength(2);
      expect(newRole.hasPermission('read_users')).toBe(true);
      expect(newRole.hasPermission('write_users')).toBe(true);

      // Remove one permission
      newRole.removePermission(permission1.id);

      expect(newRole.permissions).toHaveLength(1);
      expect(newRole.hasPermission('read_users')).toBe(false);
      expect(newRole.hasPermission('write_users')).toBe(true);

      // Deactivate role
      newRole.deactivate();

      expect(newRole.isActive).toBe(false);

      // Reactivate role
      newRole.activate();

      expect(newRole.isActive).toBe(true);
    });

    it('should handle role with users relationship', () => {
      role.users = [user];

      expect(role.users).toHaveLength(1);
      expect(role.users[0]).toBe(user);
    });

    it('should handle role state changes with permissions', () => {
      role.permissions = [permission1, permission2];

      // Deactivate role but keep permissions
      role.deactivate();

      expect(role.isActive).toBe(false);
      expect(role.permissions).toHaveLength(2);
      expect(role.hasPermission('read_users')).toBe(true);

      // Reactivate role
      role.activate();

      expect(role.isActive).toBe(true);
      expect(role.hasPermission('read_users')).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined permissions array', () => {
      role.permissions = undefined as any;

      expect(() => role.hasPermission('read_users')).toThrow();
    });

    it('should handle null permission name in hasPermission', () => {
      role.permissions = [permission1];

      expect(role.hasPermission(undefined as any)).toBe(false);
      expect(role.hasPermission(undefined as any)).toBe(false);
    });

    it('should handle empty string permission name', () => {
      role.permissions = [permission1];

      expect(role.hasPermission('')).toBe(false);
    });

    it('should handle permission with undefined name', () => {
      const invalidPermission = new Permission();
      invalidPermission.id = 'test-id';
      invalidPermission.name = undefined as any;

      role.permissions = [invalidPermission];

      expect(role.hasPermission('test')).toBe(false);
    });
  });
});
