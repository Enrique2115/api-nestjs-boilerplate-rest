import { registerAs } from '@nestjs/config';

export const appConfig = registerAs('app', () => ({
  PORT: process.env.PORT,
  HOST: process.env.HOST,
  NODE_ENV: process.env.NODE_ENV,
}));

export const redisConfig = registerAs('redis', () => ({
  HOST: process.env.REDIS_HOST,
  PORT: process.env.REDIS_PORT,
  USERNAME: process.env.REDIS_USERNAME,
  PASSWORD: process.env.REDIS_PASSWORD,
  DB: process.env.REDIS_DB || '0',
  CONNECT_TIMEOUT: process.env.REDIS_CONNECT_TIMEOUT || '10000',
  COMMAND_TIMEOUT: process.env.REDIS_COMMAND_TIMEOUT || '5000',
  RETRY_DELAY_ON_FAILURE: process.env.REDIS_RETRY_DELAY_ON_FAILURE || '100',
  MAX_RETRIES: process.env.REDIS_MAX_RETRIES || '3',
  ENABLE_TLS: process.env.REDIS_ENABLE_TLS,
  TLS_REJECT_UNAUTHORIZED: process.env.REDIS_TLS_REJECT_UNAUTHORIZED,
  POOL_SIZE: process.env.REDIS_POOL_SIZE || '10',
  ENABLE_OFFLINE_QUEUE: process.env.REDIS_ENABLE_OFFLINE_QUEUE,
}));

export const databaseConfig = registerAs('database', () => ({
  TYPE: process.env.DATABASE_TYPE,
  URL: process.env.DATABASE_URL,
}));

export const jwtConfig = registerAs('jwt', () => ({
  SECRET: process.env.JWT_SECRET,
  EXPIRES_IN: process.env.JWT_EXPIRES_IN,
}));
