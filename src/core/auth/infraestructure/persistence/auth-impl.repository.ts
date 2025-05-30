import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { IAuthRepository, UserEntity } from '@core/auth/domain';

@Injectable()
export class AuthRespository implements IAuthRepository {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  createEntity(username: string, email: string, password: string): UserEntity {
    return this.userRepository.create({
      username,
      email,
      password,
    });
  }

  findByUsernameOrEmail(username: string, email: string): Promise<UserEntity> {
    return this.userRepository.findOne({
      where: [{ username }, { email }],
    });
  }

  findUserById(id: string): Promise<UserEntity> {
    return this.userRepository.findOne({
      where: { id },
      relations: ['roles'],
    });
  }

  findUserByUsername(username: string): Promise<UserEntity> {
    return this.userRepository.findOne({
      where: { username },
      relations: ['roles'],
      select: [
        'id',
        'username',
        'email',
        'password',
        'roles',
        'status',
        'createdAt',
      ],
    });
  }

  save(auth: UserEntity): Promise<UserEntity> {
    return this.userRepository.save(auth);
  }
}
