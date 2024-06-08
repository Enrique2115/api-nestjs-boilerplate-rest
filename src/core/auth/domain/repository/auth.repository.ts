import { UserEntity } from '@core/auth/domain';

import { UserModel } from '../models/user.model';

export interface IAuthRepository {
  createEntity(username: string, email: string, password: string): UserEntity;
  findByUsernameOrEmail(username: string, email: string): Promise<UserModel>;
  findUserById(id: string): Promise<UserModel>;
  findUserByUsername(username: string): Promise<UserModel>;
  save(auth: UserModel): Promise<UserModel>;
}
