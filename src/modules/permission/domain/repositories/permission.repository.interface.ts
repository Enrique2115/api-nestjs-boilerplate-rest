import { Permission } from '@modules/permission/domain';

export interface IPermissionRepository {
  findById(id: string): Promise<Permission | null>;
  findByName(name: string): Promise<Permission | null>;
  findAll(): Promise<Permission[]>;
  create(permission: Partial<Permission>): Promise<Permission>;
  update(
    id: string,
    permissionData: Partial<Permission>,
  ): Promise<Permission | null>;
  delete(id: string): Promise<boolean>;
}
