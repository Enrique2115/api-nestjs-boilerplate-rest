import { BadRequestException, Inject, Injectable } from '@nestjs/common';

import { IAuthService, IBcryptService } from '@core/auth/application';
import { IAuthRepository, UserModel, UserStatus } from '@core/auth/domain';

@Injectable()
export class AuthService implements IAuthService {
  constructor(
    @Inject('IAuthRepository')
    private readonly authRepository: IAuthRepository,

    @Inject('IBcryptService')
    private readonly bcryptService: IBcryptService,
  ) {}

  async checkExistUser(id: string): Promise<UserModel | null> {
    return await this.authRepository.findUserById(id);
  }

  createUserEntity(
    username: string,
    email: string,
    password: string,
  ): UserModel {
    return this.authRepository.createEntity(username, email, password);
  }

  async findUserByUsernameOrEmail(
    username: string,
    email: string,
  ): Promise<UserModel> {
    return await this.authRepository.findByUsernameOrEmail(username, email);
  }

  async saveUser(user: UserModel): Promise<UserModel> {
    return await this.authRepository.save(user);
  }

  async validUser(
    username: string,
    password: string,
  ): Promise<UserModel | null> {
    const user = await this.authRepository.findUserByUsername(username);

    const isValid = await this.bcryptService.comparePassword(
      password,
      user.password,
    );

    const isActive = user.status === UserStatus.ACTIVE;

    if (!isActive) throw new BadRequestException('Usuario inactivo');

    if (!user || !isValid) {
      throw new BadRequestException('Usuario o contraseña incorrectos');
    }

    return user;
  }
}
