import { Module } from '@nestjs/common';

import { ErrorResponseNormalizerFilter } from './error-response.filter';
import { SuccessResponseNormalizerInterceptor } from './success-response.interceptor';

@Module({
  providers: [
    ErrorResponseNormalizerFilter,
    SuccessResponseNormalizerInterceptor,
  ],
  exports: [
    ErrorResponseNormalizerFilter,
    SuccessResponseNormalizerInterceptor,
  ],
})
export class ResponseNormalizerModule {}
