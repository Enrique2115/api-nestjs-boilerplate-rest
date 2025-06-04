import {
  AuthResult,
  IJwtService,
  LoginDto,
  RegisterDto,
} from '@modules/auth/application';
import { IUserRepository, User } from '@modules/users/domain';
import * as bcrypt from 'bcryptjs';

export class AuthUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly jwtService: IJwtService,
  ) {}

  async login(loginDto: LoginDto): Promise<AuthResult> {
    const { email, password } = loginDto;

    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    if (!user.isActive) {
      throw new Error('User account is deactivated');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      roles: user.roles.map(role => role.name),
      permissions: this.getUserPermissions(user),
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      user,
      accessToken,
    };
  }

  async register(registerDto: RegisterDto): Promise<User> {
    const { email, password, firstName, lastName } = registerDto;

    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new Error('User already exists with this email');
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = await this.userRepository.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      isActive: true,
      isEmailVerified: false,
    });

    return newUser;
  }

  async validateUser(userId: string): Promise<User | null> {
    const user = await this.userRepository.findById(userId);

    if (!user || !user.isActive) {
      return undefined;
    }

    return user;
  }

  async changePassword(
    userId: string,
    oldPassword: string,
    newPassword: string,
  ): Promise<boolean> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isOldPasswordValid) {
      throw new Error('Invalid old password');
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 12);
    await this.userRepository.update(userId, { password: hashedNewPassword });

    return true;
  }

  private getUserPermissions(user: User): string[] {
    const permissions = new Set<string>();

    for (const role of user.roles) {
      for (const permission of role.permissions) {
        permissions.add(permission.name);
      }
    }

    return [...permissions];
  }
}
