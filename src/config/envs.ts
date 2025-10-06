import 'dotenv/config';

import * as joi from 'joi';

interface EnvVars {
  PORT: number;
  HOST: string;
  NODE_ENV: string;
  REDIS_HOST: string;
  REDIS_USERNAME?: string;
  REDIS_PASSWORD?: string;
  REDIS_PORT: number;
  REDIS_DB?: number;
  REDIS_CONNECT_TIMEOUT?: number;
  REDIS_COMMAND_TIMEOUT?: number;
  REDIS_RETRY_DELAY_ON_FAILURE?: number;
  REDIS_MAX_RETRIES?: number;
  REDIS_ENABLE_TLS?: boolean;
  REDIS_TLS_REJECT_UNAUTHORIZED?: boolean;
  REDIS_POOL_SIZE?: number;
  REDIS_ENABLE_OFFLINE_QUEUE?: boolean;
  DATABASE_TYPE: string;
  DATABASE_URL: string;
}

const envsSchema = joi
  .object<EnvVars>({
    PORT: joi.number().required(),
    HOST: joi.string().required(),
    NODE_ENV: joi
      .string()
      .valid('development', 'production', 'test')
      .required(),
    REDIS_HOST: joi.string().required(),
    REDIS_USERNAME: joi.string().optional().allow(''),
    REDIS_PASSWORD: joi.string().optional().allow(''),
    REDIS_PORT: joi.number().port().required(),
    REDIS_DB: joi.number().integer().min(0).max(15).optional().default(0),
    REDIS_RETRY_DELAY_ON_FAILURE: joi
      .number()
      .integer()
      .min(100)
      .optional()
      .default(100),
    REDIS_MAX_RETRIES: joi.number().integer().min(0).optional().default(3),
    REDIS_ENABLE_TLS: joi.boolean().optional(),
    REDIS_TLS_REJECT_UNAUTHORIZED: joi.boolean().optional().default(true),
    REDIS_POOL_SIZE: joi
      .number()
      .integer()
      .min(1)
      .max(100)
      .optional()
      .default(10),
    REDIS_ENABLE_OFFLINE_QUEUE: joi.boolean().optional().default(true),
    DATABASE_TYPE: joi.string().required(),
    DATABASE_URL: joi.string().required(),
  })
  .unknown(true);

const { error, value } = envsSchema.validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

const envVars: EnvVars = value;

export const envs = {
  PORT: envVars.PORT,
  HOST: envVars.HOST,
  NODE_ENV: envVars.NODE_ENV,
  REDIS: {
    HOST: envVars.REDIS_HOST,
    PORT: envVars.REDIS_PORT,
    USERNAME: envVars.REDIS_USERNAME,
    PASSWORD: envVars.REDIS_PASSWORD,
    DB: envVars.REDIS_DB || 0,
    CONNECT_TIMEOUT: envVars.REDIS_CONNECT_TIMEOUT || 10_000,
    COMMAND_TIMEOUT: envVars.REDIS_COMMAND_TIMEOUT || 5000,
    RETRY_DELAY_ON_FAILURE: envVars.REDIS_RETRY_DELAY_ON_FAILURE || 100,
    MAX_RETRIES: envVars.REDIS_MAX_RETRIES || 3,
    ENABLE_TLS: envVars.REDIS_ENABLE_TLS ?? envVars.NODE_ENV === 'production',
    TLS_REJECT_UNAUTHORIZED: envVars.REDIS_TLS_REJECT_UNAUTHORIZED ?? true,
    POOL_SIZE: envVars.REDIS_POOL_SIZE || 10,
    ENABLE_OFFLINE_QUEUE: envVars.REDIS_ENABLE_OFFLINE_QUEUE ?? true,
  },
  DATABASE: {
    TYPE: envVars.DATABASE_TYPE,
    URL: envVars.DATABASE_URL,
  },
};
