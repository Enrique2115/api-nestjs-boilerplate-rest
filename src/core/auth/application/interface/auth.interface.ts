import { User } from '@core/users/domain';

export interface AuthResult {
  user: User;
  accessToken: string;
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  roles: string[];
  permissions: string[];
}
