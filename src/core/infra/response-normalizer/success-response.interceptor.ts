import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
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

@Injectable()
export class SuccessResponseNormalizerInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    return next.handle().pipe(
      map((response: T | ResponseWithMessage<T>) => {
        // Si la respuesta ya tiene la estructura { message, data }
        if (this.isResponseWithMessage(response)) {
          return {
            message: response.message,
            data: response.data,
          };
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
}
