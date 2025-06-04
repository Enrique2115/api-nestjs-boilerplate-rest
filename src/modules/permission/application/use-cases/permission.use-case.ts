import {
  CreatePermissionDto,
  UpdatePermissionDto,
} from '@modules/permission/application';
import { IPermissionRepository, Permission } from '@modules/permission/domain';

export class PermissionUseCase {
  constructor(private readonly permissionRepository: IPermissionRepository) {}

  async createPermission(
    createPermissionDto: CreatePermissionDto,
  ): Promise<Permission> {
    const { name, description } = createPermissionDto;

    const existingPermission = await this.permissionRepository.findByName(name);
    if (existingPermission) {
      throw new Error('Permission already exists with this name');
    }

    return await this.permissionRepository.create({
      name,
      description,
      isActive: true,
    });
  }

  async getPermissionById(id: string): Promise<Permission | null> {
    return await this.permissionRepository.findById(id);
  }

  async getPermissionByName(name: string): Promise<Permission | null> {
    return await this.permissionRepository.findByName(name);
  }

  async getAllPermissions(): Promise<Permission[]> {
    return await this.permissionRepository.findAll();
  }

  async updatePermission(
    id: string,
    updatePermissionDto: UpdatePermissionDto,
  ): Promise<Permission | null> {
    const permission = await this.permissionRepository.findById(id);
    if (!permission) {
      throw new Error('Permission not found');
    }

    // Check if name is being updated and if it's already taken
    if (
      updatePermissionDto.name &&
      updatePermissionDto.name !== permission.name
    ) {
      const existingPermission = await this.permissionRepository.findByName(
        updatePermissionDto.name,
      );
      if (existingPermission) {
        throw new Error('Permission name already in use');
      }
    }

    return await this.permissionRepository.update(id, updatePermissionDto);
  }

  async deletePermission(id: string): Promise<boolean> {
    const permission = await this.permissionRepository.findById(id);
    if (!permission) {
      throw new Error('Permission not found');
    }

    return await this.permissionRepository.delete(id);
  }

  async activatePermission(id: string): Promise<Permission | null> {
    return await this.permissionRepository.update(id, { isActive: true });
  }

  async deactivatePermission(id: string): Promise<Permission | null> {
    return await this.permissionRepository.update(id, { isActive: false });
  }
}
