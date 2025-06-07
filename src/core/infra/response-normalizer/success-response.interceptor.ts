import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Paginated } from 'nestjs-paginate';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  message?: string;
  data: T;
}

export interface ResponseWithMessage<T> {
  message: string;
  data: T;
}

type PaginatedResponse = Paginated<unknown>;

@Injectable()
export class SuccessResponseNormalizerInterceptor<T>
  implements NestInterceptor<T, Response<T> | T>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T> | T> {
    return next.handle().pipe(
      map((response: T | ResponseWithMessage<T>) => {
        // Si la respuesta ya tiene la estructura { message, data }
        if (this.isResponseWithMessage(response)) {
          return {
            message: response.message,
            data: response.data,
          };
        }
        // Si es una respuesta paginada, devolverla directamente sin envolver
        if (this.isPaginatedResponse(response)) {
          return response as T;
        }
        // Si es solo data, envolver en el formato estándar
        return {
          data: response as T,
        };
      }),
    );
  }

  private isResponseWithMessage<T>(
    response: T | ResponseWithMessage<T>,
  ): response is ResponseWithMessage<T> {
    return (
      response &&
      typeof response === 'object' &&
      'message' in response &&
      'data' in response &&
      typeof response.message === 'string'
    );
  }

  private isPaginatedResponse(
    response: unknown,
  ): response is PaginatedResponse {
    return (
      response &&
      typeof response === 'object' &&
      'data' in response &&
      'meta' in response &&
      'links' in response &&
      Array.isArray(response.data) &&
      typeof response.meta === 'object' &&
      typeof response.links === 'object'
    );
  }
}
