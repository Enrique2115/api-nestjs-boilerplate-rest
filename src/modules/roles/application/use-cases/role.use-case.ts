import { Paginated, PaginateQuery } from 'nestjs-paginate';

import { IPermissionRepository } from '@/modules/permission/domain';
import { CreateRoleDto, UpdateRoleDto } from '@/modules/roles/application';
import { IRoleRepository, Role } from '@/modules/roles/domain';

export class RoleUseCase {
  constructor(
    private readonly roleRepository: IRoleRepository,
    private readonly permissionRepository: IPermissionRepository,
  ) {}

  async createRole(createRoleDto: CreateRoleDto): Promise<Role> {
    const { name, description, permissionIds } = createRoleDto;

    const existingRole = await this.roleRepository.findByName(name);
    if (existingRole) {
      throw new Error('Role already exists with this name');
    }

    const role = await this.roleRepository.create({
      name,
      description,
      isActive: true,
    });

    // Assign permissions if provided
    if (permissionIds && permissionIds.length > 0) {
      for (const permissionId of permissionIds) {
        const permission =
          await this.permissionRepository.findById(permissionId);
        if (permission) {
          await this.roleRepository.addPermission(role.id, permissionId);
        }
      }
    }

    return (await this.roleRepository.findById(role.id)) || role;
  }

  async getRoleById(id: string): Promise<Role | null> {
    return await this.roleRepository.findById(id);
  }

  async getRoleByName(name: string): Promise<Role | null> {
    return await this.roleRepository.findByName(name);
  }

  async getAllRolesPaginated(query: PaginateQuery): Promise<Paginated<Role>> {
    return await this.roleRepository.findAllPaginated(query);
  }

  async updateRole(
    id: string,
    updateRoleDto: UpdateRoleDto,
  ): Promise<Role | null> {
    const role = await this.roleRepository.findById(id);
    if (!role) {
      throw new Error('Role not found');
    }

    // Check if name is being updated and if it's already taken
    if (updateRoleDto.name && updateRoleDto.name !== role.name) {
      const existingRole = await this.roleRepository.findByName(
        updateRoleDto.name,
      );
      if (existingRole) {
        throw new Error('Role name already in use');
      }
    }

    return await this.roleRepository.update(id, updateRoleDto);
  }

  async deleteRole(id: string): Promise<boolean> {
    const role = await this.roleRepository.findById(id);
    if (!role) {
      throw new Error('Role not found');
    }

    return await this.roleRepository.delete(id);
  }

  async assignPermission(
    roleId: string,
    permissionId: string,
  ): Promise<Role | null> {
    const role = await this.roleRepository.findById(roleId);
    if (!role) {
      throw new Error('Role not found');
    }

    const permission = await this.permissionRepository.findById(permissionId);
    if (!permission) {
      throw new Error('Permission not found');
    }

    // Check if role already has this permission
    if (role.hasPermission(permission.name)) {
      throw new Error('Role already has this permission');
    }

    return await this.roleRepository.addPermission(roleId, permissionId);
  }

  async removePermission(
    roleId: string,
    permissionId: string,
  ): Promise<Role | null> {
    const role = await this.roleRepository.findById(roleId);
    if (!role) {
      throw new Error('Role not found');
    }

    const permission = await this.permissionRepository.findById(permissionId);
    if (!permission) {
      throw new Error('Permission not found');
    }

    // Check if role has this permission
    if (!role.hasPermission(permission.name)) {
      throw new Error('Role does not have this permission');
    }

    return await this.roleRepository.removePermission(roleId, permissionId);
  }

  async activateRole(id: string): Promise<Role | null> {
    return await this.roleRepository.update(id, { isActive: true });
  }

  async deactivateRole(id: string): Promise<Role | null> {
    return await this.roleRepository.update(id, { isActive: false });
  }

  async getRolePermissions(roleId: string): Promise<string[]> {
    const role = await this.roleRepository.findById(roleId);
    if (!role || !role.isActive) {
      return [];
    }

    return role.permissions.map(permission => permission.name);
  }
}
