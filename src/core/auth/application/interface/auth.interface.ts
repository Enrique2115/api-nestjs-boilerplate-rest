import { UserModel } from '@core/auth/domain';

export interface IAuthService {
  checkExistUser(id: string): Promise<UserModel>;
  createUserEntity(
    username: string,
    email: string,
    password: string,
  ): UserModel;
  findUserByUsernameOrEmail(
    username: string,
    email: string,
  ): Promise<UserModel>;
  saveUser(user: UserModel): Promise<UserModel>;
  validUser(username: string, password: string): Promise<UserModel>;
}
