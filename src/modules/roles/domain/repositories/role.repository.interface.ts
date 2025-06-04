import { Role } from '@modules/roles/domain';

export interface IRoleRepository {
  findById(id: string): Promise<Role | null>;
  findByName(name: string): Promise<Role | null>;
  findAll(): Promise<Role[]>;
  create(role: Partial<Role>): Promise<Role>;
  update(id: string, roleData: Partial<Role>): Promise<Role | null>;
  delete(id: string): Promise<boolean>;
  addPermission(roleId: string, permissionId: string): Promise<Role | null>;
  removePermission(roleId: string, permissionId: string): Promise<Role | null>;
}
