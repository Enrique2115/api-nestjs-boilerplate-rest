import { Injectable, LoggerService } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';

import { isLogLevel, LogLevel } from './logger.types';

@Injectable()
export class LoggerStrategy implements LoggerService {
  constructor(private readonly logger: PinoLogger) {}

  public log(message: string): void;

  public log(level: LogLevel, message: string): void;

  public log(levelOrMessage: LogLevel | string, message?: string) {
    const logLevel = isLogLevel(levelOrMessage)
      ? levelOrMessage
      : LogLevel.info;
    const messageToLog =
      isLogLevel(levelOrMessage) && message ? message : levelOrMessage;

    this.logger.info({ level: logLevel, message: messageToLog });
  }

  public error(message: string) {
    this.log(LogLevel.error, message);
  }
  public warn(message: string) {
    this.log(LogLevel.warn, message);
  }
  public debug(message: string) {
    this.log(LogLevel.debug, message);
  }
  public verbose(message: string) {
    this.log(LogLevel.verbose, message);
  }

  public http(message: string) {
    this.log(LogLevel.http, message);
  }

  public info(message: string) {
    this.log(LogLevel.info, message);
  }
}
