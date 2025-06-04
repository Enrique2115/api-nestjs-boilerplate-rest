import {
  DEFAULT_PERMISSIONS,
  DEFAULT_ROLES,
  ROLE_PERMISSIONS,
} from '@modules/auth/domain';
import { PermissionRepository } from '@modules/permission/infrastructure';
import { RoleRepository } from '@modules/roles/infrastructure';
import { UserRepository } from '@modules/users/infrastructure';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthInitService implements OnModuleInit {
  private readonly logger = new Logger(AuthInitService.name);

  constructor(
    private readonly userRepository: UserRepository,
    private readonly roleRepository: RoleRepository,
    private readonly permissionRepository: PermissionRepository,
  ) {}

  async onModuleInit() {
    this.logger.log('Initializing Auth Module...');
    await this.createDefaultPermissions();
    await this.createDefaultRoles();
    await this.createAdminUser();
    this.logger.log('Auth Module initialized successfully');
  }

  private async createDefaultPermissions() {
    this.logger.log('Creating default permissions...');

    for (const [, value] of Object.entries(DEFAULT_PERMISSIONS)) {
      const existingPermission =
        await this.permissionRepository.findByName(value);

      if (!existingPermission) {
        await this.permissionRepository.create({
          name: value,
          description: `Permission to ${value.replace(':', ' ')}`,
          isActive: true,
        });
        this.logger.log(`Created permission: ${value}`);
      }
    }
  }

  private async createDefaultRoles() {
    this.logger.log('Creating default roles...');

    for (const [roleName, permissions] of Object.entries(ROLE_PERMISSIONS)) {
      let role = await this.roleRepository.findByName(roleName);

      if (!role) {
        role = await this.roleRepository.create({
          name: roleName,
          description: `${roleName.charAt(0).toUpperCase() + roleName.slice(1)} role`,
          isActive: true,
        });
        this.logger.log(`Created role: ${roleName}`);
      }

      // Assign permissions to role
      for (const permissionName of permissions) {
        const permission =
          await this.permissionRepository.findByName(permissionName);

        if (permission) {
          const hasPermission = role.permissions?.some(
            p => p.name === permissionName,
          );

          if (!hasPermission) {
            await this.roleRepository.addPermission(role.id, permission.id);
            this.logger.log(
              `Assigned permission ${permissionName} to role ${roleName}`,
            );
          }
        }
      }
    }
  }

  private async createAdminUser() {
    this.logger.log('Creating admin user...');

    const adminEmail = 'admin@example.com';
    let adminUser = await this.userRepository.findByEmail(adminEmail);

    if (!adminUser) {
      adminUser = await this.userRepository.create({
        email: adminEmail,
        password: await bcrypt.hash('admin123', 12),
        firstName: 'Admin',
        lastName: 'User',
        isActive: true,
        isEmailVerified: true,
      });

      this.logger.log('Admin user created successfully');

      // Assign admin role
      const adminRole = await this.roleRepository.findByName(
        DEFAULT_ROLES.ADMIN,
      );

      if (adminRole) {
        await this.userRepository.addRole(adminUser.id, adminRole.id);
        this.logger.log('Admin role assigned to admin user');
      }
    }
  }
}
