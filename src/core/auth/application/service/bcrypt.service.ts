import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

import { IBcryptService } from '@core/auth/application';

@Injectable()
export class BcryptService implements IBcryptService {
  async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 10);
  }
  async comparePassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }
}
