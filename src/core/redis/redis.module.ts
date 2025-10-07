import KeyvRedis from '@keyv/redis';
import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';

import { RedisConfigService } from '@/src/config/redis.config';

import { EnviromentModule } from '../infra/enviroment/enviroment.module';
import { RedisService } from './redis.service';

@Module({
  imports: [
    EnviromentModule,
    CacheModule.registerAsync({
      imports: [EnviromentModule],
      inject: [RedisConfigService],
      useFactory: async (redisConfigService: RedisConfigService) => {
        const redisConfig = redisConfigService.getRedisConfig();
        return {
          stores: [new KeyvRedis(redisConfig)],
        };
      },
    }),
  ],
  providers: [RedisService],
  exports: [RedisService],
})
export class RedisModule {}
