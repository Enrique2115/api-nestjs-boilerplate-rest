import { RoleModel } from '@core/auth/domain/models/role.model';

export interface IRoleRepository {
  findOneByName(name: string): Promise<RoleModel>;
}
