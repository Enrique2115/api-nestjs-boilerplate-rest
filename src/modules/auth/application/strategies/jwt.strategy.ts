import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { TypedConfigService } from '@/src/core/infra/enviroment/config.service';

import { AuthUseCase, JwtPayload } from '@/modules/auth/application';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly authUseCase: AuthUseCase,
    private readonly typeConfigService: TypedConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: typeConfigService.jwt.SECRET,
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.authUseCase.validateUser(payload.sub);
    if (!user) {
      throw new UnauthorizedException('Invalid token');
    }

    return {
      id: payload.sub,
      email: payload.email,
      roles: payload.roles,
      permissions: payload.permissions,
    };
  }
}
