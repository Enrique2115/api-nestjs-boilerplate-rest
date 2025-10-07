import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoggerModule as PinoLoggerModule } from 'nestjs-pino';

import { LoggerInterceptor } from './logger.interceptor';
import { LoggerStrategy } from './logger.strategy';

@Module({
  imports: [
    PinoLoggerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        pinoHttp: {
          transport:
            configService.get<string>('app.NODE_ENV') === 'development'
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
          level:
            configService.get<string>('app.NODE_ENV') === 'development'
              ? 'debug'
              : 'info',
        },
      }),
    }),
  ],
  providers: [LoggerStrategy, LoggerInterceptor],
  exports: [LoggerStrategy, LoggerInterceptor],
})
export class LoggerModule {}
