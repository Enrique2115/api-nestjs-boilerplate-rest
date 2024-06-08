import { FastifyRequest } from 'fastify';
import { ExtractJwt } from 'passport-jwt';

import { envs } from '@src/config';

export const jwtConfig = () => {
  return {
    jwtFromRequest: (req: FastifyRequest) => {
      const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);

      return token;
    },
    ignoreExpiration: false,
    secretOrKey: envs.JWT.SECRET,
    passReqToCallback: true,
  };
};
