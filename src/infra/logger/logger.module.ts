import { Module } from '@nestjs/common';
import { LoggerModule as PinoLoggerModule } from 'nestjs-pino';

import { envs } from '@src/config';

import { LoggerInterceptor } from './logger.interceptor';
import { LoggerStrategy } from './logger.strategy';

@Module({
  imports: [
    PinoLoggerModule.forRoot({
      pinoHttp: {
        transport:
          envs.NODE_ENV === 'development'
            ? {
                target: 'pino-pretty',
                options: {
                  colorize: true,
                  translateTime: 'SYS:h:MM:ss TT',
                  messageKey: 'message',
                  singleLine: true,
                  ignore: 'context,hostname',
                },
              }
            : undefined,
        messageKey: 'message',
        autoLogging: false,
        serializers: {
          req: () => {},
          res: () => {},
        },
        level: envs.NODE_ENV === 'developtment' ? 'debug' : 'info',
      },
    }),
  ],
  providers: [LoggerStrategy, LoggerInterceptor],
  exports: [LoggerStrategy, LoggerInterceptor],
})
export class LoggerModule {}
