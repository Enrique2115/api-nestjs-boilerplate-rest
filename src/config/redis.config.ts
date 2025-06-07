import { RedisClientOptions } from '@keyv/redis';

import { envs } from './envs';

export const redisConfig: RedisClientOptions = {
  url: `redis://${envs.REDIS.HOST}:${envs.REDIS.PORT}`,
  username: envs.REDIS.USERNAME,
  password: envs.REDIS.PASSWORD,
  socket: {
    host: envs.REDIS.HOST,
    tls: envs.NODE_ENV === 'production' ? false : true,
    reconnectStrategy: retries => {
      if (retries > 3) {
        return new Error('Retry time exhausted');
      }
      return Math.min(retries * 10, 2000);
    },
    keepAlive: 30_000,
  },
};
