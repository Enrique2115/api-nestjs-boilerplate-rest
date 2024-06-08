/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';
import {
  CannotCreateEntityIdMapError,
  EntityNotFoundError,
  QueryFailedError,
} from 'typeorm';

export interface IResponseError {
  status: number;
  message: string;
  code: string;
  reasons?: any;
  path: string;
  method: string;
}

export interface IReason {
  message?: string[];
}

@Catch()
export class ErrorResponseNormalizerFilter implements ExceptionFilter {
  async catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();

    const request = ctx.getRequest<FastifyRequest>();

    const response = ctx.getResponse<FastifyReply>();

    let message: string = (exception as any).message;
    let code = 'HttpException';
    let status: number = HttpStatus.INTERNAL_SERVER_ERROR;
    let reasons: IReason = {};

    switch (exception.constructor) {
      case HttpException: {
        status = (exception as HttpException).getStatus();
        break;
      }
      case QueryFailedError: {
        status = HttpStatus.UNPROCESSABLE_ENTITY;
        message = (exception as QueryFailedError).message;
        // @ts-expect-error: Si existe el campo code ts(2339)
        code = (exception as QueryFailedError)?.code;
        break;
      }
      case EntityNotFoundError: {
        status = HttpStatus.UNPROCESSABLE_ENTITY;
        message = (exception as EntityNotFoundError).message;
        code = (exception as any).code;
        break;
      }
      case CannotCreateEntityIdMapError: {
        status = HttpStatus.UNPROCESSABLE_ENTITY;
        message = (exception as CannotCreateEntityIdMapError).message;
        code = (exception as any).code;
        break;
      }
      case BadRequestException: {
        status = (exception as HttpException).getStatus();
        reasons = (exception as HttpException).getResponse() as {
          message?: string[];
        };
        break;
      }
      default: {
        status = HttpStatus.INTERNAL_SERVER_ERROR;
      }
    }

    await response.status(status).send({
      error: this.mapToError(status, message, code, request, reasons),
    });
  }

  private mapToError(
    status: number,
    message: string,
    code: string,
    request: FastifyRequest,
    reasons: IReason,
  ): IResponseError {
    return {
      code,
      status,
      message,
      method: request.method,
      path: request.url,
      reasons: reasons?.message || [],
    };
  }
}
