import { ConflictException, Inject } from '@nestjs/common';

import {
  IAuthService,
  IBcryptService,
  IRoleService,
} from '@core/auth/application';
import { RegisterDto, UserModel } from '@core/auth/domain';

export class SignUpUseCase {
  constructor(
    @Inject('IAuthService')
    private readonly authService: IAuthService,

    @Inject('IRoleService')
    private readonly roleService: IRoleService,

    @Inject('IBcryptService')
    private readonly bcryptService: IBcryptService,
  ) {}

  async execute(registerDto: RegisterDto): Promise<UserModel> {
    const { username, email, password, roles } = registerDto;

    const existingUser = await this.authService.findUserByUsernameOrEmail(
      username,
      email,
    );

    if (existingUser !== null) {
      throw new ConflictException('Usuario o email ya existe');
    }

    const passwordHash = await this.bcryptService.hashPassword(password);

    const userEntity = this.authService.createUserEntity(
      username,
      email,
      passwordHash,
    );

    await this.roleService.assingRoles(userEntity, roles);

    const newUser = await this.authService.saveUser(userEntity);

    return newUser;
  }
}
