import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { IRoleRepository, RoleEntity } from '@core/auth/domain';

@Injectable()
export class RoleRepository implements IRoleRepository {
  constructor(
    @InjectRepository(RoleEntity)
    private readonly roleRepository: Repository<RoleEntity>,
  ) {}

  findOneByName(name: string): Promise<RoleEntity> {
    return this.roleRepository.findOneBy({ name });
  }
}
