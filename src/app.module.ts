import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';

import { HealthModule } from './core/health/health.module';
import { LoggerModule } from './infra/logger/logger.module';
import { ResponseNormalizerModule } from './infra/response-normalizer/response-normalizer.module';
import { CorrelationIdMiddleware } from './infra/shared/middleware/correlation-id.middleware';

@Module({
  imports: [LoggerModule, ResponseNormalizerModule, HealthModule],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorrelationIdMiddleware).forRoutes('*');
  }
}
