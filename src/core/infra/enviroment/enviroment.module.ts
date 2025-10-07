import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import {
  appConfig,
  databaseConfig,
  envsSchema,
  redisConfig,
} from '@/src/config';
import { RedisConfigService } from '@/src/config/redis.config';

import { TypedConfigService } from './config.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, redisConfig, databaseConfig],
      validationSchema: envsSchema,
      cache: true,
      expandVariables: true,
    }),
  ],
  providers: [TypedConfigService, RedisConfigService],
  exports: [TypedConfigService, RedisConfigService],
})
export class EnviromentModule {}
