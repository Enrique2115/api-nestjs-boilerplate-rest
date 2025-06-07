import * as bcrypt from 'bcryptjs';
import { Paginated, PaginateQuery } from 'nestjs-paginate';

import { IRoleRepository } from '@/modules/roles/domain';
import { CreateUserDto, UpdateUserDto } from '@/modules/users/application';
import { IUserRepository, User } from '@/modules/users/domain';

export class UserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly roleRepository: IRoleRepository,
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const { email, password, firstName, lastName, roleIds } = createUserDto;

    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new Error('User already exists with this email');
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await this.userRepository.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      isActive: true,
      isEmailVerified: false,
    });

    // Assign roles if provided
    if (roleIds && roleIds.length > 0) {
      for (const roleId of roleIds) {
        await this.userRepository.addRole(user.id, roleId);
      }
    }

    return (await this.userRepository.findById(user.id)) || user;
  }

  async getUserById(id: string): Promise<User | null> {
    return await this.userRepository.findById(id);
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findByEmail(email);
  }

  async getAllUsersPaginated(query: PaginateQuery): Promise<Paginated<User>> {
    return await this.userRepository.findAllPaginated(query);
  }

  async updateUser(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<User | null> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new Error('User not found');
    }

    // Check if email is being updated and if it's already taken
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.userRepository.findByEmail(
        updateUserDto.email,
      );
      if (existingUser) {
        throw new Error('Email already in use');
      }
    }

    return await this.userRepository.update(id, updateUserDto);
  }

  async deleteUser(id: string): Promise<void> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new Error('User not found');
    }

    await this.userRepository.delete(id);
    // return await this.userRepository.delete(id);
  }

  async assignRole(userId: string, roleId: string): Promise<void> {
    // async assignRole(userId: string, roleId: string): Promise<User | null> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const role = await this.roleRepository.findById(roleId);
    if (!role) {
      throw new Error('Role not found');
    }

    // Check if user already has this role
    if (user.hasRole(role.name)) {
      throw new Error('User already has this role');
    }

    await this.userRepository.addRole(userId, roleId);
    // return await this.userRepository.addRole(userId, roleId);
  }

  async removeRole(userId: string, roleId: string): Promise<void> {
    // async removeRole(userId: string, roleId: string): Promise<User | null> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const role = await this.roleRepository.findById(roleId);
    if (!role) {
      throw new Error('Role not found');
    }

    // Check if user has this role
    if (!user.hasRole(role.name)) {
      throw new Error('User does not have this role');
    }

    await this.userRepository.removeRole(userId, roleId);
    // return await this.userRepository.removeRole(userId, roleId);
  }

  async activateUser(id: string): Promise<User> {
    return await this.userRepository.activate(id);
  }

  async deactivateUser(id: string): Promise<User> {
    return await this.userRepository.deactivate(id);
  }

  async verifyUserEmail(id: string): Promise<User | null> {
    return await this.userRepository.update(id, { isEmailVerified: true });
  }

  async checkUserPermission(
    userId: string,
    permissionName: string,
  ): Promise<boolean> {
    const user = await this.userRepository.findById(userId);
    if (!user || !user.isActive) {
      return false;
    }

    // Check if user has the permission through any of their roles
    return user.hasPermission(permissionName);
  }

  async getUserPermissions(userId: string): Promise<string[]> {
    const user = await this.userRepository.findById(userId);
    if (!user || !user.isActive) {
      return [];
    }

    const permissions = new Set<string>();
    for (const role of user.roles) {
      for (const permission of role.permissions) {
        permissions.add(permission.name);
      }
    }

    return [...permissions];
  }
}
