import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { IJwtPayload, IJwtService } from '@core/auth/application';

@Injectable()
export class JwtServices implements IJwtService {
  constructor(private readonly jwtService: JwtService) {}
  createToken(payload: IJwtPayload): string {
    return this.jwtService.sign(payload);
  }
  checkToken(token: string): string {
    return JSON.stringify(this.jwtService.verify(token));
  }
}
