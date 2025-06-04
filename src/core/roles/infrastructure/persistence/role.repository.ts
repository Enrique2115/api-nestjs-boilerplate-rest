import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Permission } from '@core/permission/domain';
import { IRoleRepository, Role } from '@core/roles/domain';

@Injectable()
export class RoleRepository implements IRoleRepository {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
  ) {}

  async findById(id: string): Promise<Role | null> {
    const role = await this.roleRepository.findOne({
      where: { id },
      relations: ['permissions'],
    });
    return role || undefined;
  }

  async findByName(name: string): Promise<Role | null> {
    const role = await this.roleRepository.findOne({
      where: { name },
      relations: ['permissions'],
    });
    return role || undefined;
  }

  async findAll(): Promise<Role[]> {
    return await this.roleRepository.find({
      relations: ['permissions'],
    });
  }

  async create(roleData: Partial<Role>): Promise<Role> {
    const role = this.roleRepository.create(roleData);
    return await this.roleRepository.save(role);
  }

  async update(id: string, roleData: Partial<Role>): Promise<Role | null> {
    await this.roleRepository.update(id, roleData);
    return await this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.roleRepository.delete(id);
    return result.affected !== undefined && result.affected > 0;
  }

  async addPermission(
    roleId: string,
    permissionId: string,
  ): Promise<Role | null> {
    const role = await this.roleRepository.findOne({
      where: { id: roleId },
      relations: ['permissions'],
    });

    if (!role) {
      return undefined;
    }

    const permission = await this.permissionRepository.findOne({
      where: { id: permissionId },
    });

    if (!permission) {
      return undefined;
    }

    // Check if role already has this permission
    const hasPermission = role.permissions.some(
      existingPermission => existingPermission.id === permissionId,
    );
    if (!hasPermission) {
      role.permissions.push(permission);
      await this.roleRepository.save(role);
    }

    return await this.findById(roleId);
  }

  async removePermission(
    roleId: string,
    permissionId: string,
  ): Promise<Role | null> {
    const role = await this.roleRepository.findOne({
      where: { id: roleId },
      relations: ['permissions'],
    });

    if (!role) {
      return undefined;
    }

    role.permissions = role.permissions.filter(
      permission => permission.id !== permissionId,
    );
    await this.roleRepository.save(role);

    return await this.findById(roleId);
  }
}
