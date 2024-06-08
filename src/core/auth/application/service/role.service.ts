import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import { IRoleService } from '@core/auth/application';
import { IRoleRepository, RoleModel, UserModel } from '@core/auth/domain';

@Injectable()
export class RoleService implements IRoleService {
  constructor(
    @Inject('IRoleRepository')
    private readonly roleRepository: IRoleRepository,
  ) {}

  async assingRoles(user: UserModel, roles: RoleModel[]): Promise<void> {
    if (roles !== null) {
      for (const roleData of roles) {
        const role = await this.roleRepository.findOneByName(roleData.name);

        if (role === null) {
          throw new NotFoundException(`Role ${roleData.name} not found`);
        } else {
          user.roles = [role];
        }
      }
    }
  }
}
