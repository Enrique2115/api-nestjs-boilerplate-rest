import { UserStatus } from '../enum/status-user';
import { RefreshTokenModel } from './refresh-token.model';
import { RoleModel } from './role.model';

export class UserWithoutPassword {
  id: string;
  username: string;
  email: string;
  authKey: string;
  status: UserStatus;
  roles: RoleModel[];
  refreshTokens: RefreshTokenModel[];
}

export class UserModel extends UserWithoutPassword {
  password: string;
}
