import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { IPermissionRepository, Permission } from '@core/permission/domain';

@Injectable()
export class PermissionRepository implements IPermissionRepository {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
  ) {}

  async findById(id: string): Promise<Permission | null> {
    const permission = await this.permissionRepository.findOne({
      where: { id },
    });
    return permission || undefined;
  }

  async findByName(name: string): Promise<Permission | null> {
    const permission = await this.permissionRepository.findOne({
      where: { name },
    });
    return permission || undefined;
  }

  async findAll(): Promise<Permission[]> {
    return await this.permissionRepository.find();
  }

  async create(permissionData: Partial<Permission>): Promise<Permission> {
    const permission = this.permissionRepository.create(permissionData);
    return await this.permissionRepository.save(permission);
  }

  async update(
    id: string,
    permissionData: Partial<Permission>,
  ): Promise<Permission | null> {
    await this.permissionRepository.update(id, permissionData);
    return await this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.permissionRepository.delete(id);
    return result.affected !== undefined && result.affected > 0;
  }
}
