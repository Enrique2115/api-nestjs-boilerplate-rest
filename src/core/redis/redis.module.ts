import KeyvRedis from '@keyv/redis';
import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';

import { redisConfig } from '@/src/config/redis.config';

import { RedisService } from './redis.service';

@Module({
  imports: [
    CacheModule.registerAsync({
      useFactory: async () => ({
        stores: [new KeyvRedis(redisConfig)],
      }),
    }),
  ],
  providers: [RedisService],
  exports: [RedisService],
})
export class RedisModule {}
