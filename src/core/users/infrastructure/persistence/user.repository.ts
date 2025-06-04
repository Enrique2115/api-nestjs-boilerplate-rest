import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Role } from '@core/roles/domain';
import { IUserRepository, User } from '@core/users/domain';

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  async findById(id: string): Promise<User | null> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['roles', 'roles.permissions'],
    });
    return user || undefined;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.userRepository.findOne({
      where: { email },
      relations: ['roles', 'roles.permissions'],
    });
    return user || undefined;
  }

  async findAll(): Promise<User[]> {
    return await this.userRepository.find({
      relations: ['roles', 'roles.permissions'],
    });
  }

  async create(userData: Partial<User>): Promise<User> {
    const user = this.userRepository.create(userData);
    return await this.userRepository.save(user);
  }

  async update(id: string, userData: Partial<User>): Promise<User> {
    await this.userRepository.update(id, userData);
    const updatedUser = await this.findById(id);
    if (!updatedUser) {
      throw new Error('User not found after update');
    }
    return updatedUser;
  }

  async delete(id: string): Promise<void> {
    const result = await this.userRepository.delete(id);
    if (!result.affected || result.affected === 0) {
      throw new Error('User not found or could not be deleted');
    }
  }

  async addRole(userId: string, roleId: string): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['roles'],
    });

    if (!user) {
      throw new Error('User not found');
    }

    const role = await this.roleRepository.findOne({
      where: { id: roleId },
    });

    if (!role) {
      throw new Error('Role not found');
    }

    // Check if user already has this role
    const hasRole = user.roles.some(existingRole => existingRole.id === roleId);
    if (!hasRole) {
      user.roles.push(role);
      await this.userRepository.save(user);
    }
  }

  async removeRole(userId: string, roleId: string): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['roles'],
    });

    if (!user) {
      throw new Error('User not found');
    }

    user.roles = user.roles.filter(role => role.id !== roleId);
    await this.userRepository.save(user);
  }

  async activate(id: string): Promise<User> {
    return await this.update(id, { isActive: true });
  }

  async deactivate(id: string): Promise<User> {
    return await this.update(id, { isActive: false });
  }
}
