import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';

import { envs } from '@src/config';

// Auth
import { AuthUseCase, JwtStrategy } from '@core/auth/application';
import { AuthInitService, JwtService } from '@core/auth/infrastructure';
import { AuthController } from '@core/auth/presentation';
// Permissions
import { PermissionUseCase } from '@core/permission/application';
import { Permission } from '@core/permission/domain';
import { PermissionRepository } from '@core/permission/infrastructure';
import { PermissionsController } from '@core/permission/presentation';
// Roles
import { RoleUseCase } from '@core/roles/application';
import { Role } from '@core/roles/domain';
import { RoleRepository } from '@core/roles/infrastructure';
import { RolesController } from '@core/roles/presentation';
// Users
import { UserUseCase } from '@core/users/application';
import { User } from '@core/users/domain';
import { UserRepository } from '@core/users/infrastructure';
import { UsersController } from '@core/users/presentation';

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
