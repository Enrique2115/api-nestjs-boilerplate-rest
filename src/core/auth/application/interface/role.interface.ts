import { RoleModel, UserModel } from '@core/auth/domain';

export interface IRoleService {
  assingRoles(user: UserModel, roles: RoleModel[]): Promise<void>;
}
