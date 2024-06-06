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
}

const envsSchema = joi
  .object<EnvVars & CloudinaryConfig>({
    PORT: joi.number().required(),
    HOST: joi.string().required(),
    NODE_ENV: joi.string().required(),
    API_NAME: joi.string().required(),
    API_KEY: joi.string().required(),
    API_SECRET: joi.string().required(),
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
};
