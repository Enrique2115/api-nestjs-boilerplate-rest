/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import 'dotenv/config';

import * as joi from 'joi';

interface EnvVars {
  PORT: number;
  HOST: string;
  NODE_ENV: string;
}

const envsSchema = joi
  .object<EnvVars>({
    PORT: joi.number().required(),
    HOST: joi.string().required(),
    NODE_ENV: joi.string().required(),
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
};
