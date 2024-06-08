import { randomUUID } from 'node:crypto';

import { Inject } from '@nestjs/common';

import { IAuthService, IJwtService } from '@core/auth/application';
import { LoginDto, UserModel } from '@core/auth/domain';
import { RedisService } from '@core/redis/redis.service';

export class SignInUseCase {
  constructor(
    @Inject('IAuthService')
    private readonly authService: IAuthService,

    @Inject('IJwtService')
    private readonly jwtService: IJwtService,

    private readonly redisService: RedisService,
  ) {}

  async execute(loginDto: LoginDto): Promise<{
    token: string;
    user: UserModel;
  }> {
    const { username, password } = loginDto;

    const user = await this.authService.validUser(username, password);

    user.authKey = randomUUID();
    await this.authService.saveUser(user);

    const token = this.jwtService.createToken({
      _id: user.id,
      authKey: user.authKey,
      email: user.email,
      role: user.roles.map(role => role.name),
    });

    await this.redisService.set(`user_${user.id}`, {
      _id: user.id,
      authKey: user.authKey,
      email: user.email,
      role: user.roles.map(role => role.name),
    });

    return {
      token,
      user,
    };
  }
}
