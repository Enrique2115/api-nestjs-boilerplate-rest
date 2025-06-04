// Auth
import { AuthUseCase, JwtStrategy } from '@modules/auth/application';
import { AuthInitService, JwtService } from '@modules/auth/infrastructure';
import { AuthController } from '@modules/auth/presentation';
// Permissions
import { PermissionUseCase } from '@modules/permission/application';
import { Permission } from '@modules/permission/domain';
import { PermissionRepository } from '@modules/permission/infrastructure';
import { PermissionsController } from '@modules/permission/presentation';
// Roles
import { RoleUseCase } from '@modules/roles/application';
import { Role } from '@modules/roles/domain';
import { RoleRepository } from '@modules/roles/infrastructure';
import { RolesController } from '@modules/roles/presentation';
// Users
import { UserUseCase } from '@modules/users/application';
import { User } from '@modules/users/domain';
import { UserRepository } from '@modules/users/infrastructure';
import { UsersController } from '@modules/users/presentation';
// Nest
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';

import { envs } from '@src/config';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Role, Permission]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: envs.JWT.SECRET,
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [
    AuthController,
    UsersController,
    RolesController,
    PermissionsController,
  ],
  providers: [
    // Infrastructure
    UserRepository,
    RoleRepository,
    PermissionRepository,
    JwtService,
    AuthInitService,

    // Domain Use Cases
    {
      provide: AuthUseCase,
      useFactory: (userRepository, jwtService) => {
        return new AuthUseCase(userRepository, jwtService);
      },
      inject: [UserRepository, JwtService],
    },
    {
      provide: UserUseCase,
      useFactory: (userRepository, roleRepository) => {
        return new UserUseCase(userRepository, roleRepository);
      },
      inject: [UserRepository, RoleRepository],
    },
    {
      provide: RoleUseCase,
      useFactory: (roleRepository, permissionRepository) => {
        return new RoleUseCase(roleRepository, permissionRepository);
      },
      inject: [RoleRepository, PermissionRepository],
    },
    {
      provide: PermissionUseCase,
      useFactory: permissionRepository => {
        return new PermissionUseCase(permissionRepository);
      },
      inject: [PermissionRepository],
    },
    {
      provide: JwtStrategy,
      useFactory: jwtService => {
        return new JwtStrategy(jwtService);
      },
      inject: [AuthUseCase],
    },
  ],
  exports: [
    AuthUseCase,
    UserUseCase,
    RoleUseCase,
    PermissionUseCase,
    JwtStrategy,
    PassportModule,
  ],
})
export class AuthModule {}
