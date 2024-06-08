/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import 'dotenv/config';

import * as joi from 'joi';

type CloudinaryConfig = {
  API_NAME: string;
  API_KEY: string;
  API_SECRET: string;
};

interface EnvVars {
  PORT: number;
  HOST: string;
  NODE_ENV: string;
  REDIS_HOST: string;
  REDIS_USERNAME: string;
  REDIS_PASSWORD: string;
  REDIS_PORT: number;
  JWT_SECRET: string;
  DATABASE_TYPE: string;
  DATABASE_URL: string;
}

const envsSchema = joi
  .object<EnvVars & CloudinaryConfig>({
    PORT: joi.number().required(),
    HOST: joi.string().required(),
    NODE_ENV: joi.string().required(),
    API_NAME: joi.string().required(),
    API_KEY: joi.string().required(),
    API_SECRET: joi.string().required(),
    REDIS_HOST: joi.string().required(),
    REDIS_USERNAME: joi.string().required(),
    REDIS_PASSWORD: joi.string().required(),
    REDIS_PORT: joi.number().required(),
    JWT_SECRET: joi.string().required(),
    DATABASE_TYPE: joi.string().required(),
    DATABASE_URL: joi.string().required(),
  })
  .unknown(true);

const { error, value } = envsSchema.validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

const envVars: EnvVars & CloudinaryConfig = value;

export const envs = {
  PORT: envVars.PORT,
  HOST: envVars.HOST,
  NODE_ENV: envVars.NODE_ENV,
  CLOUDINARY: {
    API_NAME: envVars.API_NAME,
    API_KEY: envVars.API_KEY,
    API_SECRET: envVars.API_SECRET,
  },
  REDIS: {
    HOST: envVars.REDIS_HOST,
    PORT: envVars.REDIS_PORT,
    USERNAME: envVars.REDIS_USERNAME,
    PASSWORD: envVars.REDIS_PASSWORD,
  },
  JWT: {
    SECRET: envVars.JWT_SECRET,
  },
  DATABASE: {
    TYPE: envVars.DATABASE_TYPE,
    URL: envVars.DATABASE_URL,
  },
};
