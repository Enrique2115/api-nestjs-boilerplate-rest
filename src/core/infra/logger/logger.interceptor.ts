import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';
import { tap } from 'rxjs';

import { CORRELATION_ID_HEADER } from '../shared/middleware/correlation-id.middleware';
import { LoggerStrategy } from './logger.strategy';

@Injectable()
export class LoggerInterceptor implements NestInterceptor {
  public constructor(private readonly logger: LoggerStrategy) {}

  intercept(context: ExecutionContext, next: CallHandler) {
    if (context.getType() === 'http') {
      return this.logHttp(context, next);
    }
  }

  private logHttp(context: ExecutionContext, next: CallHandler) {
    const { ip, method, headers, url } = context
      .switchToHttp()
      .getRequest<FastifyRequest>();

    const userAgent = headers['user-agent'] || '';
    const correlationKey = headers[CORRELATION_ID_HEADER].toString() || '';

    const message = `[${correlationKey}] ${method} ${url} User Agent: ${userAgent} - IP: ${ip} Path: ${context.getClass().name} ${context.getHandler().name}`;

    this.logger.log(message);

    const now = Date.now();

    return next.handle().pipe(
      tap(() => {
        const { statusCode } = context
          .switchToHttp()
          .getResponse<FastifyReply>();

        const contentLength = headers['content-length'] || 0;

        const message = `[${correlationKey}] ${method} ${url} Status: ${statusCode} Content ${contentLength}: ${Date.now() - now}ms`;

        this.logger.log(message);
      }),
    );
  }
}
