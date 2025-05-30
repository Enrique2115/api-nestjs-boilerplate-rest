import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { FastifyRequest } from 'fastify';
import { Strategy, StrategyOptionsWithRequest } from 'passport-jwt';

import { AuthService, IJwtPayload } from '@core/auth/application';

import { jwtConfig } from './config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly authService: AuthService) {
    super(jwtConfig() as StrategyOptionsWithRequest);
  }

  async validate(request: FastifyRequest, payload: IJwtPayload) {
    const checkUserExist = await this.authService.checkExistUser(payload._id);
    if (!checkUserExist) throw new UnauthorizedException();

    // if user loggedinto another device/logged out already
    if (checkUserExist.authKey != payload.authKey)
      throw new UnauthorizedException();

    return {
      ...checkUserExist,
    };
  }
}
