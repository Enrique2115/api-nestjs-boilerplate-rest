import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';

import { envs } from '@src/config';

import {
  AuthService,
  BcryptService,
  JwtServices,
  RoleService,
  SignInUseCase,
  SignUpUseCase,
} from '@core/auth/application';
import { RefreshTokenEntity, RoleEntity, UserEntity } from '@core/auth/domain';
import {
  AuthRespository,
  JwtAdminStrategy,
  JwtStrategy,
  RoleRepository,
} from '@core/auth/infraestructure';
import { AuthController } from '@core/auth/presentation';

import { RedisService } from '../redis/redis.service';

@Module({
  imports: [
    PassportModule,
    TypeOrmModule.forFeature([UserEntity, RoleEntity, RefreshTokenEntity]),
    JwtModule.register({
      global: true,
      secret: envs.JWT.SECRET,
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    SignUpUseCase,
    SignInUseCase,
    RedisService,
    JwtStrategy,
    JwtAdminStrategy,
    {
      provide: 'IBcryptService',
      useClass: BcryptService,
    },
    {
      provide: 'IJwtService',
      useClass: JwtServices,
    },
    {
      provide: 'IAuthService',
      useClass: AuthService,
    },
    {
      provide: 'IRoleService',
      useClass: RoleService,
    },
    {
      provide: 'IAuthRepository',
      useClass: AuthRespository,
    },
    {
      provide: 'IRoleRepository',
      useClass: RoleRepository,
    },
  ],
})
export class AuthModule {}
